import { Link } from 'react-router-dom';
import indianRailways from '../Assessts/Indian Railways.png';

export function AuthFrame({ eyebrow, title, description, children }) {
  return (
    <main className="portal-auth">
      <aside className="portal-auth__story">
        <Link className="portal-auth__brand" to="/" aria-label="MDDTI home">
          <img src={indianRailways} alt="Indian Railways" />
          <span>Mddti <strong>Sealdah</strong></span>
        </Link>
        <div className="portal-auth__story-copy">
          <p className="portal-kicker">Training, built around service</p>
          <h1>Build skills for the work that moves us.</h1>
          <p>One focused space for your learning, assessments, and training progress.</p>
        </div>
        <div className="portal-auth__story-foot">
          <Link className="portal-auth__back" to="/">Back to Home</Link>
        </div>
      </aside>

      <section className="portal-auth__main">
        <div className="portal-auth__form-wrap">
          <p className="portal-kicker">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="portal-auth__description">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthInput({ label, ...props }) {
  return (
    <label className="portal-field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}