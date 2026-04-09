import React, { useEffect, useRef, useState } from 'react';
import RecipientList from './components/RecipientList';
import CallTimeline from './components/CallTimeline';
import RiskStatusPanel from './components/RiskStatusPanel';
import AdminAccountsScreen from './components/admin/AdminAccountsScreen';
import MyAccountScreen from './components/admin/MyAccountScreen';
import SecuritySettingsScreen from './components/admin/SecuritySettingsScreen';
import { RECIPIENTS, TODAY_STATUS, AT_RISK_LIST, getCallHistory } from './mockData';
import { ADMIN_ACCOUNTS, SECURITY_EVENTS } from './components/admin/adminMockData';

const DASHBOARD_TABS = ['위험도 현황', '대상자 목록'];

const APP_VIEWS = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'adminAccounts', label: '관리자 계정' },
  { id: 'myAccount', label: '내 계정' },
  { id: 'security', label: '보안 설정' },
];

function deriveDisplayName(email) {
  const localPart = email.trim().toLowerCase().split('@')[0] || 'admin';
  const displayName = localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!displayName || ['admin', 'administrator', 'manager', 'root'].includes(displayName)) {
    return '관리자';
  }

  return displayName;
}

function getAvatarLabel(name, email) {
  return (name?.trim()?.[0] || email?.trim()?.[0] || 'A').toUpperCase();
}

function buildPermissions(role) {
  if (role === '슈퍼 관리자') {
    return ['전체 대상자 보기', '관리자 계정 생성', '권한 변경', '보안 정책 관리'];
  }

  if (role === '상담 관리자') {
    return ['위험군 모니터링', '통화 이력 열람', '알림 확인'];
  }

  if (role === '모니터링 전용') {
    return ['현황판 보기', '위험 경보 확인'];
  }

  return ['대상자 보기', '운영 현황 열람', '기본 설정 편집'];
}

function buildTemporaryAdminAccount(email, accounts) {
  const trimmedEmail = email.trim().toLowerCase();
  const name = deriveDisplayName(trimmedEmail);

  return {
    id: `adm-${String(accounts.length + 1).padStart(3, '0')}`,
    name,
    email: trimmedEmail,
    role: '운영 관리자',
    status: 'ACTIVE',
    orgName: '서울북부 돌봄센터',
    department: '운영 지원',
    title: '운영 담당',
    phone: '010-0000-0000',
    lastAccess: '방금 로그인',
    createdAt: new Date().toISOString(),
    invitedBy: '로그인 목업 자동 생성',
    location: '서울 본부 / Chrome',
    permissions: buildPermissions('운영 관리자'),
    notes: '로그인 목업 테스트를 위해 자동 생성된 관리자 계정',
  };
}

