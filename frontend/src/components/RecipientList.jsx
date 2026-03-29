// ✓ c5 - 대상자 목록 컴포넌트
import React from 'react';

const RISK_BADGE = {
  위험: { background: '#ff4d4f', color: '#fff' },
  주의: { background: '#faad14', color: '#fff' },
  정상: { background: '#52c41a', color: '#fff' },
};

/**
 * 대상자 목록을 테이블로 렌더링한다.
 * @param {{ recipients: Array, onSelect: Function }} props
 */
function RecipientList({ recipients, onSelect }) {
  if (!recipients || recipients.length === 0) {
    return <p style={styles.empty}>등록된 대상자가 없습니다.</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>대상자 목록</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>이름</th>
            <th style={styles.th}>연락처</th>
            <th style={styles.th}>담당 복지사</th>
            <th style={styles.th}>최근 위험도</th>
            <th style={styles.th}>상세</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((r) => (
            <tr key={r.recipientId} style={styles.tr}>
              <td style={styles.td}>{r.name}</td>
              <td style={styles.td}>{r.phoneNumber}</td>
              <td style={styles.td}>{r.assignedWorker || '-'}</td>
              <td style={styles.td}>
                {r.lastRiskLevel ? (
                  <span style={{ ...styles.badge, ...RISK_BADGE[r.lastRiskLevel] }}>
                    {r.lastRiskLevel}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td style={styles.td}>
                <button style={styles.button} onClick={() => onSelect && onSelect(r)}>
                  이력 보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { marginBottom: '32px' },
  title: { fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f0f2f5', padding: '10px 12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #d9d9d9' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px 12px', verticalAlign: 'middle' },
  badge: { padding: '2px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' },
  button: { padding: '4px 12px', fontSize: '12px', cursor: 'pointer', border: '1px solid #1890ff', color: '#1890ff', background: '#fff', borderRadius: '4px' },
  empty: { color: '#999' },
};

export default RecipientList;
