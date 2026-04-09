import React, { useState } from 'react';

const RISK_COLORS = {
  위험: 'var(--color-danger)',
  주의: 'var(--color-warning)',
  정상: 'var(--color-success)',
  미응답: 'var(--color-text-light)',
};

const SENTIMENT_LABELS = {
  POSITIVE: { label: '긍정', color: 'var(--color-success)', bg: 'var(--color-success-light)' },
  NEGATIVE: { label: '부정', color: 'var(--color-danger)', bg: 'var(--color-danger-light)' },
  NEUTRAL: { label: '중립', color: 'var(--color-text-muted)', bg: 'var(--color-bg-subtle)' },
};

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

function SentimentLineChart({ history, isLoading, error }) {
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)', marginBottom: '2.5rem', border: '1px solid var(--color-border)', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }}></div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>감정 지수 분석 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)', marginBottom: '2.5rem', border: '1px solid var(--color-danger-light)', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>&#9888;&#65039;</div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-danger)', fontWeight: 600 }}>데이터를 불러올 수 없습니다</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>잠시 후 다시 시도해 주세요.</p>
      </div>
    );
  }

  const data = history.slice(0, 10).reverse().filter(r => r.status === '응답');
  if (data.length < 2) return (
    <div style={{ padding: '2rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)', marginBottom: '2.5rem', border: '1px solid var(--color-border)', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>&#128202;</div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>감정 지수 추이를 표시하려면 최소 2회 이상의 응답 기록이 필요합니다.</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>통화가 누적되면 자동으로 차트가 생성됩니다.</p>
    </div>
  );

  const width = 600;
  const height = 150;
  const padding = 40;

  const getX = (index) => padding + (index * (width - 2 * padding)) / (data.length - 1);
  const getY = (score) => height - padding - (score * (height - 2 * padding)) / 100;

  const points = data.map((d, i) => `${getX(i)},${getY(d.sentimentScore || 50)}`).join(' ');
  
  return (
    <div style={{ padding: '2rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)', marginBottom: '2.5rem', border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '4px', height: '18px', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }}></div>
          감정 지수 추이
        </h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div> 고점
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></div> 저점
          </div>
        </div>
      </div>
      
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 50, 100].map(val => (
            <g key={val}>
              <line x1={padding} y1={getY(val)} x2={width - padding} y2={getY(val)} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
              <text x="5" y={getY(val) + 4} fontSize="11" fill="var(--color-text-light)" fontWeight="700">{val}</text>
            </g>
          ))}
          <path d={`M ${getX(0)},${height - padding} ${data.map((d, i) => `L ${getX(i)},${getY(d.sentimentScore || 50)}`).join(' ')} L ${getX(data.length-1)},${height - padding} Z`} fill="url(#chart-gradient)" />
          <polyline fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} />
          {data.map((d, i) => {
            const score = d.sentimentScore || 50;
            const color = score > 70 ? 'var(--color-success)' : score < 30 ? 'var(--color-danger)' : 'var(--color-primary)';
            return <circle key={i} cx={getX(i)} cy={getY(score)} r="6" fill="white" stroke={color} strokeWidth="3" />;
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', marginTop: '1rem' }}>
        {data.map((d, i) => <span key={i} style={{ fontSize: '11px', color: 'var(--color-text-light)', fontWeight: 800 }}>{new Date(d.callTime).getMonth() + 1}/{new Date(d.callTime).getDate()}</span>)}
      </div>
    </div>
  );
}

function ChatView({ record, recipientName, onBack }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg-body)' }}>
      <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: 'var(--color-bg-surface)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="btn btn-outline" onClick={onBack} style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          뒤로가기
        </button>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)' }}></div>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>전체 발화 분석 리포트</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>{recipientName} 님과의 통화 전문</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ alignSelf: 'center', backgroundColor: 'var(--color-bg-surface)', padding: '0.5rem 1.25rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
          {new Date(record.callTime).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 통화 시작
        </div>

        {record.conversation && record.conversation.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1rem', flexDirection: msg.speaker === 'AI' ? 'row' : 'row-reverse' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', backgroundColor: msg.speaker === 'AI' ? 'var(--color-primary)' : 'var(--color-warning)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
              {msg.speaker === 'AI' ? 'AI' : 'USR'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.speaker === 'AI' ? 'flex-start' : 'flex-end', maxWidth: '70%' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.375rem', padding: '0 0.5rem' }}>
                {msg.speaker === 'AI' ? 'AI 상담원' : `${recipientName} 님`}
              </span>
              <div style={{ padding: '1rem 1.375rem', borderRadius: '1.5rem', fontSize: '0.9375rem', lineHeight: 1.6, backgroundColor: msg.speaker === 'AI' ? 'var(--color-bg-surface)' : 'var(--color-primary)', color: msg.speaker === 'AI' ? 'var(--color-text-main)' : 'white', border: msg.speaker === 'AI' ? '1px solid var(--color-border)' : 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderTopLeftRadius: msg.speaker === 'AI' ? '0.25rem' : '1.5rem', borderTopRightRadius: msg.speaker === 'AI' ? '1.5rem' : '0.25rem' }}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-light)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em' }}>
          • • • 통화 종료 • • •
        </div>
      </div>
    </div>
  );
}

