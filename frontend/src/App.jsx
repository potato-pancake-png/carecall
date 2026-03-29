// ✓ c5 - React 대시보드 루트 컴포넌트
import React, { useState, useEffect, useCallback } from 'react';
import RecipientList from './components/RecipientList';
import CallTimeline from './components/CallTimeline';
import RiskStatusPanel from './components/RiskStatusPanel';
import { fetchRecipients, fetchTodayCallStatus, fetchAtRiskList, fetchCallHistory } from './api/dashboardApi';

const TABS = ['위험도 현황', '대상자 목록'];

/**
 * 대시보드 메인 앱 — 탭 전환으로 위험도 현황과 대상자 목록을 제공한다.
 */
function App() {
  const [activeTab, setActiveTab] = useState('위험도 현황');
  const [recipients, setRecipients] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [atRiskList, setAtRiskList] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✓ c5 - 대상자 목록 및 통화 현황 데이터 불러오기
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recipientsData, todayData, atRiskData] = await Promise.all([
        fetchRecipients(),
        fetchTodayCallStatus(),
        fetchAtRiskList(),
      ]);
      setRecipients(recipientsData);
      setTodayStatus(todayData);
      setAtRiskList(atRiskData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ✓ c5 - 통화 이력 타임라인 불러오기
  const handleRecipientSelect = useCallback(async (recipient) => {
    setSelectedRecipient(recipient);
    try {
      const history = await fetchCallHistory(recipient.recipientId);
      setCallHistory(history);
    } catch (err) {
      setCallHistory([]);
    }
  }, []);

  const handleCloseTimeline = useCallback(() => {
    setSelectedRecipient(null);
    setCallHistory([]);
  }, []);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>AI 안부전화 관리자 대시보드</h1>
        <button style={styles.refreshBtn} onClick={loadDashboardData} disabled={loading}>
          {loading ? '로딩 중...' : '새로고침'}
        </button>
      </header>

      <nav style={styles.nav}>
        {TABS.map((tab) => (
          <button
            key={tab}
            style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.tabBtnActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        {error && <div style={styles.error}>오류: {error}</div>}

        {/* ✓ c5 - 위험도 현황 렌더링 */}
        {activeTab === '위험도 현황' && (
          <RiskStatusPanel todayStatus={todayStatus} atRiskList={atRiskList} />
        )}

        {/* ✓ c5 - 대상자 목록 렌더링 */}
        {activeTab === '대상자 목록' && (
          <RecipientList recipients={recipients} onSelect={handleRecipientSelect} />
        )}
      </main>

      {/* ✓ c5 - 통화 이력 타임라인 렌더링 */}
      {selectedRecipient && (
        <CallTimeline
          history={callHistory}
          recipientName={selectedRecipient.name}
          onClose={handleCloseTimeline}
        />
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  header: { background: '#001529', color: '#fff', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '600' },
  refreshBtn: { padding: '6px 16px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  nav: { background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 32px', display: 'flex', gap: '0' },
  tabBtn: { padding: '16px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', color: '#595959', borderBottom: '2px solid transparent' },
  tabBtnActive: { color: '#1890ff', borderBottomColor: '#1890ff', fontWeight: '600' },
  main: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  error: { background: '#fff1f0', border: '1px solid #ff4d4f', color: '#ff4d4f', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' },
};

export default App;
