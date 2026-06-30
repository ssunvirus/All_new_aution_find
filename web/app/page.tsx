'use client';

import React, { useState, useRef, useEffect } from 'react';

type StepStatus = 'idle' | 'active' | 'complete' | 'error';
type KAuctionKind = 'k_auction' | 'k_auction_premium' | 'k_auction_weekly';

interface StepItem {
  id: string;
  label: string;
  description: string;
}

const K_AUCTION_OPTIONS: { value: KAuctionKind; label: string; color: string; shadow: string }[] = [
  {
    value: 'k_auction',
    label: 'K옥션 메이저 (Major)',
    color: 'linear-gradient(135deg, #b22222 0%, #ff4d4d 100%)',
    shadow: 'rgba(178, 34, 34, 0.35)',
  },
  {
    value: 'k_auction_premium',
    label: 'K옥션 프리미엄 (Premium)',
    color: 'linear-gradient(135deg, #d35400 0%, #f39c12 100%)',
    shadow: 'rgba(211, 84, 0, 0.35)',
  },
  {
    value: 'k_auction_weekly',
    label: 'K옥션 위클리 (Weekly)',
    color: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)',
    shadow: 'rgba(6, 182, 212, 0.35)',
  },
];

type CompanyTab = 'seoul' | 'k_auction_group';

