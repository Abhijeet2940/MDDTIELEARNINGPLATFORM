import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getDemoAccount, getHomePath, getSession, startSession } from '../auth/session';
import { apiRequest, clearCsrfToken } from '../api/client';
import { AuthFrame, AuthInput } from './AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (getSession()) return <Navigate to={getHomePath()} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const demoUser = getDemoAccount(email, password);

    try {
      const account = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      clearCsrfToken();
      const user = {
        ...account,
        name: [account.firstName, account.lastName].filter(Boolean).join(' '),
        role: account.roles?.includes('ADMIN') ? 'ADMIN' : 'LEARNER',
      };
      startSession(user);
      navigate(getHomePath(user));
      return;
    } catch (requestError) {
      if (demoUser?.role === 'LEARNER' && requestError instanceof TypeError) {
        startSession(demoUser);
        navigate(getHomePath(demoUser));
        return;
      }

      setError(requestError.message || 'Unable to sign in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame
      eyebrow="Learner access"
      title="Welcome back"
      description="Sign in to continue your training journey."
    >
      <form className="portal-form" onSubmit={handleSubmit}>
        <AuthInput
          label="Email address"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <AuthInput
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <div className="portal-form__utility">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
        <button className="portal-button portal-button--primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="portal-auth__switch">New to the portal? <Link to="/register">Create an account</Link></p>
    </AuthFrame>
  );
}