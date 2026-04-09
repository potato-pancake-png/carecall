import React, { useState } from 'react';
import { sortByType } from '../utils/sort';

const RISK_CONFIG = {
  전체: { label: '총 발신', badgeClass: 'badge-neutral', color: 'var(--color-text-main)', border: 'var(--color-border)' },
  위험: { label: '위험', badgeClass: 'badge-danger', color: 'var(--color-danger)', border: 'var(--color-danger)' },
  주의: { label: '주의', badgeClass: 'badge-warning', color: 'var(--color-warning)', border: 'var(--color-warning)' },
  정상: { label: '정상', badgeClass: 'badge-success', color: 'var(--color-success)', border: 'var(--color-success)' },
  미응답: { label: '미응답', badgeClass: 'badge-neutral', color: 'var(--color-text-light)', border: 'var(--color-border-dark)' },
};

function TodayStatusCards({ todayStatus, activeFilter, onFilterChange }) {
  if (!todayStatus) return null;
  const { total, riskCounts, date } = todayStatus;
  
  const cards = [
    { type: '전체', count: total },
    ...Object.entries(riskCounts).map(([type, count]) => ({ type, count }))
  ];

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em' }}>오늘의 통화 인사이트</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>카드를 클릭하여 상세 대상자를 필터링하세요.</p>
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-light)', backgroundColor: 'var(--color-bg-subtle)', padding: '0.25rem 0.75rem', borderRadius: '99px' }}>{date} 기준</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        {cards.map(({ type, count }) => {
          const config = RISK_CONFIG[type];
          const isActive = activeFilter === type;
          const isUrgent = (type === '위험' || type === '주의') && count > 0;
          
          return (
            <div 
              key={type} 
              className={`card ${isUrgent ? (type === '위험' ? 'pulse-danger' : 'pulse-warning') : ''}`} 
              style={{ 
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1.5rem',
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isActive ? `2px solid ${config.color}` : '1px solid var(--color-border)',
                backgroundColor: isActive ? 'var(--color-bg-subtle)' : 'var(--color-bg-surface)',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isActive ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                position: 'relative', overflow: 'hidden'
              }}
              onClick={() => onFilterChange(type)}
            >
              {isActive && (
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: config.color }}></div>
                </div>
              )}
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: config.color, lineHeight: 1, marginBottom: '0.5rem' }}>{count}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{config.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AtRiskList({ atRiskList, activeFilter, onRecipientSelect }) {
  const [sortType, setSortType] = useState('default');

  const sortedData = sortByType(atRiskList, sortType, (r) => r.status === '응답', (r) => r.riskLevel);

  return (
    <div style={{ animation: 'slideUp 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {activeFilter === '전체' ? '집중 모니터링 대상' : `${activeFilter} 판정 대상자`}
          </h2>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{atRiskList.length}명</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['default', 'response', 'risk'].map((type) => (
            <button
              key={type}
              onClick={() => setSortType(type)}
              className={`btn ${sortType === type ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem', borderRadius: 'var(--radius-md)' }}
            >
              {type === 'default' ? '기본순' : type === 'response' ? '미통화 우선' : '위험도순'}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
        {atRiskList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
            <p style={{ fontWeight: 600 }}>해당 조건에 맞는 대상자가 없습니다.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>대상자 명</th>
                  <th>상태</th>
                  <th>AI 판정</th>
                  <th>발신 시각</th>
                  <th>통화량</th>
                  <th>리스크 감지 사유</th>
                  <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((r) => {
                  const level = r.status === '미응답' ? '미응답' : r.riskLevel;
                  const config = RISK_CONFIG[level] || RISK_CONFIG['미응답'];
                  const isUrgent = level === '위험' || level === '주의';
                  
                  return (
                    <tr 
                      key={r.contactId} 
                      style={{ 
                        backgroundColor: isUrgent ? (level === '위험' ? 'rgba(239, 68, 68, 0.02)' : 'rgba(245, 158, 11, 0.02)') : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td style={{ fontWeight: 800, padding: '1.25rem 1.5rem', color: isUrgent ? config.color : 'var(--color-text-main)' }}>
                        {r.recipientName}
                      </td>
                      <td>
                        <span className={`badge ${r.status === '미응답' ? 'badge-neutral' : 'badge-success'}`} style={{ fontWeight: 700 }}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div className={`badge ${config.badgeClass}`} style={{ fontWeight: 900, padding: '0.375rem 0.75rem', fontSize: '0.75rem', minWidth: '60px', textAlign: 'center' }}>
                          {level || '분석 중'}
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>
                        {r.callTime ? new Date(r.callTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}>
                        {r.duration != null ? `${r.duration}분` : '-'}
                      </td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem', fontWeight: 600, color: isUrgent ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                        {r.riskReason || '-'}
                      </td>
                      <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }} onClick={() => onRecipientSelect(r.recipientName)}>이력보기</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RiskStatusPanel({ todayStatus, atRiskList, activeFilter, onFilterChange, onRecipientSelect }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <TodayStatusCards todayStatus={todayStatus} activeFilter={activeFilter} onFilterChange={onFilterChange} />
      <AtRiskList atRiskList={atRiskList} activeFilter={activeFilter} onRecipientSelect={onRecipientSelect} />
    </div>
  );
}
