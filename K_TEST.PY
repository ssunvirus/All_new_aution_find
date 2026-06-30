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

# 1. 케이옥션 경매 번호 또는 날짜 세팅
target_auction = "199"
if len(sys.argv) > 1:
    target_auction = sys.argv[1]

# 2. 타겟 연도 세팅 (전체 검색 시 None, 지정 연도 있을 시 필터링)
target_year = None
if len(sys.argv) > 2:
    val = sys.argv[2].strip()
    if val.lower() not in ["all", "", "none"]:
        target_year = val

# 3. 경매 종류 세팅 (기본값 '1' - 메이저, '2' - 프리미엄, '4' - 위클리)
auc_kind = "1"
if len(sys.argv) > 3:
    val = sys.argv[3].strip()
    if val in ["1", "2", "4"]:
        auc_kind = val

# 4. 케이옥션 API 및 웹페이지 요청 설정
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
}

session = requests.Session()
session.headers.update(headers)

def date_matches(dt_str, target_date_input, target_year=None):
    """
    체크할 날짜 문자열(예: '2026-06-24 16:00:00')이 
    사용자가 입력한 타겟 날짜(예: '6_24', '6/24', '2026-06-24')와 일치하는지 비교합니다.
    """
    if not dt_str or not target_date_input:
        return False
        
    # 구분자 통일
    target = str(target_date_input).strip().replace("/", "_").replace("-", "_")
    
    match = re.match(r'(\d{4})-(\d{2})-(\d{2})', dt_str)
    if not match:
        return False
        
    year, month, day = match.groups()
    
    # 연도 비교
    if target_year and str(year) != str(target_year):
        return False
        
    m_int, d_int = int(month), int(day)
    
    # 일치 가능한 날짜 문자열 조합
    candidates = [
        f"{m_int}_{d_int}",
        f"{month}_{day}",
        f"{year}_{month}_{day}",
        f"{year}_{m_int}_{d_int}",
        f"{month}_{d_int}",
        f"{m_int}_{day}"
    ]
    
    return target in candidates

def find_auction_by_date(target_date_input, session, target_year=None, auc_kind="1"):
    """
    케이옥션 경매 일정 목록을 조회하여 날짜 혹은 타이틀에 부합하는 경매 정보를 찾습니다.
    """
    if auc_kind == "2":
        schedule_type = "Premium"
    elif auc_kind == "4":
        schedule_type = "Weekly"
    else:
        schedule_type = "Major"
    url = f"https://www.k-auction.com/api/Auction/Schedule/{schedule_type}"
    params = {
        "page": 1,
        "page_size": 200
    }
    headers_api = {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/json; charset=utf-8",
        "X-Requested-With": "XMLHttpRequest"
    }
    try:
        response = session.post(url, json=params, headers=headers_api, timeout=10)
        if response.status_code == 200:
            data = response.json()
            schedules = data.get("data", [])
            
            # 1단계: 날짜 정밀 비교
            for s in schedules:
                end_date = s.get("auc_end_date", "")
                start_date = s.get("auc_start_date", "")
                if date_matches(end_date, target_date_input, target_year) or date_matches(start_date, target_date_input, target_year):
                    return s
            
            # 2단계: 타이틀 부분 일치 비교
            cleaned_target = str(target_date_input).strip()
            target_variants = [
                cleaned_target,
                cleaned_target.replace("/", "_"),
                cleaned_target.replace("_", "/"),
                cleaned_target.replace("-", "/")
              ]
            for s in schedules:
                if target_year:
                    end_date = s.get("auc_end_date", "")
                    if end_date:
                        match = re.match(r'(\d{4})', end_date)
                        if match and match.group(1) != str(target_year):
                            continue
                            
                title = s.get("auc_title") or ""
                title_kr = s.get("auc_title_kr") or ""
                title_lower = title.lower()
                title_kr_lower = title_kr.lower()
                
                for variant in target_variants:
                    v_low = variant.lower()
                    if v_low in title_lower or v_low in title_kr_lower:
                        return s
    except Exception as e:
        print(f"    -> ⚠️ 경매 일정 API 조회 실패 ({e})")
    return None

# 5. 입력값 검증 및 경매 번호(auc_num) 최종 추출
auc_num = None
if auc_kind == "2":
    schedule_type_str = "Premium"
elif auc_kind == "4":
    schedule_type_str = "Weekly"
else:
    schedule_type_str = "Major"
if target_auction.isdigit():
    auc_num = int(target_auction)
    print(f"➔ 입력한 경매 번호: {auc_num} ({schedule_type_str})")
else:
    print(f"➔ 입력한 날짜 기반 경매 검색 중: '{target_auction}' ({schedule_type_str}, 연도 필터: {target_year or '전체'})")
    matched_auction = find_auction_by_date(target_auction, session, target_year, auc_kind)
    if matched_auction:
        auc_num = matched_auction.get("auc_num")
        auc_title = matched_auction.get("auc_title") or matched_auction.get("auc_title_kr")
        auc_date = matched_auction.get("auc_end_date")
        print(f"    -> 매칭된 경매 ID를 찾았습니다: {auc_num} ({auc_title})")
    else:
        print(f"➔ ❌ 입력한 날짜('{target_auction}')에 매칭되는 케이옥션 {schedule_type_str} 경매를 찾지 못했습니다.")
        sys.exit(1)

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

