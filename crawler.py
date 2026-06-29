import sys
import json
import requests

sys.stdout.reconfigure(encoding='utf-8')

# =============================================
# 로그인 정보
# =============================================
LOGIN_ID       = "kimsg1995"
LOGIN_PASSWORD = "rlatjsrbs95!"
# =============================================

BASE_URL = "https://www.seoulauction.com"

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "Accept-Language": "ko,en-US;q=0.9,en;q=0.8",
    "Origin": BASE_URL,
})


def login():
    """서울옥션 폼 로그인 (Selenium 없이 requests만 사용)"""
    print("[1] 로그인 중...")

    # 로그인 페이지 먼저 접속해서 초기 쿠키(ACEUCI 등) 획득
    session.get(f"{BASE_URL}/login")

    # 폼 방식으로 로그인 (application/x-www-form-urlencoded)
    # 실제 form action은 /processLogin (check_login.py로 확인)
    resp = session.post(
        f"{BASE_URL}/processLogin",
        data={
            "loginId": LOGIN_ID,
            "password": LOGIN_PASSWORD,
        },
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": f"{BASE_URL}/login",
        },
        allow_redirects=True,
    )

    # 로그인 실패 시 /login?error 로 돌아옴
    if "login" in resp.url:
        print(f"    로그인 실패 (현재 URL: {resp.url})")
        return False

    # 이후 API 호출용 헤더로 전환
    session.headers.update({
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "Referer": BASE_URL,
    })

    print(f"    로그인 성공! (현재 URL: {resp.url})")
    return True


def get_auction_list(page_from=0, rows=20):
    """경매 회차 목록 조회 (POST /api/auction/results)"""
    resp = session.post(
        f"{BASE_URL}/api/auction/results",
        json={
            "from": page_from,
            "rows": rows,
            "sale_kind_cd": None,
            "find_word": None,
        }
    )
    data = resp.json()
    if data.get("success"):
        return data["data"]["cnt"], data["data"]["list"]
    print(f"    API 오류: {data}")
    return 0, []


def parse_title(title_json):
    """TITLE_JSON → 한국어 제목"""
    if isinstance(title_json, str):
        try:
            title_json = json.loads(title_json)
        except Exception:
            return str(title_json)
    return title_json.get("#ko#", title_json.get("ko", "제목없음")).rstrip("#").strip()


# ─────────────────────────────────────────────
# 메인 실행
# ─────────────────────────────────────────────
if not login():
    exit(1)

print("\n[2] 경매 회차 목록 조회 중...")
total, auctions = get_auction_list(page_from=0, rows=10)
print(f"    총 경매 수: {total}건\n")

print("  최근 경매 10건:")
print("  " + "-" * 65)
for i, a in enumerate(auctions, 1):
    title   = parse_title(a.get("TITLE_JSON", "{}"))
    sale_no = a.get("SALE_NO", "?")
    from_dt = str(a.get("FROM_DT", ""))[:10]
    to_dt   = str(a.get("TO_DT", ""))[:10]
    kind    = a.get("SALE_KIND_CD", "?")
    print(f"  [{i:2}] SALE_NO={sale_no} | {from_dt}~{to_dt} | {kind:8} | {title}")

print("\n완료.")
