import sys
import json
import os
import re
import zipfile
import requests
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.drawing.image import Image as OpenpyxlImage
from PIL import Image as PILImage
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

# 1. 경매 번호 또는 날짜 타겟 세팅! 
# (경매 번호 숫자(예: 1049)를 직접 지정하거나, 경매 날짜(예: "6_17", "6/17", "2026-06-17")를 문자열로 써서 조회할 수도 있습니다)
target_auction = "5_20"
if len(sys.argv) > 1:
    target_auction = sys.argv[1]

# 2. 타겟 연도 세팅! (지정하지 않거나 'all'로 지정하면 모든 연도를 검색합니다)
target_year = None
if len(sys.argv) > 2:
    val = sys.argv[2].strip()
    if val.lower() not in ["all", "", "none"]:
        target_year = val

# 2. 서울옥션 API 서버 요청용 공통 세팅
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
}

session = requests.Session()
session.headers.update(headers)

def parse_json_field(field):
    """
    JSON 문자열 또는 딕셔너리 필드를 파싱하여 파이썬 딕셔너리로 반환합니다.
    """
    if not field:
        return {}
    if isinstance(field, dict):
        return field
    try:
        return json.loads(field)
    except Exception:
        return {}

def sanitize_filename(name):
    """
    윈도우 파일 시스템에서 허용되지 않는 특수문자를 제거합니다.
    """
    return re.sub(r'[\\/*?:"<>|]', '_', name).strip()

def sanitize_sheet_title(title):
    r"""
    엑셀 시트 탭 이름에 사용할 수 없는 문자(\ / ? * : [ ])를 제거하고 31자로 제한합니다.
    """
    clean_title = re.sub(r'[\\/?*:[\]]', '', title)
    return clean_title[:31].strip()

def date_matches(dt_str, target_date_input, target_year=None):
    """
    체크할 날짜 문자열(예: '2026-06-17 14:00:00')이 
    사용자가 입력한 타겟 날짜(예: '6_17', '6/17', '2026-06-17')와 일치하는지 정밀 비교합니다.
    """
    if not dt_str or not target_date_input:
        return False
        
    # 사용자 입력 및 API 일시 정제 (구분자 통일)
    target = str(target_date_input).strip().replace("/", "_").replace("-", "_")
    
    match = re.match(r'(\d{4})-(\d{2})-(\d{2})', dt_str)
    if not match:
        return False
        
    year, month, day = match.groups()
    
    # 만약 타겟 연도가 지정되어 있고, 경매의 연도와 다르면 불일치로 처리
    if target_year and str(year) != str(target_year):
        return False
        
    m_int, d_int = int(month), int(day)
    
    # 일치할 수 있는 후보 날짜 문자열 조합
    candidates = [
        f"{m_int}_{d_int}",          # '6_17'
        f"{month}_{day}",            # '06_17'
        f"{year}_{month}_{day}",      # '2026_06_17'
        f"{year}_{m_int}_{d_int}",    # '2026_6_17'
        f"{month}_{d_int}",          # '06_17'
        f"{m_int}_{day}"             # '6_17'
    ]
    
    return target in candidates