def format_date_to_md(date_str):
    """
    '2026-06-24 16:00:00' 포맷의 날짜를 '6_24' 형태로 변환합니다.
    """
    if not date_str:
        return ""
    match = re.match(r'(\d{4})-(\d{2})-(\d{2})', date_str)
    if match:
        _, month, day = match.groups()
        return f"{int(month)}_{int(day)}"
    return ""

print(f"➔ [케이옥션 {auc_num}번 {schedule_type_str} 경매] 데이터 및 경매 정보 조회 중...")

# 6. 경매 웹페이지에서 경매 타이틀 가져오기
web_url = f"https://www.k-auction.com/Auction/{schedule_type_str}/{auc_num}"
auction_title_str = f"케이옥션 {auc_num}회 {schedule_type_str} 경매"
try:
    r_web = session.get(web_url, timeout=10)
    if r_web.status_code == 200:
        # <h1>June Auction 2026</h1> 형태의 타이틀 추출
        title_match = re.search(r'<h1>(.*?)</h1>', r_web.text)
        if title_match:
            auction_title_str = title_match.group(1).strip()
except Exception as e:
    print(f"    -> ⚠️ 경매 웹페이지 파싱 실패 ({e}), 기본 타이틀을 사용합니다.")

print(f"    -> 경매 명칭: {auction_title_str}")

# 7. JSON API 호출을 위한 세팅 및 데이터 로드
api_url = f"https://www.k-auction.com/api/Auction/{auc_kind}/{auc_num}"
api_headers = {
    "Referer": web_url,
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Content-Type": "application/json; charset=utf-8",
    "X-Requested-With": "XMLHttpRequest"
}

api_params = {
    "page": 1,
    "page_size": 500,  # 500개 작품을 일괄 로드
    "page_type": "P",
    "artist_sort": ""
}

try:
    response = session.post(api_url, json=api_params, headers=api_headers, timeout=15)
except Exception as e:
    print(f"➔ ❌ API 서버 연결에 실패했습니다: {e}")
    sys.exit(1)

def download_image(lot, folder_path, auc_num, auc_kind, session):
    """
    케이옥션 작품의 고화질 이미지를 다운로드합니다.
    """
    lot_no = lot.get("lot_num")
    
    artist_name = lot.get("artist_name")
    artist_name = artist_name.strip() if artist_name else ""
    if not artist_name:
        artist_name = "Unknown"
        
    title = lot.get("title")
    title = title.strip() if title else ""
    if not title:
        title = "무제"
        
    img_name = lot.get("img_file_name")
    thum_name = lot.get("thum_file_name")
    if not img_name:
        return lot_no, "No image file name", None
        
    artist_clean = sanitize_filename(artist_name)
    title_clean = sanitize_filename(title)
    
    filename = f"[Lot {lot_no:03d}] {artist_clean} - {title_clean}.jpg"
    dest_path = os.path.join(folder_path, filename)
    
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return lot_no, "Skipped (Already exists)", dest_path
        
    # 고화질 이미지 URL 조합
    auc_num_int = int(auc_num)
    if auc_kind == "2":
        # 프리미엄 온라인
        img_url = f"https://images.k-auction.com/www/KMall/Work/{auc_num_int:04d}/{img_name}"
    elif auc_kind == "4":
        # 위클리 온라인
        img_url = f"https://images.k-auction.com/www/Konline/Work/{auc_num_int:04d}/{img_name}"
    else:
        # 메이저
        img_url = f"https://images.k-auction.com/www/Work/{auc_num_int:04d}/{img_name}"
    
    try:
        r = session.get(img_url, timeout=15)
        if r.status_code == 200:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            return lot_no, "Success", dest_path
        else:
            # 백업 시도 (썸네일 폴백)
            if auc_kind == "2" and thum_name:
                backup_url = f"https://images.k-auction.com/www/KMall/Work/{auc_num_int:04d}/{thum_name}"
            elif auc_kind == "4" and thum_name:
                backup_url = f"https://images.k-auction.com/www/Konline/Work/{auc_num_int:04d}/{thum_name}"
            else:
                backup_url = f"https://images.k-auction.com/www/Work/{auc_num_int:04d}/T/{img_name}"
                
            r_backup = session.get(backup_url, timeout=15)
            if r_backup.status_code == 200:
                with open(dest_path, "wb") as f:
                    f.write(r_backup.content)
                return lot_no, "Success (Thumbnail fallback)", dest_path
            return lot_no, f"HTTP Error {r.status_code}", None
    except Exception as e:
        return lot_no, f"Error: {e}", None

