import sys, json, requests

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://www.seoulauction.com"
SALE_NO  = 1051  # 테스트할 경매 번호 (프리미엄 온라인 6/24)

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": BASE_URL,
    "Referer": BASE_URL,
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

# ─── 테스트할 API 엔드포인트 후보들 ───────────────────
candidates = [
    # (설명, method, path, body)
    ("lot 목록 v1",  "POST", "/api/auction/lot/list",
        {"sale_no": SALE_NO, "from": 0, "rows": 10}),

    ("lot 목록 v2",  "POST", "/api/lot/list",
        {"sale_no": SALE_NO, "from": 0, "rows": 10}),

    ("lot 목록 v3",  "POST", f"/api/auction/{SALE_NO}/lot/list",
        {"from": 0, "rows": 10}),

    ("lot 목록 v4",  "GET",  f"/api/auction/{SALE_NO}/lots", None),

    ("lot 목록 v5",  "POST", "/api/auction/lots",
        {"sale_no": SALE_NO, "from": 0, "rows": 10}),

    ("결과 상세 v1", "POST", "/api/auction/result/detail",
        {"sale_no": SALE_NO}),

    ("결과 상세 v2", "GET",  f"/api/auction/result/{SALE_NO}", None),

    ("결과 상세 v3", "POST", "/api/auction/sale/lot/list",
        {"sale_no": SALE_NO, "from": 0, "rows": 10}),
]

print(f"SALE_NO={SALE_NO} 에 대해 {len(candidates)}가지 API 테스트:\n")
print("-" * 60)

for desc, method, path, body in candidates:
    url = f"{BASE_URL}{path}"
    try:
        if method == "POST":
            r = session.post(url, json=body, timeout=5)
        else:
            r = session.get(url, timeout=5)

        # JSON 응답인지 확인
        ct = r.headers.get("content-type", "")
        if "json" in ct and r.status_code == 200:
            data = r.json()
            if data.get("success") or "list" in str(data)[:100] or "data" in data:
                print(f"[HIT!] {desc}")
                print(f"       {method} {path}")
                print(f"       응답: {str(data)[:200]}")
                print()
            else:
                print(f"[200 but no data] {desc} → {str(data)[:80]}")
        else:
            print(f"[{r.status_code}] {desc} ({method} {path})")
    except Exception as e:
        print(f"[ERR] {desc}: {e}")

print("\n완료.")
