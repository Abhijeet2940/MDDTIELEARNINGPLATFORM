import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getHomePath, getSession } from '../auth/session';
import { apiRequest } from '../api/client';
import { AuthFrame, AuthInput } from './AuthLayout';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (getSession()) return <Navigate to={getHomePath()} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = formData.get('name').trim().split(/\s+/);
    setSubmitting(true);
    setError('');
    try {
      await apiRequest('/api/v1/access-requests', {
        method: 'POST',
        body: {
          firstName: fullName.shift(),
          lastName: fullName.join(' ') || 'Learner',
          email: formData.get('email').trim(),
          employeeId: formData.get('employeeId').trim(),
          department: formData.get('department').trim(),
          designation: formData.get('designation').trim(),
          batch: formData.get('batch').trim(),
          phone: formData.get('phone').trim(),
          password: formData.get('password'),
        },
      });
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame
      eyebrow="Request learner access"
      title="Create your learner account"
      description="An administrator will review your details. You can sign in with your password once your request is approved."
    >
      {submitted ? (
        <div className="portal-message portal-message--success" role="status">
          <strong>Request submitted</strong>
          <span>Your information is awaiting administrator review.</span>
          <Link to="/login">Return to sign in</Link>
        </div>
      ) : (
        <form className="portal-form" onSubmit={handleSubmit}>
          <AuthInput label="Full name" type="text" name="name" autoComplete="name" required />
          <AuthInput label="Email address" type="email" name="email" autoComplete="email" required />
          <AuthInput label="Employee or trainee ID" type="text" name="employeeId" required />
          <AuthInput label="Create password" type="password" name="password" autoComplete="new-password" minLength={12} maxLength={72} required />
          <div className="portal-form__two-up">
            <label className="portal-field">
              <span>Department</span>
              <select name="department" required defaultValue="">
                <option value="" disabled>Select department</option>
                <option value="OPERATING">OPERATING</option>
                <option value="ENGINEERING">ENGINEERING</option>
                <option value="PERSONNEL">PERSONNEL</option>
              </select>
            </label>
            <AuthInput label="Designation" type="text" name="designation" required />
            <AuthInput label="Training batch" type="text" name="batch" />
            <AuthInput label="Contact number" type="tel" name="phone" required />
          </div>
          {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
          <button className="portal-button portal-button--primary" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit for review'}</button>
        </form>
      )}
      {!submitted ? <p className="portal-auth__switch">Already have an account? <Link to="/login">Sign in</Link></p> : null}
    </AuthFrame>
  );
}