if response.status_code == 200:
    res_data = response.json()
    if res_data.get("code") == "00":
        lots = res_data.get("data", [])
        print(f"➔ 성공적으로 작품 데이터를 가져왔습니다. (총 {len(lots)}건)")
        
        if len(lots) == 0:
            print("➔ ❌ 가져온 작품 데이터가 없습니다.")
            sys.exit(1)
            
        # 첫 번째 작품의 경매 정보로부터 날짜 가져오기
        first_lot = lots[0]
        auc_date = first_lot.get("auc_date", "")
        print(f"    -> 경매 일정(종료): {auc_date or '정보 없음'}")
        
        date_suffix = str(auc_num)
        formatted_date = format_date_to_md(auc_date)
        if formatted_date:
            date_suffix = formatted_date
            
        # 윈도우 파일 시스템 및 엑셀 시트에 맞는 텍스트 정제
        auction_title_clean = sanitize_filename(auction_title_str)
        sheet_tab_title = sanitize_sheet_title(auction_title_str)
        
        # 5. 작품 사진 폴더 생성 및 이미지 다운로드 우선 진행
        folder_name = f"작품사진_케이옥션_{date_suffix}_{auction_title_clean}"
        os.makedirs(folder_name, exist_ok=True)
        print(f"\n➔ 작품 사진 다운로드 및 저장 중... (폴더명: {folder_name})")
        
        lot_image_paths = {}
        success_count = 0
        skipped_count = 0
        failed_lots = []
        
        total_lots = len(lots)
        completed = 0
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(download_image, lot, folder_name, auc_num, auc_kind, session): lot for lot in lots}
            
            for future in as_completed(futures):
                completed += 1
                lot_no, status, file_path = future.result()
                if file_path:
                    lot_image_paths[lot_no] = file_path
                    
                if "Success" in status:
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
                
        # 6. 데이터 정제하기
        parsed_lots = []
        for lot in lots:
            lot_no = lot.get("lot_num")
            
            artist_name = lot.get("artist_name")
            artist_name = artist_name.strip() if artist_name else ""
            
            title = lot.get("title")
            title = title.strip() if title else ""
            
            mate = lot.get("material")
            mate = mate.strip() if mate else ""
            
            # 제작년도 가공 (make_date 사용)
            year = lot.get("make_date", "")
            if not year:
                year = ""
            else:
                year = str(year).strip()
                
            size = lot.get("size")
            size = size.strip() if size else ""
            
            # 가격 정보
            price_from = lot.get("price_estimated_low")
            price_to = lot.get("price_estimated_high")
            start_price = lot.get("price_start")
            
            # 낙찰 정보
            hammer = lot.get("price_hammer")
            if hammer is not None and float(hammer) > 0:
                bid_price = int(hammer)
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
            
        # 7. 엑셀 워크북 생성 및 스타일 적용
        print("\n➔ 엑셀 문서 작성 및 작품 이미지 직접 삽입 중...")
        wb = openpyxl.Workbook()
        ws = wb.active
        
        # 엑셀 시트 탭 이름에 경매 명칭 적용
        ws.title = sheet_tab_title
        ws.views.sheetView[0].showGridLines = True
        
        font_family = '맑은 고딕'
        header_font = Font(name=font_family, size=11, bold=True, color='FFFFFF')
        data_font = Font(name=font_family, size=10)
        
        # 케이옥션 전용 다크 레드 테마 적용 (서울옥션과 확실하게 색상 구별)
        header_fill = PatternFill(start_color='8B0000', end_color='8B0000', fill_type='solid') # 다크레드
        even_row_fill = PatternFill(start_color='FFF5F5', end_color='FFF5F5', fill_type='solid') # 연한 핑크회색
        
        sold_font = Font(name=font_family, size=10, bold=True, color='8B0000')
        sold_fill = PatternFill(start_color='FFE4E1', end_color='FFE4E1', fill_type='solid') # 연초홍
        unsold_font = Font(name=font_family, size=10, color='757575')
        unsold_fill = PatternFill(start_color='F5F5F5', end_color='F5F5F5', fill_type='solid') # 연회색
        
        align_center = Alignment(horizontal='center', vertical='center')
        align_left = Alignment(horizontal='left', vertical='center')
        align_right = Alignment(horizontal='right', vertical='center')
        
        thin_border_side = Side(border_style='thin', color='E0D0D0')
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
                    if val is not None:
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
        output_file = f"케이옥션_{date_suffix}_{auction_title_clean}_경매결과.xlsx"
        try:
            wb.save(output_file)
            print(f"➔ 엑셀 파일 생성 성공 (이미지 포함): {output_file}")
        except PermissionError:
            alternative_file = f"케이옥션_{date_suffix}_{auction_title_clean}_경매결과_새파일.xlsx"
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
        print(f"➔ 데이터를 가져오는 데는 성공했으나 응답에 오류가 있습니다: {res_data.get('message')}")
else:
    print(f"➔ 데이터를 가져오는 데 실패했습니다. 상태코드: {response.status_code}")