def find_auction_by_date(target_date_input, session, target_year=None):
    """
    진행 중, 예정, 완료 경매 목록을 교차 조회하여 날짜 혹은 타이틀에 부합하는 경매 정보를 찾습니다.
    """
    all_auctions = []
    
    # 1. 진행 중 경매 목록
    try:
        r = session.get("https://www.seoulauction.com/api/auction/progress", timeout=5)
        if r.status_code == 200:
            all_auctions.extend(r.json().get("data", []))
    except Exception:
        pass

    # 2. 예정된 경매 목록
    try:
        r = session.get("https://www.seoulauction.com/api/auction/upcoming", timeout=5)
        if r.status_code == 200:
            all_auctions.extend(r.json().get("data", []))
    except Exception:
        pass

    # 3. 완료된 경매 결과 목록 (최근 500개)
    try:
        r = session.post(
            "https://www.seoulauction.com/api/auction/results",
            json={"from": 0, "rows": 500, "sale_kind_cd": None, "find_word": None},
            timeout=8
        )
        if r.status_code == 200:
            all_auctions.extend(r.json().get("data", {}).get("list", []))
    except Exception:
        pass

    # 중복 제거 (SALE_NO 기준)
    seen = set()
    unique_auctions = []
    for a in all_auctions:
        s_no = a.get("SALE_NO")
        if s_no and s_no not in seen:
            seen.add(s_no)
            unique_auctions.append(a)
            
    # 1단계: 날짜 데이터 정밀 비교
    for a in unique_auctions:
        to_dt = a.get("TO_DT", "")
        from_dt = a.get("FROM_DT", "")
        if date_matches(to_dt, target_date_input, target_year) or date_matches(from_dt, target_date_input, target_year):
            return a
            
    # 2단계: 타이틀 내 날짜 검색 (예: '6/17' 부분 일치 탐색)
    cleaned_target = str(target_date_input).strip()
    target_variants = [
        cleaned_target,
        cleaned_target.replace("/", "_"),
        cleaned_target.replace("_", "/"),
        cleaned_target.replace("-", "/")
    ]
    
    for a in unique_auctions:
        # 타이틀 검색에서도 연도 조건이 있다면 필터링
        if target_year:
            to_dt = a.get("TO_DT", "")
            from_dt = a.get("FROM_DT", "")
            dt_to_check = to_dt or from_dt
            if dt_to_check:
                match = re.match(r'(\d{4})', dt_to_check)
                if match and match.group(1) != str(target_year):
                    continue
                    
        title_dict = parse_json_field(a.get("TITLE_JSON"))
        title_ko = title_dict.get("ko", "").lower()
        title_en = title_dict.get("en", "").lower()
        
        for variant in target_variants:
            v_low = variant.lower()
            if v_low in title_ko or v_low in title_en:
                return a
                
    return None

def fetch_auction_metadata(auction_id, session):
    """
    경매 ID를 바탕으로 일자와 명칭을 상세 조회합니다.
    """
    try:
        # 이미 수집된 목록이나 캐시 등을 활용해 특정 ID 정보 매칭
        r = session.post(
            "https://www.seoulauction.com/api/auction/results",
            json={"from": 0, "rows": 500, "sale_kind_cd": None, "find_word": None},
            timeout=8
        )
        if r.status_code == 200:
            for a in r.json().get("data", {}).get("list", []):
                if a.get("SALE_NO") == auction_id:
                    return a
    except Exception:
        pass
        
    # 진행/예정 경매도 폴백으로 조회
    for path in ["progress", "upcoming"]:
        try:
            r = session.get(f"https://www.seoulauction.com/api/auction/{path}", timeout=5)
            if r.status_code == 200:
                for a in r.json().get("data", []):
                    if a.get("SALE_NO") == auction_id:
                        return a
        except Exception:
            pass
    return None

def format_date_to_md(date_str):
    """
    '2026-06-17 14:00:00' 포맷의 날짜를 '6_17' 형태로 변환합니다.
    """
    if not date_str:
        return ""
    match = re.match(r'(\d{4})-(\d{2})-(\d{2})', date_str)
    if match:
        _, month, day = match.groups()
        return f"{int(month)}_{int(day)}"
    return ""

# 경매 번호 결정
target_str = str(target_auction).strip()
if target_str.isdigit():
    auction_id = int(target_str)
    print(f"➔ 입력한 경매 번호: {auction_id}")
else:
    if target_year:
        print(f"➔ 입력한 날짜 기반 경매 검색 중 (연도 필터: {target_year}): '{target_str}'")
    else:
        print(f"➔ 입력한 날짜 기반 경매 검색 중: '{target_str}'")
        
    matched_auction = find_auction_by_date(target_str, session, target_year)
    if matched_auction:
        auction_id = matched_auction.get("SALE_NO")
        print(f"    -> 매칭된 경매 ID를 찾았습니다: SALE_NO={auction_id}")
    else:
        if target_year:
            print(f"    -> ❌ 입력한 날짜/타이틀 '{target_str}' (연도: {target_year})에 매칭되는 경매를 찾지 못했습니다.")
        else:
            print(f"    -> ❌ 입력한 날짜/타이틀 '{target_str}'에 매칭되는 경매를 찾지 못했습니다.")
        sys.exit(1)

# 경매 상세 메타데이터(일자, 명칭) 조회
auction_info = fetch_auction_metadata(auction_id, session)

date_suffix = str(auction_id)
auction_title_str = f"{auction_id}번 경매"

if auction_info:
    title_dict = parse_json_field(auction_info.get("TITLE_JSON"))
    auction_title_str = title_dict.get("ko", title_dict.get("en", f"{auction_id}번 경매")).strip()
    to_dt = auction_info.get("TO_DT", "")
    from_dt = auction_info.get("FROM_DT", "")
    
    formatted_date = format_date_to_md(to_dt or from_dt)
    if formatted_date:
        date_suffix = formatted_date
        
    print(f"    -> 경매 명칭: {auction_title_str}")
    print(f"    -> 경매 일정(종료): {to_dt or '정보 없음'}")
