import React, { useEffect, useRef, useState } from 'react';
import RecipientList from './components/RecipientList';
import CallTimeline from './components/CallTimeline';
import RiskStatusPanel from './components/RiskStatusPanel';
import AdminAccountsScreen from './components/admin/AdminAccountsScreen';
import MyAccountScreen from './components/admin/MyAccountScreen';
import SecuritySettingsScreen from './components/admin/SecuritySettingsScreen';
import { RECIPIENTS as INITIAL_RECIPIENTS, TODAY_STATUS, TODAY_RECORDS, getCallHistory } from './mockData';
import { ADMIN_ACCOUNTS, SECURITY_EVENTS } from './components/admin/adminMockData';

const DASHBOARD_TABS = ['위험도 현황', '대상자 목록'];

const APP_VIEWS = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'adminAccounts', label: '관리자 계정' },
  { id: 'myAccount', label: '내 계정' },
  { id: 'security', label: '보안 설정' },
];

function getAvatarLabel(name, email) {
  return (name?.trim()?.[0] || email?.trim()?.[0] || 'A').toUpperCase();
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) { setError('이메일과 비밀번호를 입력해주세요.'); return; }
    setError('');
    onLogin({ email: email.trim(), password: password.trim() });
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
           <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-lg)' }}>
             <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>AI</span>
           </div>
          <h1 className="login-title">CareCall</h1>
          <p className="login-subtitle">관리자 통합 대시보드</p>
        </div>

        <form className="form-group" style={{ gap: '1.5rem' }} onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">관리자 이메일</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@carecall.kr" />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p style={{ margin: 0, color: 'var(--color-danger)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
            시스템 로그인
          </button>
        </form>
      </div>
    </div>
  );
}

function AccountMenu({ currentUser, currentView, onNavigate, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false); }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button className="btn btn-outline" style={{ padding: '0.375rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: 'var(--radius-lg)' }} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', overflow: 'hidden' }}>
          {currentUser.photo ? <img src={currentUser.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getAvatarLabel(currentUser.name, currentUser.email)}
        </div>
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currentUser.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '240px', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', padding: '0.5rem', zIndex: 100 }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.875rem', margin: 0 }}>{currentUser.name}</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{currentUser.email}</p>
          </div>
          {APP_VIEWS.map((view) => (
            <button key={view.id} className="btn btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', fontSize: '0.875rem', color: currentView === view.id ? 'var(--color-primary)' : 'var(--color-text-main)', backgroundColor: currentView === view.id ? 'var(--color-bg-subtle)' : 'transparent' }} onClick={() => { onNavigate(view.id); setIsOpen(false); }}>
              {view.label}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-danger)', fontSize: '0.875rem' }} onClick={onLogout}>로그아웃</button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('위험도 현황');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [adminAccounts, setAdminAccounts] = useState(ADMIN_ACCOUNTS);
  const [recipients, setRecipients] = useState(INITIAL_RECIPIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardFilter, setDashboardFilter] = useState('전체');

  const currentUser = adminAccounts[0]; 

  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset filter when going to Recipient List to show everyone by default
    if (tab === '대상자 목록') {
      setDashboardFilter('전체');
    }
  };

  const handleRecipientSelect = (r) => {
    setSelectedRecipient(r);
    setCallHistory(getCallHistory(r.recipientId));
  };

  const filteredRecipients = recipients.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.phoneNumber.includes(searchQuery);
    const matchesFilter = dashboardFilter === '전체' || r.lastRiskLevel === dashboardFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredTodayRecords = TODAY_RECORDS.filter(r => {
    if (dashboardFilter === '전체') return true;
    if (dashboardFilter === '미응답') return r.status === '미응답' || r.riskLevel === '미응답';
    return r.riskLevel === dashboardFilter;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header glass">
        <div className="container app-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => { setCurrentView('dashboard'); setDashboardFilter('전체'); setActiveTab('위험도 현황'); }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>AI</span>
              </div>
              <h1 className="app-title" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>CareCall</h1>
            </div>

            {currentView === 'dashboard' && (
              <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                {DASHBOARD_TABS.map((tab) => (
                  <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} style={{ padding: '1.25rem 0' }} onClick={() => handleTabChange(tab)}>
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {currentView === 'dashboard' && (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg 
                  style={{ position: 'absolute', left: '0.875rem', color: 'var(--color-text-light)', pointerEvents: 'none' }} 
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="form-input"
                  placeholder="대상자 검색..."
                  style={{ width: '240px', paddingLeft: '2.75rem', backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <AccountMenu currentUser={currentUser} currentView={currentView} onNavigate={setCurrentView} onLogout={() => setIsAuthenticated(false)} />
          </div>
        </div>
      </header>

      <div style={{ flex: 1, backgroundColor: 'var(--color-bg-body)' }}>
        <div className="container" style={{ padding: '2.5rem 2rem' }}>
          {currentView === 'dashboard' ? (
             activeTab === '위험도 현황' ? (
               <RiskStatusPanel 
                  todayStatus={TODAY_STATUS} 
                  atRiskList={filteredTodayRecords} 
                  activeFilter={dashboardFilter}
                  onFilterChange={setDashboardFilter}
                  onRecipientSelect={(name) => {
                    const recipient = recipients.find(r => r.name === name);
                    if (recipient) handleRecipientSelect(recipient);
                  }}
               />
             ) : (
               <RecipientList
                 recipients={filteredRecipients}
                 onSelect={handleRecipientSelect}
                 onAdd={(r) => setRecipients([...recipients, r])}
                 onUpdate={(r) => setRecipients(recipients.map(i => i.recipientId === r.recipientId ? r : i))}
                 onDelete={(id) => setRecipients(recipients.filter(r => r.recipientId !== id))}
               />
             )
          ) : (
             currentView === 'adminAccounts' ? <AdminAccountsScreen accounts={adminAccounts} currentUser={currentUser} onUpdateStatus={() => {}} /> :
             currentView === 'myAccount' ? <MyAccountScreen user={currentUser} onSaveProfile={() => {}} /> :
             <SecuritySettingsScreen securityEvents={SECURITY_EVENTS} onChangePassword={() => {}} />
          )}
        </div>
      </div>

      {selectedRecipient && (
        <CallTimeline
          history={callHistory}
          recipientName={selectedRecipient.name}
          recipientPhoto={selectedRecipient.photo}
          onClose={() => setSelectedRecipient(null)}
        />
      )}
    </div>
  );
}

export default App;
