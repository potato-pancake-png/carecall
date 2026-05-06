import React, { useState } from 'react';

const PERIODS = ['이번 주', '이번 달', '전체'];

const STATS = {
  '이번 주': {
    totalCalls: 67, successCalls: 54, missedCalls: 13,
    callSuccessRate: 81.2,
    aiAccuracy: 91.3, verifiedCalls: 23, mismatchCalls: 2,
    avgLatency: 3.1,
    correctionCount: 2, correctionByLevel: { 위험: 1, 주의: 1, 정상: 0 },
    dailyCalls: [9, 11, 8, 13, 10, 7, 9],
    dailyLabels: ['월', '화', '수', '목', '금', '토', '일'],
  },
  '이번 달': {
    totalCalls: 284, successCalls: 223, missedCalls: 61,
    callSuccessRate: 78.4,
    aiAccuracy: 92.1, verifiedCalls: 100, mismatchCalls: 8,
    avgLatency: 3.2,
    correctionCount: 8, correctionByLevel: { 위험: 3, 주의: 4, 정상: 1 },
    dailyCalls: [42, 38, 45, 51, 39, 32, 37],
    dailyLabels: ['1주', '2주', '3주', '4주', '5주', '—', '—'],
  },
  '전체': {
    totalCalls: 1248, successCalls: 960, missedCalls: 288,
    callSuccessRate: 76.9,
    aiAccuracy: 90.8, verifiedCalls: 513, mismatchCalls: 47,
    avgLatency: 3.4,
    correctionCount: 47, correctionByLevel: { 위험: 18, 주의: 23, 정상: 6 },
    dailyCalls: [180, 210, 240, 290, 328],
    dailyLabels: ['1월', '2월', '3월', '4월', '5월'],
  },
};

function CircleProgress({ percent, size = 88, strokeWidth = 7, color, children }) {
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(percent, 100) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
      </svg>
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>{children}</div>
    </div>
  );
}

function MiniBar({ value, max, color }) {
  return (
    <div style={{ height: '5px', backgroundColor: 'var(--color-border)', borderRadius: '99px', overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${(value / max) * 100}%`, height: '100%', backgroundColor: color, borderRadius: '99px', transition: 'width 0.7s ease' }} />
    </div>
  );
}

function BarChart({ values, labels, color }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px' }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', backgroundColor: color, borderRadius: '3px 3px 0 0',
            height: `${(v / max) * 100}%`, minHeight: '3px',
            transition: 'height 0.7s ease', opacity: 0.85,
          }} />
          <span style={{ fontSize: '0.5625rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsPanel() {
  const [period, setPeriod] = useState('이번 달');
  const d = STATS[period];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>통계</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            시스템 운영 현황을 수치로 확인합니다.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`btn ${period === p ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: 3 core KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* 안부 전화 성공률 */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <CircleProgress percent={d.callSuccessRate} color="var(--color-primary)">
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{d.callSuccessRate.toFixed(1)}</div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--color-text-muted)' }}>%</div>
          </CircleProgress>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.625rem' }}>안부 전화 성공률</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>성공</span>
                <MiniBar value={d.successCalls} max={d.totalCalls} color="var(--color-primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>{d.successCalls}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>미응답</span>
                <MiniBar value={d.missedCalls} max={d.totalCalls} color="var(--color-border-dark)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0 }}>{d.missedCalls}</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-light)', marginTop: '0.125rem' }}>
                총 {d.totalCalls.toLocaleString()}건 발신 · 30초↑ + 발화 2회↑ 기준
              </div>
            </div>
          </div>
        </div>

        {/* AI 위험 탐지 정확도 */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <CircleProgress percent={d.aiAccuracy} color="var(--color-success)">
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-success-hover)', lineHeight: 1 }}>{d.aiAccuracy.toFixed(1)}</div>
            <div style={{ fontSize: '0.5625rem', color: 'var(--color-text-muted)' }}>%</div>
          </CircleProgress>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.625rem' }}>AI 위험 탐지 정확도</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>일치</span>
                <MiniBar value={d.verifiedCalls - d.mismatchCalls} max={d.verifiedCalls} color="var(--color-success)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success-hover)', flexShrink: 0 }}>{d.verifiedCalls - d.mismatchCalls}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>불일치</span>
                <MiniBar value={d.mismatchCalls} max={d.verifiedCalls} color="var(--color-danger)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-danger)', flexShrink: 0 }}>{d.mismatchCalls}</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-light)', marginTop: '0.125rem' }}>
                복지사 재평가 {d.verifiedCalls}건 검증 기준
              </div>
            </div>
          </div>
        </div>

        {/* 평균 처리 시간 */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.375rem' }}>평균 처리·지연 시간</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              STT → AI 감정 분석 → 대시보드 반영
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, color: d.avgLatency <= 5 ? 'var(--color-warning-hover)' : 'var(--color-danger)', lineHeight: 1 }}>{d.avgLatency}</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>초</span>
          </div>
        </div>
      </div>

      {/* Row 2: 정정 현황 + 발신 추이 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* 위험도 정정 현황 */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>위험도 수동 정정 현황</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                AI 판정을 관리자가 직접 정정한 건수
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>{d.correctionCount}</span>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>건</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: '위험으로 정정', value: d.correctionByLevel.위험, color: 'var(--color-danger)', bg: 'var(--color-danger-light)', textColor: 'var(--color-danger-hover)' },
              { label: '주의로 정정', value: d.correctionByLevel.주의, color: 'var(--color-warning)', bg: 'var(--color-warning-light)', textColor: 'var(--color-warning-hover)' },
              { label: '정상으로 정정', value: d.correctionByLevel.정상, color: 'var(--color-success)', bg: 'var(--color-success-light)', textColor: 'var(--color-success-hover)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600, flexShrink: 0, width: '88px',
                  padding: '0.25rem 0.5rem', backgroundColor: item.bg, color: item.textColor,
                  borderRadius: '99px', textAlign: 'center',
                }}>{item.label}</span>
                <MiniBar value={item.value} max={d.correctionCount || 1} color={item.color} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-main)', flexShrink: 0, width: '20px', textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.6875rem', color: 'var(--color-text-light)', lineHeight: 1.6 }}>
            정정 비율 {d.correctionCount > 0 && d.totalCalls > 0 ? ((d.correctionCount / d.totalCalls) * 100).toFixed(1) : '0.0'}%
            — AI 자동 분류 대비 관리자 개입 빈도
          </div>
        </div>

        {/* 발신 추이 */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>발신 추이</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              기간별 발신 건수 분포
            </div>
          </div>
          <BarChart values={d.dailyCalls} labels={d.dailyLabels} color="var(--color-primary)" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{Math.max(...d.dailyCalls)}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>최대</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{Math.round(d.dailyCalls.reduce((a, b) => a + b, 0) / d.dailyCalls.length)}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>평균</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{Math.min(...d.dailyCalls)}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>최소</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-primary)' }}>{d.totalCalls.toLocaleString()}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>합계</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