function createSecurityEvent(overrides) {
  return {
    id: `evt-${Date.now()}`,
    title: '계정 보안 변경',
    description: '관리자 계정 보안 설정이 목업에서 업데이트되었습니다.',
    severity: 'info',
    location: '서울 본부 / Chrome',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setError('');
    onLogin({ email: email.trim(), password: password.trim() });
  }

  return (
    <div style={loginStyles.page}>
      <div style={loginStyles.card}>
        <div style={loginStyles.header}>
          <h1 style={loginStyles.title}>관리자 로그인</h1>
          <p style={loginStyles.description}>AI 안부전화 관리자 대시보드</p>
        </div>

        <form style={loginStyles.form} onSubmit={handleSubmit}>
          <label style={loginStyles.field}>
            <span style={loginStyles.label}>이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@carecall.kr"
              style={loginStyles.input}
            />
          </label>

          <label style={loginStyles.field}>
            <span style={loginStyles.label}>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              style={loginStyles.input}
            />
          </label>

          {error ? <p style={loginStyles.error}>{error}</p> : null}

          <button type="submit" style={loginStyles.button}>
            로그인
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
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const avatarLabel = getAvatarLabel(currentUser.name, currentUser.email);

  function handleNavigate(nextView) {
    onNavigate(nextView);
    setIsOpen(false);
  }

  return (
    <div ref={menuRef} style={accountStyles.wrapper}>
      <button
        type="button"
        style={accountStyles.avatarButton}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label="계정 메뉴 열기"
      >
        {avatarLabel}
      </button>

      {isOpen ? (
        <div style={accountStyles.menu}>
          <div style={accountStyles.menuLabel}>계정 정보</div>
          <div style={accountStyles.menuName}>{currentUser.name}</div>
          <div style={accountStyles.menuEmail}>{currentUser.email}</div>

          <div style={accountStyles.divider} />

          <div style={accountStyles.menuActions}>
            {APP_VIEWS.map((view) => {
              const isActive = currentView === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  style={{
                    ...accountStyles.menuActionButton,
                    ...(isActive ? accountStyles.menuActionButtonActive : {}),
                  }}
                  onClick={() => handleNavigate(view.id)}
                >
                  {view.label}
                </button>
              );
            })}
          </div>

          <div style={accountStyles.divider} />

          <button type="button" style={accountStyles.logoutButton} onClick={onLogout}>
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DashboardHome({ activeTab, onTabChange, onRecipientSelect }) {
  return (
    <>
      <nav style={dashboardStyles.nav}>
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            style={{
              ...dashboardStyles.tabButton,
              ...(activeTab === tab ? dashboardStyles.tabButtonActive : {}),
            }}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main style={dashboardStyles.main}>
        {activeTab === '위험도 현황' ? (
          <RiskStatusPanel todayStatus={TODAY_STATUS} atRiskList={AT_RISK_LIST} />
        ) : (
          <RecipientList recipients={RECIPIENTS} onSelect={onRecipientSelect} />
        )}
      </main>
    </>
  );
}

function AdminSectionBar({ currentView, onNavigate }) {
  const adminViews = APP_VIEWS;

  return (
    <nav style={adminBarStyles.bar}>
      {adminViews.map((view) => {
        const isActive = currentView === view.id;

        return (
          <button
            key={view.id}
            type="button"
            style={{
              ...adminBarStyles.button,
              ...(isActive ? adminBarStyles.buttonActive : {}),
            }}
            onClick={() => onNavigate(view.id)}
          >
            {view.label}
          </button>
        );
      })}
    </nav>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('위험도 현황');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [adminAccounts, setAdminAccounts] = useState(ADMIN_ACCOUNTS);
  const [securityEvents, setSecurityEvents] = useState(SECURITY_EVENTS);
  const [currentUserId, setCurrentUserId] = useState(ADMIN_ACCOUNTS[0]?.id || null);

  useEffect(() => {
    if (!adminAccounts.some((account) => account.id === currentUserId) && adminAccounts[0]) {
      setCurrentUserId(adminAccounts[0].id);
    }
  }, [adminAccounts, currentUserId]);

  const currentUser =
    adminAccounts.find((account) => account.id === currentUserId) || adminAccounts[0] || null;

  function handleLogin({ email }) {
    const normalizedEmail = email.trim().toLowerCase();
    const matchedAccount = adminAccounts.find(
      (account) => account.email.toLowerCase() === normalizedEmail
    );

    if (matchedAccount) {
      setCurrentUserId(matchedAccount.id);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      setActiveTab('위험도 현황');
      return;
    }

    const nextAccount = buildTemporaryAdminAccount(normalizedEmail, adminAccounts);
    setAdminAccounts((previous) => [nextAccount, ...previous]);
    setCurrentUserId(nextAccount.id);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    setActiveTab('위험도 현황');
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setActiveTab('위험도 현황');
    setSelectedRecipient(null);
    setCallHistory([]);
  }

  function handleNavigate(nextView) {
    setCurrentView(nextView);
    setSelectedRecipient(null);
    setCallHistory([]);
  }

  function handleRecipientSelect(recipient) {
    setSelectedRecipient(recipient);
    setCallHistory(getCallHistory(recipient.recipientId));
  }

  function handleCloseTimeline() {
    setSelectedRecipient(null);
    setCallHistory([]);
  }

  function handleUpdateAdminStatus(accountId, nextStatus) {
    setAdminAccounts((previous) =>
      previous.map((account) => {
        if (account.id !== accountId) {
          return account;
        }

        return {
          ...account,
          status: nextStatus,
          lastAccess: nextStatus === 'LOCKED' ? '보안 잠금 처리' : account.lastAccess,
        };
      })
    );
  }

  function handleSaveProfile(updates) {
    setAdminAccounts((previous) =>
      previous.map((account) =>
        account.id === currentUserId
          ? {
              ...account,
              name: updates.name.trim(),
              phone: updates.phone.trim(),
              title: updates.title.trim(),
              department: updates.department.trim(),
            }
          : account
      )
    );
  }

  function handleChangePassword(payload) {
    if (!currentUser) {
      return;
    }

    const nextPasswordState = payload.nextPassword ? '새 비밀번호 적용 준비' : '비밀번호 변경 요청';

    setSecurityEvents((previous) => [
      createSecurityEvent({
        title: '비밀번호 변경 요청',
        description: `${currentUser.name} 계정에서 ${nextPasswordState} 작업을 진행했습니다.`,
        severity: 'medium',
      }),
      ...previous,
    ]);
  }

  function renderAdminView() {
    if (!currentUser) {
      return null;
    }

    if (currentView === 'adminAccounts') {
      return (
        <div className="admin-workspace">
          <AdminAccountsScreen
            accounts={adminAccounts}
            currentUser={currentUser}
            onUpdateStatus={handleUpdateAdminStatus}
          />
        </div>
      );
    }

    if (currentView === 'myAccount') {
      return (
        <div className="admin-workspace">
          <MyAccountScreen user={currentUser} onSaveProfile={handleSaveProfile} />
        </div>
      );
    }

    if (currentView === 'security') {
      return (
        <div className="admin-workspace">
          <SecuritySettingsScreen
            securityEvents={securityEvents}
            onChangePassword={handleChangePassword}
          />
        </div>
      );
    }

    return null;
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={dashboardStyles.root}>
      <header style={dashboardStyles.header}>
        <h1 style={dashboardStyles.headerTitle}>AI 안부전화 관리자 대시보드</h1>
        <AccountMenu
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      </header>

      {currentView === 'dashboard' ? (
        <DashboardHome
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRecipientSelect={handleRecipientSelect}
        />
      ) : (
        <>
          <AdminSectionBar currentView={currentView} onNavigate={handleNavigate} />
          <main style={dashboardStyles.adminMain}>{renderAdminView()}</main>
        </>
      )}

      {currentView === 'dashboard' && selectedRecipient ? (
        <CallTimeline
          history={callHistory}
          recipientName={selectedRecipient.name}
          onClose={handleCloseTimeline}
        />
      ) : null}
    </div>
  );
}

const loginStyles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    background: '#ffffff',
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '4px',
    height: '44px',
    border: 'none',
    borderRadius: '8px',
    background: '#001529',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: {
    margin: 0,
    color: '#d4380d',
    fontSize: '13px',
  },
};

const dashboardStyles = {
  root: {
    minHeight: '100vh',
    background: '#f5f6fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    background: '#001529',
    color: '#ffffff',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
  },
  nav: {
    background: '#ffffff',
    borderBottom: '1px solid #e8e8e8',
    padding: '0 32px',
    display: 'flex',
  },
  tabButton: {
    padding: '16px 20px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    color: '#595959',
    borderBottom: '2px solid transparent',
  },
  tabButtonActive: {
    color: '#1890ff',
    borderBottomColor: '#1890ff',
    fontWeight: '600',
  },
  main: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  adminMain: {
    padding: '24px 32px 32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
};

const adminBarStyles = {
  bar: {
    background: '#ffffff',
    borderBottom: '1px solid #e8e8e8',
    padding: '0 32px',
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
  },
  button: {
    padding: '16px 20px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#595959',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
  },
  buttonActive: {
    color: '#1890ff',
    borderBottomColor: '#1890ff',
    fontWeight: '600',
  },
};

const accountStyles = {
  wrapper: {
    position: 'relative',
  },
  avatarButton: {
    width: '36px',
    height: '36px',
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    background: '#ffffff',
    color: '#001529',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  menu: {
    position: 'absolute',
    top: '46px',
    right: 0,
    width: '236px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.16)',
    padding: '14px',
    zIndex: 20,
  },
  menuLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '10px',
  },
  menuName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4px',
  },
  menuEmail: {
    fontSize: '13px',
    color: '#6b7280',
    wordBreak: 'break-all',
  },
  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '14px 0',
  },
  menuActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  menuActionButton: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#111827',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  menuActionButtonActive: {
    borderColor: '#93c5fd',
    background: '#eff6ff',
    color: '#1d4ed8',
  },
  logoutButton: {
    width: '100%',
    height: '40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#111827',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default App;
