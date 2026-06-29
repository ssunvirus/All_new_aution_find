import sys, re, json
import requests

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://www.seoulauction.com"

session = requests.Session()
session.headers['User-Agent'] = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
)

# 1. 로그인
session.get(f"{BASE_URL}/login")
resp = session.post(
    f"{BASE_URL}/processLogin",
    data={"loginId": "kimsg1995", "password": "rlatjsrbs95!"},
    headers={"Content-Type": "application/x-www-form-urlencoded",
             "Referer": f"{BASE_URL}/login"},
    allow_redirects=True,
)
print("로그인:", "성공" if "login" not in resp.url else "실패")

# 2. 경매 결과 목록 페이지 HTML 가져오기
session.headers.update({
    "Accept": "text/html,application/xhtml+xml",
    "Referer": BASE_URL,
})
r = session.get(f"{BASE_URL}/auction-list/results")
print(f"\n결과 페이지 Status: {r.status_code}")

html = r.text

# 3. btn_go-result 클래스를 가진 요소 찾기 (결과보기 버튼)
print("\n=== 결과보기 버튼 패턴 ===")
btns = re.findall(r'<[^>]*btn_go-result[^>]*>', html)
for b in btns[:5]:
    print(b)

# 4. form 태그 전체 찾기
print("\n=== Form 태그들 ===")
forms = re.findall(r'<form[^>]*>', html)
for f in forms:
    print(f)

# 5. "result" 포함된 href/action 찾기
print("\n=== result 관련 링크들 ===")
links = re.findall(r'(?:href|action)=["\']([^"\']*result[^"\']*)["\']', html)
for l in links[:10]:
    print(l)

# 6. sale_no 포함된 패턴 찾기
print("\n=== sale_no 관련 패턴 ===")
sale_refs = re.findall(r'["\']([^"\']*sale[_-]?no[^"\']*)["\']', html, re.IGNORECASE)
for s in sale_refs[:10]:
    print(s)
