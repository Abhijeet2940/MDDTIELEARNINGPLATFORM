import { Link } from 'react-router-dom';

export function PortalProgress({ value }) {
  return (
    <div className="portal-progress" role="progressbar" aria-label="Learning progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

export function ActivityLink({ item }) {
  return (
    <Link className="portal-action-card" to={item.to}>
      <span className="portal-action-card__number">{item.number}</span>
      <span className="portal-action-card__copy">
        <strong>{item.label}</strong>
        <small>{item.description}</small>
      </span>
      <span className="portal-action-card__arrow" aria-hidden="true">↗</span>
    </Link>
  );
}

export function ProfileForm({ initialProfile, onSaved }) {
  const submit = (event) => {
    event.preventDefault();
    onSaved?.(initialProfile);
  };

  return (
    <form className="portal-form portal-profile-form" onSubmit={submit}>
      <div className="portal-form__two-up">
        <label className="portal-field"><span>Full name</span><input value={initialProfile.name || ''} readOnly /></label>
        <label className="portal-field"><span>Email address</span><input type="email" value={initialProfile.email || ''} readOnly /></label>
        <label className="portal-field"><span>Employee or trainee ID</span><input value={initialProfile.employeeId || ''} readOnly /></label>
        <label className="portal-field"><span>Department</span><input value={initialProfile.department || ''} readOnly /></label>
        <label className="portal-field"><span>Designation</span><input value={initialProfile.designation || ''} readOnly /></label>
        <label className="portal-field"><span>Training batch</span><input value={initialProfile.batch || ''} readOnly /></label>
        <label className="portal-field"><span>Contact number</span><input type="tel" value={initialProfile.phone || ''} readOnly /></label>
      </div>
      <div className="portal-form__footer">
        <button className="portal-button portal-button--primary" type="submit">Continue to profile</button>
      </div>
    </form>
  );
}