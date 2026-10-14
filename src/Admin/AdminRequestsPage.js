import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

const statusLabels = {
  PENDING: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Declined',
};

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/api/v1/admin/access-requests?page=0&size=100')
      .then((page) => setRequests(page.content || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = requests.filter((request) => request.status === 'PENDING').length;
  const visibleRequests = requests;

  const reviewRequest = async (request, status) => {
    setError('');
    try {
      await apiRequest(`/api/v1/admin/access-requests/${request.id}/${status === 'APPROVED' ? 'approve' : 'reject'}`, {
        method: 'POST',
      });
      setRequests((current) => current.filter((item) => item.id !== request.id));
      setNotice(`${request.firstName} ${request.lastName}'s request was ${status === 'APPROVED' ? 'approved' : 'declined'}.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="admin-page" aria-labelledby="requests-heading">
        <div className="admin-summary">
          <div>
            <p className="portal-kicker">LEARNER ONBOARDING</p>
            <h2 id="requests-heading">Review submitted details</h2>
            <p>Check the trainee ID and training information before deciding on an account request.</p>
          </div>
          <div className="admin-summary__count"><strong>{pendingCount}</strong><span>awaiting review</span></div>
        </div>

        <div className="admin-list-toolbar">
          <span>{visibleRequests.length} {visibleRequests.length === 1 ? 'request' : 'requests'}</span>
        </div>

        {notice ? <p className="portal-message portal-message--success admin-notice" role="status">{notice}</p> : null}
        {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
        {loading ? <p>Loading access requests…</p> : null}

        {visibleRequests.length ? (
          <div className="admin-request-list">
            {visibleRequests.map((request) => (
              <article className="admin-request" key={request.id}>
                <div className="admin-request__heading">
                  <div><p className="portal-kicker">SUBMITTED {formatDate(request.submittedAt)}</p><h3>{request.firstName} {request.lastName}</h3><a href={`mailto:${request.email}`}>{request.email}</a></div>
                  <span className={`admin-status admin-status--${request.status.toLowerCase()}`}>{statusLabels[request.status]}</span>
                </div>
                <dl className="admin-request__details">
                  <div><dt>Employee / trainee ID</dt><dd>{request.employeeId}</dd></div>
                  <div><dt>Department</dt><dd>{request.department}</dd></div>
                  <div><dt>Designation</dt><dd>{request.designation || 'Not provided'}</dd></div>
                  <div><dt>Training batch</dt><dd>{request.batch || 'Not provided'}</dd></div>
                  <div><dt>Contact number</dt><dd>{request.phone || 'Not provided'}</dd></div>
                  {request.reason ? <div><dt>Additional details</dt><dd>{request.reason}</dd></div> : null}
                  {request.reviewedAt ? <div><dt>Reviewed</dt><dd>{formatDate(request.reviewedAt)}</dd></div> : null}
                </dl>
                {request.status === 'PENDING' ? (
                  <div className="admin-request__actions">
                    <button className="portal-button portal-button--outline" type="button" onClick={() => reviewRequest(request, 'REJECTED')}>Decline request</button>
                    <button className="portal-button portal-button--primary" type="button" onClick={() => reviewRequest(request, 'APPROVED')}>Approve request</button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state">
            <span className="admin-empty-state__mark" aria-hidden="true">✓</span>
            <h3>No pending requests</h3>
            <p>New learner access requests will appear here for review.</p>
          </div>
        )}
    </section>
  );
}