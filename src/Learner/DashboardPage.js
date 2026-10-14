import { useEffect, useState } from 'react';
import { getSession } from '../auth/session';
import { apiRequest } from '../api/client';
import { ActivityLink, PortalProgress } from './LearnerComponents';
import { menuItems } from './learnerData';

export default function DashboardPage() {
  const [progress, setProgress] = useState({ percentage: 0, completedCount: 0, totalLessons: 0 });
  const [error, setError] = useState('');
  useEffect(() => {
    apiRequest('/api/v1/progress/me')
      .then(setProgress)
      .catch((requestError) => setError(requestError.message));
  }, []);
  const quickLinks = [
    { ...menuItems[0], description: 'Add your department, role, and training details.' },
    { ...menuItems[1], description: `${progress.completedCount} of ${progress.totalLessons} lessons completed.` },
    { ...menuItems[2], description: 'Take an available course assessment.' },
    { ...menuItems[3], description: 'Review your learning activity and results.' },
    { ...menuItems[4], description: 'View or update your learner details.' },
  ];

  return (
    <section className="portal-page">
      <div className="portal-page__heading">
        <div><p className="portal-kicker">YOUR LEARNING SPACE</p><h1>Your learning, at a glance</h1></div>
        <span className="portal-date-mark">MDDTI / 2026</span>
      </div>
      <section className="portal-welcome" aria-label="Learning overview">
        <div>
          <p className="portal-kicker">WELCOME, {getSession()?.name?.toUpperCase() || 'TRAINEE'}</p>
          <h2>Make every lesson count.</h2>
          <p>Your learning activity is saved to your learner account.</p>
        </div>
        <div className="portal-welcome__stat"><strong>{progress.percentage}%</strong><span>lesson completion</span><PortalProgress value={progress.percentage} /></div>
      </section>
      {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
      <div className="portal-section-heading"><div><p className="portal-kicker">PORTAL MENU</p><h2>Continue your training</h2></div><span>5 destinations</span></div>
      <div className="portal-action-grid">{quickLinks.map((item) => <ActivityLink key={item.to} item={item} />)}</div>
    </section>
  );
}