else:
    print("    -> ⚠️ 경매 메타정보를 찾지 못했습니다. 파일명에 경매 번호를 대신 사용합니다.")

# 윈도우 파일 시스템 및 엑셀 시트에 맞는 텍스트 정제
auction_title_clean = sanitize_filename(auction_title_str)
sheet_tab_title = sanitize_sheet_title(auction_title_str)

# 작품 정보 API 조회
api_url = f"https://www.seoulauction.com/api/auction/live/list/{auction_id}"
params = {"size": 500}
response = session.get(api_url, params=params)

def parse_size_array(size_array_str):
    """
    크기(LOT_SIZE_ARRAY) JSON 문자열을 보기 좋은 텍스트(예: 32.3 × 24 cm)로 파싱합니다.
    """
    if not size_array_str:
        return ""
    try:
        sizes = json.loads(size_array_str)
        if not isinstance(sizes, list):
            return ""
        
        formatted_items = []
        for s in sizes:
            parts = []
            
            # 1. 접두사 (예: 'leaf:', 'each' 등)
            prefix = s.get("PREFIX", "").strip() if s.get("PREFIX") else ""
            if prefix:
                parts.append(prefix)
            
            # 2. 규격 수치 (SIZE1, SIZE2, SIZE3)
            dims = []
            for dim_name in ["SIZE1", "SIZE2", "SIZE3"]:
                val = s.get(dim_name)
                if val is not None:
                    try:
                        val_f = float(val)
                        if val_f > 0:
                            # 소수점이 없을 땐 정수로, 있을 땐 소수점 그대로 표기
                            if val_f.is_integer():
                                dims.append(str(int(val_f)))
                            else:
                                dims.append(f"{val_f:g}")
                    except ValueError:
                        pass
            
            if dims:
                # 곱하기 기호 ' × ' (Unicode \u00d7) 사용
                parts.append(" × ".join(dims))
            
            # 3. 단위 (예: 'cm')
            unit = s.get("UNIT_CD", "").strip() if s.get("UNIT_CD") else ""
            if unit and dims:
                parts.append(unit)
            
            # 4. 접미사 (예: '10pcs' 등)
            suffix = s.get("SUFFIX", "").strip() if s.get("SUFFIX") else ""
            if suffix:
                parts.append(suffix)
                
            # 하나로 합치고 중복 방지
            item_str = " ".join(parts)
            if item_str and item_str not in formatted_items:
                formatted_items.append(item_str)
                
        return ", ".join(formatted_items)
    except Exception:
        return ""

def download_image(lot, folder_path, session):
    """
    작품 한 개의 고화질 이미지를 다운로드하여 저장합니다.
    """
    lot_no = lot.get("LOT_NO")
    artist_dict = lot.get("ARTIST_NAME_JSON") or {}
    artist_name = artist_dict.get("ko", artist_dict.get("en", "")).strip()
    if not artist_name:
        artist_name = "Unknown"
        
    title_dict = lot.get("LOT_TITLE_JSON") or {}
    title = title_dict.get("ko", title_dict.get("en", "")).strip()
    if not title:
        title = "무제"
        
    img_path = lot.get("LOT_IMG_PATH")
    img_name = lot.get("LOT_IMG_NAME")
    
    if not img_path or not img_name:
        return lot_no, "No image path/name", None
        
    artist_clean = sanitize_filename(artist_name)
    title_clean = sanitize_filename(title)
    
    filename = f"[Lot {lot_no:03d}] {artist_clean} - {title_clean}.jpg"
    dest_path = os.path.join(folder_path, filename)
    
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return lot_no, "Skipped (Already exists)", dest_path
        
    img_url = f"https://public.seoulauction.io{img_path}/{img_name}"
    
    try:
        r = session.get(img_url, timeout=15)
        if r.status_code == 200:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            return lot_no, "Success", dest_path
        else:
            return lot_no, f"HTTP Error {r.status_code}", None
    except Exception as e:
        return lot_no, f"Error: {e}", None

