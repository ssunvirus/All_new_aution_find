import sys, re, requests

sys.stdout.reconfigure(encoding='utf-8')

PUBLIC_URL = "https://public.seoulauction.io"
VERSION    = "20260624_103210"

session = requests.Session()
session.headers['User-Agent'] = "Mozilla/5.0"

# 상세 페이지에서 로드되는 src JS 파일 전부
src_files = [
    f"native.js",
    f"nav.js",
    f"layerPopup.js",
    f"main/newsletter.js",
    f"times-Dxb4vVV_.js",
    f"Pagination-rQ6-GbgW.js",
    f"utils-DMb30fiR.js",
]

print("=== src JS 파일 전체 API 스캔 ===\n")

for fname in src_files:
    if fname.startswith("times") or fname.startswith("Pagination") or fname.startswith("utils"):
        url = f"{PUBLIC_URL}/resources/static/assets/{VERSION}/{fname}"
    else:
        url = f"{PUBLIC_URL}/resources/static/script/src/{VERSION}/{fname}"

    try:
        r = session.get(url, timeout=8)
        if r.status_code != 200:
            print(f"[{r.status_code}] {fname}")
            continue
        text = r.text
        api_hits = re.findall(r'/api/[A-Za-z0-9/_$\{\}\-\.]+', text)
        axios_hits = list(re.finditer(r'axios[.\w]*\.(post|get)\s*\(', text))
        if api_hits or axios_hits:
            print(f"\n[{fname}] ({len(text):,}바이트)")
            for h in sorted(set(api_hits)):
                print(f"  API: {h}")
            for m in axios_hits[:5]:
                s = max(0, m.start()-20)
                e = min(len(text), m.end()+150)
                print(f"  axios: ...{text[s:e]}...")
        else:
            print(f"[없음] {fname}")
    except Exception as ex:
        print(f"[ERR] {fname}: {ex}")

# 추가: result_detail.html 안의 인라인 스크립트 전체 출력
print("\n\n=== result_detail.html 인라인 <script> 내용 ===")
with open("result_detail.html", "r", encoding="utf-8") as f:
    html = f.read()

inline_scripts = re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>', html, re.DOTALL)
for i, sc in enumerate(inline_scripts):
    sc = sc.strip()
    if len(sc) > 50:
        print(f"\n--- 인라인 스크립트 #{i+1} ({len(sc)}자) ---")
        print(sc[:1500])

print("\n완료.")