export default function CallTimeline({ history, recipientName, onClose, recipientPhoto }) {
  const [selectedRecord, setSelectedRecord] = useState(null);

  if (selectedRecord) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '52rem', height: '88vh', overflow: 'hidden', border: 'none' }}>
          <ChatView record={selectedRecord} recipientName={recipientName} onBack={() => setSelectedRecord(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '56rem', display: 'flex', flexDirection: 'column', height: '92vh' }}>
        <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', flexShrink: 0 }}>
              <img src={recipientPhoto || DEFAULT_AVATAR} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{recipientName} 이력 상세</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>AI 기반 정밀 분석 히스토리</p>
            </div>
          </div>
          <button className="btn btn-ghost" aria-label="닫기" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', backgroundColor: 'var(--color-bg-body)' }}>
          <SentimentLineChart history={history} />

          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text-main)' }}>타임라인</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {history.map((record) => {
              const isUnanswered = record.status === '미응답';
              const sentiment = record.sentiment && SENTIMENT_LABELS[record.sentiment];

              return (
                <div key={record.contactId} className="card" style={{ padding: '1.75rem', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--color-text-main)' }}>{new Date(record.callTime).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</div>
                      <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.875rem' }}>
                        <span className={`badge ${isUnanswered ? 'badge-neutral' : 'badge-success'}`} style={{ padding: '0.25rem 0.75rem', fontWeight: 800 }}>{record.status}</span>
                        {!isUnanswered && (
                          <>
                            <span className={`badge ${record.riskLevel === '위험' ? 'badge-danger' : record.riskLevel === '주의' ? 'badge-warning' : 'badge-success'}`} style={{ padding: '0.25rem 0.75rem', fontWeight: 800 }}>{record.riskLevel}</span>
                            {sentiment && <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '99px', color: sentiment.color, backgroundColor: sentiment.bg, border: `1px solid ${sentiment.color}` }}>{sentiment.label} ({record.sentimentScore}점)</span>}
                          </>
                        )}
                      </div>
                    </div>
                    {!isUnanswered && (
                      <button className="btn btn-primary" style={{ padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-lg)', fontWeight: 800, boxShadow: 'var(--shadow-md)' }} onClick={() => setSelectedRecord(record)}>대화 상세 리포트</button>
                    )}
                  </div>

                  {!isUnanswered && (
                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
                      <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 900, color: 'var(--color-text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>AI 컨텍스트 요약</div>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-main)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{record.summary}</p>
                      </div>
                      <div style={{ padding: '1.25rem', backgroundColor: record.riskLevel === '정상' ? 'var(--color-success-light)' : 'var(--color-danger-light)', borderRadius: 'var(--radius-lg)', border: `1px solid ${record.riskLevel === '정상' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 900, color: record.riskLevel === '정상' ? 'var(--color-success-hover)' : 'var(--color-danger-hover)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>판단 근거</div>
                        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-main)', margin: 0, fontWeight: 700 }}>{record.riskReason || '이상 징후 미발견'}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
