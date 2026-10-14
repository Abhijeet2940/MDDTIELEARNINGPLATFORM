import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import indianRailways from '../Assessts/Indian Railways.png';
import { endSession, getSession } from '../auth/session';
import { ThemeToggle, useTheme } from '../contexts/ThemeContext';
import { menuItems } from './learnerData';
import { apiRequest, clearCsrfToken } from '../api/client';

export default function LearnerLayout() {
  const [user, setUser] = useState(getSession());
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSignOut = async () => {
    try { await apiRequest('/api/v1/auth/logout', { method: 'POST' }); } catch { }
    clearCsrfToken();
    endSession();
    navigate('/login', { replace: true });
  };

  return (
    <div className="portal-shell" data-theme={theme}>
      <aside className="portal-sidebar">
        <Link className="portal-sidebar__brand" to="/app" aria-label="Learner portal dashboard">
          <img src={indianRailways} alt="" />
          <span>MDDTI <small>LEARNER PORTAL</small></span>
        </Link>
        <p className="portal-sidebar__label">YOUR TRAINING</p>
        <nav className="portal-menu" aria-label="Learner menu">
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `portal-menu__link${isActive ? ' portal-menu__link--active' : ''}`}>
              <span>{item.number}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="portal-sidebar__bottom">
          <div className="portal-sidebar__user">
            <span className="portal-avatar" aria-hidden="true">{user?.name?.charAt(0) || 'T'}</span>
            <span><strong>{user?.name || 'Trainee'}</strong><small>{user?.employeeId || 'Learner'}</small></span>
          </div>
          <button className="portal-signout" type="button" onClick={handleSignOut}>Sign out</button>
        </div>
      </aside>

      <div className="portal-workspace">
        <header className="portal-topbar">
          <div>
            <p className="portal-kicker">Multi-Disciplinary Divisional Training Institute</p>
            <strong>Learning Portal</strong>
          </div>
          <div className="portal-topbar__actions">
            <ThemeToggle />
            <span className="portal-session-tag">LEARNER SESSION</span>
          </div>
        </header>
        <main className="portal-content"><Outlet context={{ setUser }} /></main>
      </div>
    </div>
  );
}