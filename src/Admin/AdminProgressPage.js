import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';
import { DEPARTMENT_OPTIONS, normalizeDepartment } from '../auth/session';

function getInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'LT';
}

function formatPercentage(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

export default function AdminProgressPage() {
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/v1/admin/users?page=0&size=100')
      .then((page) => setLearners((page.content || []).map((learner) => ({
        ...learner,
        name: [learner.firstName, learner.lastName].filter(Boolean).join(' '),
        progress: learner.progressPercentage ?? 0,
      }))))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const departmentLearners = selectedDepartment === 'ALL'
    ? learners
    : learners.filter((learner) => normalizeDepartment(learner.department) === selectedDepartment);

  const visibleLearners = departmentLearners.filter((learner) => (
    `${learner.name} ${learner.email} ${learner.employeeId} ${learner.department || ''} ${learner.designation || ''} ${learner.batch || ''}`.toLowerCase().includes(normalizedSearch)
  ));

  const stats = useMemo(() => {
    const total = departmentLearners.length;
    const average = total ? Math.round(departmentLearners.reduce((sum, learner) => sum + learner.progress, 0) / total) : 0;
    const onTrack = departmentLearners.filter((learner) => learner.progress >= 70).length;
    const atRisk = departmentLearners.filter((learner) => learner.progress < 60).length;

    return { total, average, onTrack, atRisk };
  }, [departmentLearners]);

  return (
    <section className="admin-page" aria-labelledby="progress-heading">
      <div className="admin-page-heading">
        <div>
          <p className="portal-kicker">LEARNER OVERSIGHT</p>
          <h2 id="progress-heading">Learner progress</h2>
          <p>Review completion, performance, and learner readiness across the cohort.</p>
        </div>
        <div className="admin-filter-row">
          <label className="admin-search">
            <span>Department</span>
            <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)}>
              <option value="ALL">All departments</option>
              {DEPARTMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="admin-search">
            <span>Find a learner</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, ID, or department" />
          </label>
        </div>
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">Total learners</span>
          <strong className="admin-stat-card__value">{stats.total}</strong>
          <span className="admin-stat-card__meta">Across the selected department</span>
        </div>
        <div className="admin-stat-card admin-stat-card--accent">
          <span className="admin-stat-card__label">Average completion</span>
          <strong className="admin-stat-card__value">{stats.average}%</strong>
          <span className="admin-stat-card__meta">Overall cohort progress</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">At-risk</span>
          <strong className="admin-stat-card__value">{stats.atRisk}</strong>
          <span className="admin-stat-card__meta">Need follow-up this week</span>
        </div>
      </div>

      <div className="admin-list-toolbar"><span>{visibleLearners.length} of {departmentLearners.length} learners</span><span>{stats.onTrack} on track</span></div>

      {loading ? <p>Loading learner profiles…</p> : null}
      {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}

      {!loading && !error && visibleLearners.length ? (
        <div className="admin-learner-list">
          {visibleLearners.map((learner) => {
            const assessmentText = learner.latestAssessmentPercentage == null
              ? 'Not attempted'
              : `${learner.latestAssessmentPercentage}%`;

            return (
              <article className="admin-learner-card" key={learner.email}>
                <div className="admin-learner-card__header">
                  <div className="admin-learner-card__identity">
                    <div className="admin-learner-card__avatar" aria-hidden="true">{getInitials(learner.name)}</div>
                    <div>
                      <p className="portal-kicker">{learner.employeeId}</p>
                      <h3>{learner.name}</h3>
                      <p>{learner.email}</p>
                    </div>
                  </div>

                  <div className="admin-learner-card__score">
                    <strong>{formatPercentage(learner.progress)}%</strong>
                    <span>complete</span>
                  </div>
                </div>

                <div className="admin-learner-card__bar" aria-label={`${learner.name} progress`}>
                  <div className="portal-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={learner.progress}>
                    <span style={{ width: `${learner.progress}%` }} />
                  </div>
                </div>

                <dl className="admin-learner-card__details">
                  <div>
                    <dt>Department</dt>
                    <dd>{learner.department || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Designation</dt>
                    <dd>{learner.designation || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Training batch</dt>
                    <dd>{learner.batch || 'Not provided'}</dd>
                  </div>
                </dl>

                <div className="admin-learner-card__activity">
                  <h4>Lesson completion</h4>
                  <p>{learner.completedLessons} of {learner.totalLessons} lessons complete</p>
                </div>

                <div className="admin-learner-card__assessment">
                  <span>Latest assessment</span>
                  <strong>{assessmentText}</strong>
                </div>

                <div className="admin-learner-card__certificates">
                  <h4>Issued certificates <span>{learner.certificates?.length || 0}</span></h4>
                  {learner.certificates?.length ? (
                    <ul>
                      {learner.certificates.map((certificate) => (
                        <li key={certificate.id}>
                          <div>
                            <strong>{certificate.assessmentTitle}</strong>
                            <span>{certificate.courseTitle || 'Course unavailable'}</span>
                          </div>
                          <div className="admin-learner-card__certificate-meta">
                            <strong>{certificate.certificateNumber}</strong>
                            <span>Issued {new Date(certificate.issuedAt).toLocaleDateString()}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : <p>No certificates issued</p>}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
      {!loading && !error && visibleLearners.length === 0 ? (
        <div className="admin-empty-state">
          <span className="admin-empty-state__mark" aria-hidden="true">—</span>
          <h3>No learners found</h3>
          <p>Try a different name, email, trainee ID, or department.</p>
        </div>
      ) : null}
    </section>
  );
}