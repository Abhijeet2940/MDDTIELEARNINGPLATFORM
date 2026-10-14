export default function Card({ title, description, icon, children, className = '' }) {
  return (
    <article className={`card ${className}`.trim()}>
      {icon ? <div className="card__icon" aria-hidden="true">{icon}</div> : null}
      {title || description ? (
        <div className="card__body">
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}
      {children}
    </article>
  );
}
