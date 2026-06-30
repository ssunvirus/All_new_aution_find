import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || '';
  const year = searchParams.get('year') || '';
  const company = searchParams.get('company') || 'seoul';
  
  if (!date) {
    return new Response('Date or Auction ID parameter is required', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Resolve paths relative to process.cwd() (web directory)
      // PYTHON_PATH env var is set in Dockerfile for Render (Linux)
      // Falls back to Windows .venv path for local development
      const pythonPath = process.env.PYTHON_PATH ||
        (process.platform === 'win32'
          ? path.resolve(process.cwd(), '../.venv/Scripts/python.exe')
          : 'python3');
      const isKAuction = company.startsWith('k_auction');
      const scriptPath = path.resolve(process.cwd(), isKAuction ? '../K_TEST.PY' : '../TEST.PY');
      const workingDir = path.resolve(process.cwd(), '..');

      const args = [scriptPath, date];
      if (year) {
        args.push(year);
      } else if (isKAuction) {
        args.push('all');
      }

      if (isKAuction) {
        let kind = '1';
        if (company === 'k_auction_premium') kind = '2';
        else if (company === 'k_auction_weekly') kind = '4';
        args.push(kind);
      }

      console.log(`Spawning python process: ${pythonPath} ${args.join(' ')}`);
      
      const child = spawn(pythonPath, args, {
        cwd: workingDir,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });

      let buffer = '';

      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      child.stdout.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          let step = 'log';
          let payload: Record<string, any> = { text: trimmed };

          // Step categorization
          if (trimmed.includes('경매 검색 중') || trimmed.includes('경매 정보 조회 중') || trimmed.includes('입력한 경매 번호')) {
            step = 'search_start';
          } else if (trimmed.includes('매칭된 경매 ID') || trimmed.includes('경매 명칭')) {
            step = 'search_meta';
          } else if (trimmed.includes('성공적으로 작품 데이터를 가져왔습니다')) {
            step = 'data_fetched';
          } else if (trimmed.includes('작품 사진 다운로드') || trimmed.includes('다운로드 진행률')) {
            step = 'download_images';
          } else if (trimmed.includes('엑셀 문서 작성') || trimmed.includes('이미지 직접 삽입 중')) {
            step = 'write_excel';
          } else if (trimmed.includes('엑셀 파일 생성 성공')) {
            step = 'complete';
            const match = trimmed.match(/엑셀 파일 생성 성공 \(이미지 포함\):\s*(.+)/) || trimmed.match(/엑셀 파일 생성 성공:\s*(.+)/);
            if (match) {
              payload = { text: trimmed, filename: match[1].trim() };
            }
          } else if (trimmed.includes('ZIP 파일 생성 성공')) {
            step = 'zip_ready';
            const match = trimmed.match(/ZIP 파일 생성 성공:\s*(.+)/);
            if (match) {
              payload = { text: trimmed, zip_filename: match[1].trim() };
            }
          }

          sendEvent({ step, ...payload });
        }
      });

      child.stderr.on('data', (chunk) => {
        const text = chunk.toString().trim();
        // Ignore python environment syntax warnings if any
        if (text && !text.includes('SyntaxWarning')) {
          sendEvent({ step: 'error', text });
        }
      });

      child.on('close', (code) => {
        if (buffer.trim()) {
          sendEvent({ step: 'log', text: buffer.trim() });
        }
        sendEvent({ step: 'exit', code });
        controller.close();
      });

      child.on('error', (err) => {
        sendEvent({ step: 'system_error', text: err.message });
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
