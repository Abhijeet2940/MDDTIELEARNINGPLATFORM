import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    apiRequest('/api/v1/profile/me')
      .then(async (data) => {
        if (!active) return;
        setProfile({ ...data, name: [data.firstName, data.lastName].filter(Boolean).join(' ') });
        if (data.hasPhoto) {
          const image = await apiRequest('/api/v1/profile/me/photo');
          objectUrl = URL.createObjectURL(image);
          if (active) setPhotoUrl(objectUrl);
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setError('');
    try {
      const updated = await apiRequest('/api/v1/profile/me/photo', { method: 'PUT', body: form });
      setProfile((current) => ({ ...current, ...updated }));
      const image = await apiRequest('/api/v1/profile/me/photo');
      const nextUrl = URL.createObjectURL(image);
      setPhotoUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return nextUrl;
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      event.target.value = '';
    }
  };

  if (loading) return <section className="portal-page portal-page--narrow"><p>Loading profile…</p></section>;
  if (!profile) return <section className="portal-page portal-page--narrow"><p className="portal-message portal-message--error" role="alert">{error || 'Profile unavailable.'}</p></section>;

  return (
    <section className="portal-page portal-page--narrow">
      <div className="portal-page__heading"><div><p className="portal-kicker">LEARNER DETAILS</p><h1>Your Profile</h1></div></div>
      {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
      <div className="portal-profile-card">
        <div className="portal-profile-card__identity">{photoUrl ? <img className="portal-avatar portal-avatar--large" src={photoUrl} alt="Profile" style={{ objectFit: 'cover' }} /> : <span className="portal-avatar portal-avatar--large" aria-hidden="true">{profile.name?.charAt(0) || 'T'}</span>}<div><h2>{profile.name || 'Trainee profile'}</h2><p>{profile.designation || 'Learner'}{profile.department ? ` · ${profile.department}` : ''}</p><label className="portal-button portal-button--outline">Add or change photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadPhoto} hidden /></label></div></div>
        <dl className="portal-profile-details">
          <div><dt>Email address</dt><dd>{profile.email || 'Not provided'}</dd></div>
          <div><dt>Employee or trainee ID</dt><dd>{profile.employeeId || 'Not provided'}</dd></div>
          <div><dt>Department</dt><dd>{profile.department || 'Not provided'}</dd></div>
          <div><dt>Designation</dt><dd>{profile.designation || 'Not provided'}</dd></div>
          <div><dt>Training batch</dt><dd>{profile.batch || 'Not provided'}</dd></div>
          <div><dt>Contact number</dt><dd>{profile.phone || 'Not provided'}</dd></div>
        </dl>
      </div>
    </section>
  );
}