import requests, sys, re
sys.stdout.reconfigure(encoding='utf-8')

s = requests.Session()
s.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

r = s.get('https://www.seoulauction.com/login')
print('Status:', r.status_code)
print('Cookies:', dict(s.cookies))

# form 태그 찾기
form = re.search(r'<form[^>]*loginForm[^>]*>', r.text)
if form:
    print('Form tag:', form.group())

# CSRF 토큰 찾기
csrf = re.search(r'_csrf[^>]*value="([^"]+)"', r.text)
if csrf:
    print('CSRF token:', csrf.group(1))
else:
    print('CSRF 토큰 없음')

# hidden input 전부 출력
hiddens = re.findall(r'<input[^>]+type="hidden"[^>]*>', r.text)
for h in hiddens:
    print('Hidden input:', h)
