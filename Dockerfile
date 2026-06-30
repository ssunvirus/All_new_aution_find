# ──────────────────────────────────────────────────────────────
# Stage 1: Python dependencies
# ──────────────────────────────────────────────────────────────
FROM python:3.11-slim AS python-base

WORKDIR /app

# Pillow 빌드에 필요한 시스템 라이브러리 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Python 패키지 설치 (가상환경에 격리)
COPY requirements.txt .
RUN python -m venv /venv && \
    /venv/bin/pip install --no-cache-dir -r requirements.txt

# ──────────────────────────────────────────────────────────────
# Stage 2: Node.js 빌드
# ──────────────────────────────────────────────────────────────
FROM node:20-slim AS node-builder

WORKDIR /app/web

# package.json 먼저 복사 → 의존성 캐시 활용
COPY web/package*.json ./
RUN npm ci

# Next.js 소스 복사 및 프로덕션 빌드
COPY web/ ./
RUN npm run build

# ──────────────────────────────────────────────────────────────
# Stage 3: 최종 런타임 이미지
# ──────────────────────────────────────────────────────────────
FROM node:20-slim

# Python 런타임만 설치 (빌드 도구 제외)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    libfreetype6 \
    libjpeg62-turbo \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python 가상환경 (Stage 1에서)
COPY --from=python-base /venv /venv
ENV PYTHON_PATH=/venv/bin/python3

# Python 크롤러 스크립트
COPY TEST.PY K_TEST.PY ./

# Next.js 빌드 결과물 (Stage 2에서)
COPY --from=node-builder /app/web/.next ./web/.next
COPY --from=node-builder /app/web/node_modules ./web/node_modules
COPY --from=node-builder /app/web/package.json ./web/package.json
COPY --from=node-builder /app/web/public ./web/public

# 포트 노출 (Render가 PORT 환경변수 자동 주입)
EXPOSE 3000

WORKDIR /app/web

# 프로덕션 서버 시작
CMD ["npm", "start"]
