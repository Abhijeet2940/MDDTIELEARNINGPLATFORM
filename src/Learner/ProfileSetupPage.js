import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { ProfileForm } from './LearnerComponents';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/v1/profile/me')
      .then((data) => setProfile({ ...data, name: [data.firstName, data.lastName].filter(Boolean).join(' ') }))
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <section className="portal-page portal-page--narrow">
      <div className="portal-page__heading"><div><p className="portal-kicker">FIRST STEPS</p><h1>Set your profile</h1></div></div>
      <div className="portal-panel">
        <p className="portal-panel__intro">These details are saved from your registration. Contact an administrator if a correction is needed.</p>
        {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
        {!profile && !error ? <p>Loading profile…</p> : null}
        {profile ? <ProfileForm initialProfile={profile} onSaved={() => {
          navigate('/app/profile');
        }} /> : null}
      </div>
    </section>
  );
}