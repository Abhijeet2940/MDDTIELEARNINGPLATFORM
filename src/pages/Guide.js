import { Link } from 'react-router-dom';
import traineePhoto from '../Assessts/PreviousBatches.jpg';

const steps = [
  {
    icon: 'register',
    stage: 'ACCOUNT ACCESS',
    title: 'Register',
    description: 'Create your trainee account with your details to begin using the learning platform.',
    action: 'Go to registration',
    to: '/register',
  },
  {
    icon: 'login',
    stage: 'SIGN IN',
    title: 'Log in',
    description: 'Sign in with the email address and password you used during registration.',
    action: 'Go to login',
    to: '/login',
  },
  {
    icon: 'profile',
    stage: 'TRAINEE DETAILS',
    title: 'Set up your profile',
    description: 'Complete your trainee profile so your learning activity is linked to your account.',
    action: 'Open profile setup',
    to: '/app/profile-setup',
  },
  {
    icon: 'learning',
    stage: 'COURSEWORK',
    title: 'Open a learning module',
    description: 'Browse your available learning modules and open the course you need to complete.',
    action: 'Browse learning modules',
    to: '/app/learning',
  },
  {
    icon: 'quiz',
    stage: 'KNOWLEDGE CHECK',
    title: 'Take the quiz',
    description: 'Complete the quiz for your training and review your result when you finish.',
    action: 'Open assessments',
    to: '/app/assessment',
  },
  {
    icon: 'certificate',
    stage: 'COMPLETION',
    title: 'Get your certificate',
    description: 'After successfully passing the quiz, open your progress to view and print your certificate.',
    action: 'View progress and certificates',
    to: '/app/progress',
  },
];

function StepIcon({ name }) {
  const icons = {
    register: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M18 8v6m-3-3h6" />
      </>
    ),
    login: (
      <>
        <path d="M10 17l5-5-5-5m5 5H3" />
        <path d="M13 4h5a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-5" />
      </>
    ),
    profile: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2.5" />
        <path d="M5.5 17a3.5 3.5 0 0 1 7 0m2-7h3m-3 4h3" />
      </>
    ),
    learning: (
      <>
        <path d="M12 7v13m0-13C9.8 5.2 7 4.5 3 5v13c4-.5 6.8.2 9 2m0-13c2.2-1.8 5-2.5 9-2v13c-4-.5-6.8.2-9 2" />
      </>
    ),
    quiz: (
      <>
        <path d="M8 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2h-3" />
        <path d="M9 3h6v4H9zM7 13l2 2 4-4m2 4h2" />
      </>
    ),
    certificate: (
      <>
        <circle cx="12" cy="9" r="6" />
        <path d="m9 14-1 7 4-2 4 2-1-7m-3-8v6m-3-3h6" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export default function GuidePage() {
  return (
    <div className="guide-page">
      <header className="guide-intro">
        <div className="container guide-intro__inner">
          <div className="guide-intro__copy">
            <p className="eyebrow">MDDTI E-Learning Platform</p>
            <h1>Trainee guideline</h1>
            <p>Six steps to get started with your training, from registration to your certificate.</p>
            <Link className="guide-intro__link" to="/register">Start with registration <span aria-hidden="true">→</span></Link>
          </div>
          <img className="guide-intro__photo" src={traineePhoto} alt="Trainees attending a training session" />
        </div>
      </header>

      <section className="guide-steps" aria-labelledby="guide-steps-title">
        <div className="container">
          <div className="guide-steps__heading">
            <p className="eyebrow">Your learning journey</p>
            <h2 id="guide-steps-title">From registration to your certificate</h2>
          </div>
          <ol className="guide-step-list">
            {steps.map((step) => (
              <li className="guide-step" key={step.title}>
                <span className="guide-step__icon" aria-hidden="true"><StepIcon name={step.icon} /></span>
                <div className="guide-step__content">
                  <p className="guide-step__stage">{step.stage}</p>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <Link to={step.to}>{step.action}<span aria-hidden="true"> →</span></Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}