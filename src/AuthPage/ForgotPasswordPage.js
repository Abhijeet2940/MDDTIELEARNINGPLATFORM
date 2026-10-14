import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getHomePath, getSession } from '../auth/session';
import { AuthFrame, AuthInput } from './AuthLayout';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  if (getSession()) return <Navigate to={getHomePath()} replace />;

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthFrame
      eyebrow="Account help"
      title="Reset your password"
      description="Enter the email address associated with your learner profile."
    >
      {submitted ? (
        <div className="portal-message portal-message--success" role="status">
          <strong>Request received</strong>
          <span>This prototype does not send email. In a connected portal, reset instructions would be sent if the account exists.</span>
        </div>
      ) : (
        <form className="portal-form" onSubmit={handleSubmit}>
          <AuthInput label="Email address" type="email" name="email" autoComplete="email" required />
          <button className="portal-button portal-button--primary" type="submit">Continue</button>
        </form>
      )}
      <p className="portal-auth__switch"><Link to="/login">Return to sign in</Link></p>
    </AuthFrame>
  );
}