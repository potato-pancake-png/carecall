// ✓ c5 - 위험도 현황 컴포넌트
import React from 'react';

const RISK_STYLE = {
  위험: { border: '1px solid #ff4d4f', background: '#fff1f0', color: '#ff4d4f' },
  주의: { border: '1px solid #faad14', background: '#fffbe6', color: '#d48806' },
  정상: { border: '1px solid #52c41a', background: '#f6ffed', color: '#389e0d' },
  미응답: { border: '1px solid #8c8c8c', background: '#f5f5f5', color: '#595959' },
};

const BADGE_STYLE = {
  위험: { background: '#ff4d4f', color: '#fff' },
  주의: { background: '#faad14', color: '#fff' },
  정상: { background: '#52c41a', color: '#fff' },
  미응답: { background: '#8c8c8c', color: '#fff' },
};

function TodayStatusCards({ todayStatus }) {
  if (!todayStatus) return null;
  const { total, riskCounts, date } = todayStatus;
  return (
    <div style={styles.section}>
      <h2 style={styles.title}>오늘의 통화 현황 ({date})</h2>
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <div style={styles.cardNum}>{total}</div>
          <div style={styles.cardLabel}>총 발신</div>
        </div>
        {Object.entries(riskCounts).map(([level, count]) => (
          <div key={level} style={{ ...styles.card, ...RISK_STYLE[level] }}>
            <div style={styles.cardNum}>{count}</div>
            <div style={styles.cardLabel}>{level}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AtRiskList({ atRiskList }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.title}>주의·위험·미응답 목록</h2>
      {!atRiskList || atRiskList.length === 0 ? (
        <p style={styles.empty}>해당 없음</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>이름</th>
              <th style={styles.th}>상태</th>
              <th style={styles.th}>위험도</th>
              <th style={styles.th}>통화 시간</th>
              <th style={styles.th}>통화 시간(분)</th>
              <th style={styles.th}>판단 근거</th>
            </tr>
          </thead>
          <tbody>
            {atRiskList.map((r) => {
              const level = r.status === '미응답' ? '미응답' : r.riskLevel;
              return (
                <tr key={r.contactId} style={styles.tr}>
                  <td style={styles.td}>{r.recipientName}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: r.status === '미응답' ? '#8c8c8c' : '#1890ff' }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {level ? (
                      <span style={{ ...styles.badge, ...BADGE_STYLE[level] }}>{level}</span>
                    ) : '-'}
                  </td>
                  <td style={styles.td}>
                    {r.callTime ? new Date(r.callTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td style={styles.td}>
                    {r.duration != null ? `${r.duration}분` : '-'}
                  </td>
                  <td style={styles.td}>{r.riskReason || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function RiskStatusPanel({ todayStatus, atRiskList }) {
  return (
    <div>
      <TodayStatusCards todayStatus={todayStatus} />
      <AtRiskList atRiskList={atRiskList} />
    </div>
  );
}

const styles = {
  section: { marginBottom: '32px' },
  title: { fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' },
  cardRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  card: { padding: '20px 28px', borderRadius: '8px', border: '1px solid #d9d9d9', background: '#fafafa', minWidth: '120px', textAlign: 'center' },
  cardNum: { fontSize: '32px', fontWeight: 'bold' },
  cardLabel: { fontSize: '14px', marginTop: '4px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f0f2f5', padding: '10px 12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #d9d9d9', fontSize: '13px' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px 12px', verticalAlign: 'middle', fontSize: '14px' },
  badge: { padding: '2px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: '#fff' },
  empty: { color: '#999' },
};

export default RiskStatusPanel;
