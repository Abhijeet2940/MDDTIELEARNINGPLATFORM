import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { endSession, startSession } from '../auth/session';
import { ThemeToggle, useTheme } from '../contexts/ThemeContext';
import { apiRequest, clearCsrfToken } from '../api/client';

const adminLinks = [
  { label: 'Access requests', to: '/admin/requests' },
  { label: 'Learner progress', to: '/admin/progress' },
  { label: 'Courses', to: '/admin/courses' },
  { label: 'Assignments', to: '/admin/assignments' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [adminVerified, setAdminVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiRequest('/api/v1/auth/me')
      .then((account) => {
        if (!account.roles?.includes('ADMIN')) {
          throw new Error('Administrator access is required.');
        }
        if (cancelled) return;
        startSession({
          ...account,
          name: [account.firstName, account.lastName].filter(Boolean).join(' '),
          role: 'ADMIN',
        });
        setAdminVerified(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearCsrfToken();
        endSession();
        navigate('/login', { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (window.location.pathname === '/admin') return <Navigate to="/admin/requests" replace />;
  if (!adminVerified) return <main className="admin-shell" role="status">Verifying administrator access…</main>;

  const signOut = async () => {
    try { await apiRequest('/api/v1/auth/logout', { method: 'POST' }); } catch { }
    clearCsrfToken();
    endSession();
    navigate('/login', { replace: true });
  };

  return (
    <main className="admin-shell" data-theme={theme}>
      <header className="admin-header">
        <div>
          <p className="portal-kicker">MDDTI / ADMINISTRATION</p>
          <h1>Training portal</h1>
        </div>
        <div className="admin-header__actions">
          <span className="portal-session-tag">ADMIN SESSION</span>
          <ThemeToggle />
          <button className="portal-button portal-button--outline" type="button" onClick={signOut}>Sign out</button>
        </div>
      </header>
      <nav className="admin-nav" aria-label="Administration">
        {adminLinks.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `admin-nav__link${isActive ? ' admin-nav__link--active' : ''}`}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-content"><Outlet /></div>
    </main>
  );
}