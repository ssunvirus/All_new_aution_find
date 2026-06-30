# ──────────────────────────────────────────────────────────────
# Stage 1: Next.js 빌드
# ──────────────────────────────────────────────────────────────
FROM node:20-slim AS node-builder

WORKDIR /app/web

COPY web/package*.json ./
RUN npm ci

COPY web/ ./
RUN npm run build

# ──────────────────────────────────────────────────────────────
# Stage 2: 최종 런타임 이미지 (Node + Python 가상환경)
# ──────────────────────────────────────────────────────────────
FROM node:20-slim

# Python 및 Pillow 이미지 처리에 필요한 시스템 라이브러리 빌드 도구 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    libfreetype6 \
    libjpeg62-turbo \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 최종 런타임 컨테이너 내에서 직접 가상환경 구성 (심볼릭 링크 에러 방지)
COPY requirements.txt .
RUN python3 -m venv /venv && \
    /venv/bin/pip install --no-cache-dir -r requirements.txt

ENV PYTHON_PATH=/venv/bin/python3

# Python 크롤러 스크립트 복사
COPY TEST.PY K_TEST.PY ./

# Next.js 빌드 결과물 복사
COPY --from=node-builder /app/web/.next ./web/.next
COPY --from=node-builder /app/web/node_modules ./web/node_modules
COPY --from=node-builder /app/web/package.json ./web/package.json
COPY --from=node-builder /app/web/public ./web/public

EXPOSE 3000

WORKDIR /app/web

CMD ["npm", "start"]
