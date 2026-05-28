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
  MIXED: { label: '복합', color: 'var(--color-warning-hover)', bg: 'var(--color-warning-light)' },
};

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

function SentimentLineChart({ history, isLoading, error }) {
  const data = history.filter(r => r.status === '응답').slice(0, 10).reverse();

  if (isLoading) return (
    <div style={{ padding: '2rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)', marginBottom: '2.5rem', border: '1px solid var(--color-border)', textAlign: 'center' }}>
      <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>감정 지수 분석 중...</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)', marginBottom: '2.5rem', border: '1px solid var(--color-danger-light)', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>&#9888;&#65039;</div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-danger)', fontWeight: 600 }}>데이터를 불러올 수 없습니다</p>
    </div>
  );

  if (data.length < 2) return (
    <div style={{ padding: '2rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)', marginBottom: '2.5rem', border: '1px solid var(--color-border)', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>&#128202;</div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>최소 2회 이상의 응답 기록이 필요합니다.</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>통화가 누적되면 자동으로 차트가 생성됩니다.</p>
    </div>
  );

  const W = 600, H = 190, PL = 46, PR = 58, PT = 28, PB = 18;
  const cW = W - PL - PR, cH = H - PT - PB;

  const scores = data.map(d => d.sentimentScore ?? 50);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const latest = scores[scores.length - 1];
  const trendDiff = latest - scores[scores.length - 2];
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  const gx = i => PL + (i / (data.length - 1)) * cW;
  const gy = s => PT + cH * (1 - s / 100);
  const pts = scores.map((s, i) => ({ x: gx(i), y: gy(s), s }));

  let linePath = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    linePath += ` C${cx},${pts[i - 1].y} ${cx},${pts[i].y} ${pts[i].x},${pts[i].y}`;
  }
  const bottomY = PT + cH;
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${bottomY} L${pts[0].x},${bottomY}Z`;

  const zc = s => s >= 70 ? '#10b981' : s >= 40 ? '#f59e0b' : '#ef4444';
  const avgColor = zc(avg);
  const latestColor = zc(latest);

  const statCards = [
    { label: '최신', val: latest, color: latestColor, large: true },
    { label: '평균', val: avg, color: avgColor },
    { label: '최고', val: maxScore, color: zc(maxScore) },
    { label: '최저', val: minScore, color: zc(minScore) },
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', marginBottom: '2.5rem', overflow: 'hidden' }}>

      {/* ── Stats header ── */}
      <div style={{ padding: '1.125rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--color-text-light)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Sentiment Trend</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-main)' }}>감정 지수 추이</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {statCards.map(({ label, val, color, large }) => (
            <div key={label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: large ? '0.5rem 1rem' : '0.375rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: `${color}18`,
              border: `1.5px solid ${color}45`,
            }}>
              <span style={{ fontSize: large ? '1.5rem' : '1.125rem', fontWeight: 900, color, lineHeight: 1 }}>{val}</span>
              <span style={{ fontSize: '0.5625rem', fontWeight: 800, color, opacity: 0.85, marginTop: '0.2rem', letterSpacing: '0.04em' }}>{label}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: trendDiff >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1.5px solid ${trendDiff >= 0 ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 900, color: trendDiff >= 0 ? '#10b981' : '#ef4444', lineHeight: 1 }}>
              {trendDiff >= 0 ? '↑' : '↓'}{Math.abs(trendDiff)}
            </span>
            <span style={{ fontSize: '0.5625rem', fontWeight: 800, color: trendDiff >= 0 ? '#10b981' : '#ef4444', opacity: 0.85, marginTop: '0.2rem' }}>추세</span>
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ paddingTop: '0.5rem' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', height: '176px' }}>
          <defs>
            <linearGradient id="slt-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={avgColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={avgColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Zone bands */}
          <rect x={PL} y={gy(100)} width={cW} height={gy(70) - gy(100)} fill="rgba(16,185,129,0.06)" />
          <rect x={PL} y={gy(70)} width={cW} height={gy(40) - gy(70)} fill="rgba(245,158,11,0.05)" />
          <rect x={PL} y={gy(40)} width={cW} height={gy(0) - gy(40)} fill="rgba(239,68,68,0.05)" />

          {/* Threshold lines */}
          <line x1={PL} y1={gy(70)} x2={PL + cW} y2={gy(70)} stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" strokeDasharray="5,4" />
          <line x1={PL} y1={gy(40)} x2={PL + cW} y2={gy(40)} stroke="rgba(239,68,68,0.4)" strokeWidth="1.5" strokeDasharray="5,4" />

          {/* Y-axis labels */}
          {[0, 40, 70, 100].map(v => (
            <text key={v} x={PL - 7} y={gy(v) + 4} fontSize="10" textAnchor="end"
              fill={v === 70 ? '#10b981' : v === 40 ? '#ef4444' : 'var(--color-text-light)'}
              fontWeight={v === 70 || v === 40 ? '800' : '600'}>{v}</text>
          ))}

          {/* Zone labels (right) */}
          <text x={PL + cW + 7} y={gy(84) + 4} fontSize="10" fill="#10b981" fontWeight="800">양호</text>
          <text x={PL + cW + 7} y={gy(55) + 4} fontSize="10" fill="#f59e0b" fontWeight="800">보통</text>
          <text x={PL + cW + 7} y={gy(18) + 4} fontSize="10" fill="#ef4444" fontWeight="800">주의</text>

          {/* Area fill */}
          <path d={areaPath} fill="url(#slt-area)" />

          {/* Smooth line */}
          <path d={linePath} fill="none" stroke={avgColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots + score labels */}
          {pts.map((pt, i) => {
            const c = zc(pt.s);
            const isLatest = i === pts.length - 1;
            const labelY = pt.s >= 65 ? pt.y + 21 : pt.y - 13;
            return (
              <g key={i}>
                <text x={pt.x} y={labelY} textAnchor="middle" fontSize="11" fontWeight="900" fill={c}>{pt.s}</text>
                {isLatest && (
                  <circle cx={pt.x} cy={pt.y} r="8" fill={c} opacity="0">
                    <animate attributeName="r" values="8;20;8" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.28;0;0.28" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={pt.x} cy={pt.y} r={isLatest ? 8 : 7} fill="white" stroke={c} strokeWidth="2.5" />
                <circle cx={pt.x} cy={pt.y} r={isLatest ? 4 : 3} fill={c} />
                {pt.s === maxScore && scores.filter(s => s === maxScore).length === 1 && (
                  <text x={pt.x} y={labelY - 13} textAnchor="middle" fontSize="8" fill="#10b981" fontWeight="900">▲최고</text>
                )}
                {pt.s === minScore && scores.filter(s => s === minScore).length === 1 && (
                  <text x={pt.x} y={labelY + (pt.s >= 65 ? 13 : 26)} textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="900">▼최저</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Date + sentiment labels */}
        <div style={{ position: 'relative', height: '52px' }}>
          {data.map((d, i) => {
            const sl = d.sentiment ? SENTIMENT_LABELS[d.sentiment] : null;
            const leftPct = (gx(i) / W * 100).toFixed(2);
            const dt = new Date(d.callTime);
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${leftPct}%`,
                transform: 'translateX(-50%)',
                top: '0.25rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
              }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {dt.getMonth() + 1}/{dt.getDate()}
                </span>
                {sl ? (
                  <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: sl.color, backgroundColor: sl.bg, padding: '1px 5px', borderRadius: '99px', whiteSpace: 'nowrap' }}>{sl.label}</span>
                ) : (
                  <span style={{ fontSize: '0.5625rem', color: 'var(--color-text-light)', fontWeight: 600 }}>—</span>
                )}
              </div>
            );
          })}
        </div>
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
              const sentiment = record.sentiment ? SENTIMENT_LABELS[record.sentiment] : null;
              const scoreOnly = !sentiment && record.sentimentScore != null;

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
                            {scoreOnly && <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '99px', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-dark)' }}>{record.sentimentScore}점</span>}
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
