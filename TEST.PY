import requests

# 1. 1051번 경매 주소로 타겟 세팅! (원하는 숫자만 바꾸면 됩니다)
auction_id = 1051
api_url = f"https://www.seoulauction.com/api/auction/live/list/{auction_id}?device=mo"

# 2. 서울옥션 API 서버에 데이터 요청하기
# (로봇 차단을 피하기 위해 헤더에 브라우저 정보를 살짝 얹어줍니다)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

response = requests.get(api_url, headers=headers)

# 3. 브라우저 껍데기 HTML이 아닌, '순수한 JSON 데이터' 바로 받기
if response.status_code == 200:
    data = response.json()
    print("➔ 데이터 가져오기 성공!")
    
    # 4. 이제 자바스크립트 객체 다루듯이 데이터를 요리합니다.
    # (실제 JSON 구조에 따라 키값(예: ['list'] 등)은 다를 수 있으니 출력해서 확인해보세요)
    print(data) 
else:
    print(f"데이터를 가져오는데 실패했습니다. 상태코드: {response.status_code}")