if response.status_code == 200:
    data = response.json()
    if data.get("success"):
        lots = data.get("data", {}).get("list", [])
        print(f"➔ 성공적으로 작품 데이터를 가져왔습니다. (총 {len(lots)}건)")
        
        # 3. 작품 사진 폴더 생성 및 이미지 다운로드 우선 진행
        # 폴더명에도 경매 이름 포함
        folder_name = f"작품사진_{date_suffix}_{auction_title_clean}"
        os.makedirs(folder_name, exist_ok=True)
        print(f"\n➔ 작품 사진 다운로드 및 저장 중... (폴더명: {folder_name})")
        
        lot_image_paths = {}
        success_count = 0
        skipped_count = 0
        failed_lots = []
        
        total_lots = len(lots)
        completed = 0
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(download_image, lot, folder_name, session): lot for lot in lots}
            
            for future in as_completed(futures):
                completed += 1
                lot_no, status, file_path = future.result()
                if file_path:
                    lot_image_paths[lot_no] = file_path
                    
                if status == "Success":
                    success_count += 1
                elif "Skipped" in status:
                    skipped_count += 1
                else:
                    failed_lots.append((lot_no, status))
                    
                if completed % 20 == 0 or completed == total_lots:
                    print(f"    -> 다운로드 진행률: [{completed}/{total_lots}] 완료...")
                    
        print(f"➔ 사진 다운로드 완료 (새로받음: {success_count}건, 건너뜀: {skipped_count}건, 실패: {len(failed_lots)}건)")
        if failed_lots:
            print("    -> 다운로드 실패 목록:")
            for l_no, err in failed_lots[:10]:
                print(f"       - Lot {l_no}: {err}")
        
        # 4. 데이터 정제하기
        parsed_lots = []
        for lot in lots:
            lot_no = lot.get("LOT_NO")
            
            # 작가명
            artist_dict = lot.get("ARTIST_NAME_JSON") or {}
            artist_name = artist_dict.get("ko", artist_dict.get("en", "")).strip()
            
            # 작품명
            title_dict = lot.get("LOT_TITLE_JSON") or {}
            title = title_dict.get("ko", title_dict.get("en", "")).strip()
            
            # 재료/기법
            mate_dict = lot.get("MATE_CD") or {}
            mate = mate_dict.get("ko", mate_dict.get("en", "")).strip()
            
            # 제작년도
            year_dict = lot.get("MAKE_YEAR_JSON") or {}
            year = year_dict.get("ko", year_dict.get("en", "")).strip()
            
            # 크기
            size = parse_size_array(lot.get("LOT_SIZE_ARRAY"))
            
            # 가격 정보
            price_from = lot.get("EXPE_PRICE_FROM_JSON", {}).get("KRW")
            price_to = lot.get("EXPE_PRICE_TO_JSON", {}).get("KRW")
            start_price = price_from
            
            # 낙찰 정보
            max_bid = lot.get("MAX_BID_PRICE")
            if max_bid is not None:
                bid_price = int(max_bid)
                result = "낙찰"
            else:
                bid_price = None
                result = "유찰"
                
            parsed_lots.append({
                "lot_no": lot_no,
                "artist_name": artist_name,
                "title": title,
                "mate": mate,
                "year": year,
                "size": size,
                "price_from": price_from,
                "price_to": price_to,
                "start_price": start_price,
                "bid_price": bid_price,
                "result": result
            })
            
        # 5. 엑셀 워크북 생성 및 스타일 적용
        print("\n➔ 엑셀 문서 작성 및 작품 이미지 직접 삽입 중...")
        wb = openpyxl.Workbook()
        ws = wb.active
        
        # 엑셀 시트 탭 이름에 경매 명칭 적용
        ws.title = sheet_tab_title
        ws.views.sheetView[0].showGridLines = True
        
        font_family = '맑은 고딕'
        header_font = Font(name=font_family, size=11, bold=True, color='FFFFFF')
        data_font = Font(name=font_family, size=10)
        
        header_fill = PatternFill(start_color='2A4B7C', end_color='2A4B7C', fill_type='solid') # 네이비
        even_row_fill = PatternFill(start_color='F5F7FA', end_color='F5F7FA', fill_type='solid') # 연회색
        
        sold_font = Font(name=font_family, size=10, bold=True, color='1B5E20')
        sold_fill = PatternFill(start_color='E8F5E9', end_color='E8F5E9', fill_type='solid') # 연초록
        unsold_font = Font(name=font_family, size=10, color='757575')
        unsold_fill = PatternFill(start_color='F5F5F5', end_color='F5F5F5', fill_type='solid') # 연회색
        
        align_center = Alignment(horizontal='center', vertical='center')
        align_left = Alignment(horizontal='left', vertical='center')
        align_right = Alignment(horizontal='right', vertical='center')
        
        thin_border_side = Side(border_style='thin', color='D2D6DC')
        thin_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
        
        headers = [
            'Lot', '이미지', '작가명', '작품명', '재료/기법', '제작년도', '크기', 
            '추정가 최저(KRW)', '추정가 최고(KRW)', '시작가(KRW)', '낙찰가(KRW)', '결과'
        ]
        ws.append(headers)
        
        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_idx)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = align_center
            cell.border = thin_border
            
        for row_idx, row_data in enumerate(parsed_lots, start=2):
            row_fill = even_row_fill if row_idx % 2 == 0 else None
            ws.row_dimensions[row_idx].height = 45
            
            lot_no = row_data["lot_no"]
            values = [
                lot_no,
                "",  # 이미지 들어갈 자리
                row_data["artist_name"],
                row_data["title"],
                row_data["mate"],
                row_data["year"],
                row_data["size"],
                row_data["price_from"],
                row_data["price_to"],
                row_data["start_price"],
                row_data["bid_price"],
                row_data["result"]
            ]
            
            for col_idx, val in enumerate(values, start=1):
                cell = ws.cell(row=row_idx, column=col_idx, value=val)
                cell.font = data_font
                cell.border = thin_border
                
                if row_fill:
                    cell.fill = row_fill
                    
                if col_idx in [1, 6]:  # Lot, 제작년도
                    cell.alignment = align_center
                elif col_idx in [8, 9, 10, 11]:  # 금액
                    cell.alignment = align_right
                    cell.number_format = '#,##0'
                elif col_idx == 12:  # 결과
                    cell.alignment = align_center
                    if val == '낙찰':
                        cell.font = sold_font
                        cell.fill = sold_fill
                    else:
                        cell.font = unsold_font
                        cell.fill = unsold_fill
                else:
                    cell.alignment = align_left
            
            # 이미지 삽입
            local_img_path = lot_image_paths.get(lot_no)
            if local_img_path and os.path.exists(local_img_path):
                try:
                    with PILImage.open(local_img_path) as pil_img:
                        orig_width, orig_height = pil_img.size
                        aspect_ratio = orig_width / orig_height
                        new_height = 50
                        new_width = int(new_height * aspect_ratio)
                    
                    xl_img = OpenpyxlImage(local_img_path)
                    xl_img.width = new_width
                    xl_img.height = new_height
                    ws.add_image(xl_img, f"B{row_idx}")
                except Exception as img_err:
                    print(f"       - Lot {lot_no} 이미지 삽입 중 오류: {img_err}")
                    
        # 열 너비 자동 조정
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            col_idx = col[0].column
            
            if col_idx == 2:
                ws.column_dimensions[col_letter].width = 12
                continue
                
            for cell in col:
                if cell.value is not None:
                    val_str = str(cell.value)
                    length = sum(2 if ord(char) > 127 else 1 for char in val_str)
                    if length > max_len:
                        max_len = length
            ws.column_dimensions[col_letter].width = max(max_len + 3, 10)
            
        # 엑셀 파일 저장 (파일명에 정제된 경매 타이틀 적용)
        output_file = f"서울옥션_{date_suffix}_{auction_title_clean}_경매결과.xlsx"
        try:
            wb.save(output_file)
            print(f"➔ 엑셀 파일 생성 성공 (이미지 포함): {output_file}")
        except PermissionError:
            alternative_file = f"서울옥션_{date_suffix}_{auction_title_clean}_경매결과_새파일.xlsx"
            print(f"⚠️ 경고: '{output_file}' 파일이 열려 있어 덮어쓸 수 없습니다.")
            print(f"➔ 대신 다른 이름으로 저장합니다: {alternative_file}")
            wb.save(alternative_file)
        
        # 이미지 폴더 ZIP 압축
        print(f"➤ 이미지 폴더를 ZIP으로 압축 중... ({folder_name})")
        zip_filename = f"{folder_name}.zip"
        try:
            with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED, allowZip64=True) as zf:
                for img_file in os.listdir(folder_name):
                    img_path = os.path.join(folder_name, img_file)
                    if os.path.isfile(img_path):
                        zf.write(img_path, arcname=img_file)
            print(f"➤ ZIP 파일 생성 성공: {zip_filename}")
        except Exception as zip_err:
            print(f"⚠️ ZIP 압축 실패: {zip_err}")
            
    else:
        print("➔ 데이터를 가져오는 데는 성공했으나 응답에 오류가 있습니다.")
else:
    print(f"➔ 데이터를 가져오는 데 실패했습니다. 상태코드: {response.status_code}")