export default function Home() {
  const [companyTab, setCompanyTab] = useState<CompanyTab>('seoul');
  const [kAuctionKind, setKAuctionKind] = useState<KAuctionKind>('k_auction');
  const [dateInput, setDateInput] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [zipFilename, setZipFilename] = useState<string>('');
  const [metaInfo, setMetaInfo] = useState<{ title: string; date: string } | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Effective company string sent to the API
  const selectedCompany = companyTab === 'seoul' ? 'seoul' : kAuctionKind;

  // Active K-Auction kind config
  const activeKind = K_AUCTION_OPTIONS.find((o) => o.value === kAuctionKind)!;

  const steps: StepItem[] = [
    { id: 'search', label: '경매 일정 검색', description: '날짜 또는 ID에 해당하는 경매를 찾습니다.' },
    { id: 'fetch', label: '작품 목록 데이터 수집', description: `${companyTab === 'seoul' ? '서울옥션' : '케이옥션'} API 서버에서 전체 작품 정보를 수집합니다.` },
    { id: 'download', label: '작품 이미지 병렬 저장', description: '10개 동시 스레드로 작품 이미지 수집을 진행합니다.' },
    { id: 'excel', label: '엑셀 빌드 및 이미지 삽입', description: 'Pillow 연산으로 이미지 썸네일을 엑셀 셀 내부에 삽입합니다.' },
    { id: 'complete', label: '엑셀 다운로드 완료', description: '정리가 완료되어 브라우저 다운로드를 실행합니다.' }
  ];

  const handleDownload = () => {
    if (!dateInput.trim() || loading) return;

    setLoading(true);
    setLogs([]);
    setDownloadFilename('');
    setZipFilename('');
    setMetaInfo(null);
    setActiveStep(0);

    const encodedDate = encodeURIComponent(dateInput.trim());
    const eventSource = new EventSource(`/api/download?date=${encodedDate}&year=${selectedYear}&company=${selectedCompany}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.text) {
          setLogs((prev) => [...prev, data.text]);
        }

        switch (data.step) {
          case 'search_start':
            setActiveStep(0);
            break;
          case 'search_meta':
            setActiveStep(0);
            if (data.text.includes('경매 명칭:')) {
              const nameMatch = data.text.match(/경매 명칭:\s*(.+)/);
              if (nameMatch) {
                setMetaInfo(prev => ({ title: nameMatch[1], date: prev?.date || '' }));
              }
            }
            if (data.text.includes('경매 일정(종료):')) {
              const dateMatch = data.text.match(/경매 일정\(종료\):\s*(.+)/);
              if (dateMatch) {
                setMetaInfo(prev => ({ title: prev?.title || '', date: dateMatch[1] }));
              }
            }
            break;
          case 'data_fetched':
            setActiveStep(1);
            break;
          case 'download_images':
            setActiveStep(2);
            break;
          case 'write_excel':
            setActiveStep(3);
            break;
          case 'complete':
            setActiveStep(4);
            if (data.filename) {
              setDownloadFilename(data.filename);
              setTimeout(() => {
                window.location.href = `/api/download/file?filename=${encodeURIComponent(data.filename)}`;
              }, 500);
            }
            break;
          case 'zip_ready':
            if (data.zip_filename) {
              setZipFilename(data.zip_filename);
              setTimeout(() => {
                window.location.href = `/api/download/zip?filename=${encodeURIComponent(data.zip_filename)}`;
              }, 2000);
            }
            break;
          case 'error':
          case 'system_error':
            setActiveStep(-2);
            setLogs((prev) => [...prev, `❌ 에러 발생: ${data.text}`]);
            eventSource.close();
            setLoading(false);
            break;
          case 'exit':
            eventSource.close();
            setLoading(false);
            if (activeStep !== 4 && activeStep !== -2) {
              if (data.code !== 0) {
                setActiveStep(-2);
                setLogs((prev) => [...prev, `❌ 크롤러 프로세스가 비정상 종료되었습니다 (종료 코드: ${data.code})`]);
              }
            }
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      setLogs((prev) => [...prev, '❌ 백엔드 크롤러 서버와 연결이 해제되었거나 오류가 발생했습니다.']);
      setActiveStep(-2);
      eventSource.close();
      setLoading(false);
    };
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getStepStatus = (index: number): StepStatus => {
    if (activeStep === -2) return index === 4 ? 'idle' : 'error';
    if (activeStep > index || (activeStep === 4 && index === 4)) return 'complete';
    if (activeStep === index) return 'active';
    return 'idle';
  };

  // Header title & accent color
  const headerTitle =
    companyTab === 'seoul' ? '서울옥션' : activeKind.label.split(' (')[0];

  // Placeholder for date input
  const placeholderMap: Record<string, string> = {
    seoul: '예: 6/17, 5_20, 1049 등',
    k_auction: '예: 6/24, 199, 200 등',
    k_auction_premium: '예: 6/23, 228, 227 등',
    k_auction_weekly: '예: 6/17, 494, 493 등',
  };

  // Helper text
  const helperTextMap: Record<string, string> = {
    seoul: '* 날짜 기입 시 슬래시(/), 대시(-), 언더바(_) 등 자유롭게 매치되며, 경매 연도 필터를 켜면 해당 연도의 경매만 정밀 검색합니다.',
    k_auction: '* 날짜(예: 6/24) 또는 경매 번호(예: 199) 기입 시 자유롭게 매치되며, 경매 연도 필터링도 함께 지원합니다.',
    k_auction_premium: '* 날짜(예: 6/23) 또는 경매 번호(예: 228) 기입 시 자유롭게 매치되며, 프리미엄 온라인 경매 결과가 역추적 검색됩니다.',
    k_auction_weekly: '* 날짜(예: 6/17) 또는 경매 번호(예: 494) 기입 시 자유롭게 매치되며, 위클리 온라인 경매 결과가 역추적 검색됩니다.',
  };

  // Button gradient
  const btnStyle =
    companyTab === 'k_auction_group'
      ? { background: activeKind.color, boxShadow: `0 4px 20px ${activeKind.shadow}` }
      : {};

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header Section */}
      <header style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '12px' }}>
          {headerTitle} <span className="gradient-text">경매결과 다운로더</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          경매 일자나 경매 번호만 입력하면, 작품 이미지가 삽입된 엑셀파일과 작품 이미지를 <br />수집합니다.
        </p>
      </header>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Left Side: Controller Panel */}
        <section className="glass-panel glow-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>수집 대상 및 조건 설정</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>경매 정보를 입력하여 데이터 수집을 실행합니다.</p>
          </div>

          {/* ── Company Selector: 2-tab (Seoul / K-Auction) ── */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            {/* Seoul tab */}
            <button
              onClick={() => { if (!loading) { setCompanyTab('seoul'); setDateInput(''); } }}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: '8px',
                border: 'none',
                outline: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                fontWeight: '600',
                fontSize: '13px',
                background: companyTab === 'seoul' ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' : 'transparent',
                color: companyTab === 'seoul' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: companyTab === 'seoul' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              서울옥션 (Seoul)
            </button>

            {/* K-Auction tab */}
            <button
              onClick={() => { if (!loading) { setCompanyTab('k_auction_group'); setDateInput(''); } }}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: '8px',
                border: 'none',
                outline: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                fontWeight: '600',
                fontSize: '13px',
                background: companyTab === 'k_auction_group' ? activeKind.color : 'transparent',
                color: companyTab === 'k_auction_group' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: companyTab === 'k_auction_group' ? `0 4px 12px ${activeKind.shadow}` : 'none',
              }}
            >
              케이옥션 (K-Auction)
            </button>
          </div>

          {/* ── K-Auction Sub-type Dropdown (visible only when K-Auction tab is active) ── */}
          {companyTab === 'k_auction_group' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                경매 종류
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {K_AUCTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { if (!loading) { setKAuctionKind(opt.value); setDateInput(''); } }}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '9px 6px',
                      borderRadius: '8px',
                      border: kAuctionKind === opt.value ? '1.5px solid transparent' : '1.5px solid rgba(255,255,255,0.08)',
                      outline: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: kAuctionKind === opt.value ? '700' : '500',
                      fontSize: '12px',
                      background: kAuctionKind === opt.value ? opt.color : 'rgba(255,255,255,0.03)',
                      color: kAuctionKind === opt.value ? '#fff' : 'var(--text-secondary)',
                      boxShadow: kAuctionKind === opt.value ? `0 3px 10px ${opt.shadow}` : 'none',
                    }}
                  >
                    {opt.value === 'k_auction' ? 'Major (메이저)' : opt.value === 'k_auction_premium' ? 'Premium (프리미엄)' : 'Weekly (위클리)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Year & Date Inputs ── */}
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '0 0 120px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>경매 연도</label>
              <select
                className="form-input"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={loading}
                style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.05) url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E") no-repeat right 12px center / 16px', paddingRight: '36px' }}
              >
                <option value="all" style={{ background: '#11111c' }}>전체 (All)</option>
                <option value="2026" style={{ background: '#11111c' }}>2026</option>
                <option value="2025" style={{ background: '#11111c' }}>2025</option>
                <option value="2024" style={{ background: '#11111c' }}>2024</option>
                <option value="2023" style={{ background: '#11111c' }}>2023</option>
                <option value="2022" style={{ background: '#11111c' }}>2022</option>
                <option value="2021" style={{ background: '#11111c' }}>2021</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>경매 날짜 또는 번호</label>
              <input
                type="text"
                className="form-input"
                placeholder={placeholderMap[selectedCompany] || '예: 6_24'}
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
                disabled={loading}
              />
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-12px', lineHeight: '1.4' }}>
            {helperTextMap[selectedCompany]}
          </span>

          {/* ── Execute Button ── */}
          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={loading || !dateInput.trim()}
            style={{
              width: '100%',
              height: '54px',
              ...btnStyle,
            }}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                경매 데이터 정리 중...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                데이터 수집 및 엑셀 다운로드
              </>
            )}
          </button>

          {/* Metadata Display Card */}
          {metaInfo && (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px 20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>매칭된 경매 정보</h3>
              <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>{metaInfo.title}</p>
              {metaInfo.date && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>종료 일시: {metaInfo.date}</p>}
            </div>
          )}

          {/* Download Result Buttons (appear after completion) */}
          {(downloadFilename || zipFilename) && activeStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0' }}>다운로드 완료 파일</p>
              {downloadFilename && (
                <a
                  href={`/api/download/file?filename=${encodeURIComponent(downloadFilename)}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '10px', padding: '12px 16px', textDecoration: 'none',
                    color: '#a5b4fc', fontSize: '13px', fontWeight: '600',
                    transition: 'background 0.2s'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  📊 {downloadFilename}
                </a>
              )}
              {zipFilename && (
                <a
                  href={`/api/download/zip?filename=${encodeURIComponent(zipFilename)}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px', padding: '12px 16px', textDecoration: 'none',
                    color: '#6ee7b7', fontSize: '13px', fontWeight: '600',
                    transition: 'background 0.2s'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  🗜️ {zipFilename}
                </a>
              )}
            </div>
          )}
        </section>

        {/* Right Side: Progress and Log panel */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Progress Tracker Card */}
          <div className="glass-panel" style={{ padding: '24px 32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '18px' }}>진행 상태 모니터링</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {steps.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <div key={step.id} className={`step-item ${status}`}>
                    <div className="step-indicator">
                      {status === 'complete' ? '✓' : index + 1}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: status === 'idle' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {step.label}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {step.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Console Log Output */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-secondary)' }}>실시간 크롤러 로그 (Console)</h2>
              {loading && <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: '600' }}>수집 처리 중...</div>}
            </div>
            <div className="console-log" ref={logContainerRef}>
              {logs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '100px' }}>
                  수집 조건 설정 후 실행하시면 실시간 콘솔 로그가 표시됩니다.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} style={{ marginBottom: '6px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer copyright */}
      <footer style={{ marginTop: 'auto', paddingTop: '48px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        © 2026 Seoul Auction Excel Downloader. Built with Next.js & Python.
      </footer>
    </main>
  );
}
