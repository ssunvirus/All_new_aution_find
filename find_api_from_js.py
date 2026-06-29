import sys, json, requests

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://www.seoulauction.com"

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": BASE_URL,
})

# 로그인
session.get(f"{BASE_URL}/login")
session.post(
    f"{BASE_URL}/processLogin",
    data={"loginId": "kimsg1995", "password": "rlatjsrbs95!"},
    headers={"Content-Type": "application/x-www-form-urlencoded",
             "Referer": f"{BASE_URL}/login"},
    allow_redirects=True,
)
print("로그인 완료\n")

# 알려진 데이터:
# SALE_NO=1050 | main    → /api/auction/live/list/1050
# SALE_NO=1051 | online
# SALE_NO=1049 | online
# SALE_NO=1045 | plan
# SALE_NO=1047 | exhibit_sa

test_cases = [
    # (설명, URL)
    ("1050 live (확인용)",    f"/api/auction/live/list/1050?device=pc"),
    ("1050 live mo",          f"/api/auction/live/list/1050?device=mo"),
    ("1051 online",           f"/api/auction/online/list/1051?device=pc"),
    ("1051 online mo",        f"/api/auction/online/list/1051?device=mo"),
    ("1049 online",           f"/api/auction/online/list/1049?device=pc"),
    ("1051 results (GET)",    f"/api/auction/results/1051"),
    ("1051 main",             f"/api/auction/main/list/1051?device=pc"),
    ("1051 lot list v1",      f"/api/auction/lot/list/1051"),
    ("1051 lot/1051",         f"/api/auction/lot/1051"),
    ("1051 sale",             f"/api/auction/sale/list?sale_no=1051"),
]

print("=== API 패턴 테스트 ===\n")
for desc, path in test_cases:
    url = BASE_URL + path
    r = session.get(url, timeout=8)
    ct = r.headers.get("content-type", "")

    if r.status_code == 200 and "json" in ct:
        try:
            data = r.json()
            if data.get("success"):
                cnt = len(data.get("data", {}).get("list", data.get("data", [])))
                print(f"[🎯 HIT!] {desc}")
                print(f"         GET {path}")
                print(f"         success=True, 항목={cnt}개")
                print(f"         응답 샘플: {str(data)[:300]}")
            else:
                print(f"[200 no success] {desc} → {str(data)[:100]}")
        except:
            print(f"[200 no JSON] {desc}")
    else:
        print(f"[{r.status_code}] {desc}")
