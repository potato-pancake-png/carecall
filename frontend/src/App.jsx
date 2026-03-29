// ✓ c5 - React 대시보드 루트 컴포넌트
import React, { useState, useCallback } from 'react';
import RecipientList from './components/RecipientList';
import CallTimeline from './components/CallTimeline';
import RiskStatusPanel from './components/RiskStatusPanel';
import { RECIPIENTS, TODAY_STATUS, AT_RISK_LIST, getCallHistory } from './mockData';

const TABS = ['위험도 현황', '대상자 목록'];

function App() {
  const [activeTab, setActiveTab] = useState('위험도 현황');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [callHistory, setCallHistory] = useState([]);

  const handleRecipientSelect = useCallback((recipient) => {
    setSelectedRecipient(recipient);
    setCallHistory(getCallHistory(recipient.recipientId));
  }, []);

  const handleCloseTimeline = useCallback(() => {
    setSelectedRecipient(null);
    setCallHistory([]);
  }, []);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>AI 안부전화 관리자 대시보드</h1>
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
        {activeTab === '위험도 현황' && (
          <RiskStatusPanel todayStatus={TODAY_STATUS} atRiskList={AT_RISK_LIST} />
        )}
        {activeTab === '대상자 목록' && (
          <RecipientList recipients={RECIPIENTS} onSelect={handleRecipientSelect} />
        )}
      </main>

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
  header: { background: '#001529', color: '#fff', padding: '0 32px', display: 'flex', alignItems: 'center', height: '64px' },
  headerTitle: { margin: 0, fontSize: '20px', fontWeight: '600' },
  nav: { background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 32px', display: 'flex' },
  tabBtn: { padding: '16px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', color: '#595959', borderBottom: '2px solid transparent' },
  tabBtnActive: { color: '#1890ff', borderBottomColor: '#1890ff', fontWeight: '600' },
  main: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
};

export default App;
