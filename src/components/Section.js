export default function Section({ id, eyebrow, title, description, children, className = '' }) {
  return (
    <section id={id} className={`section ${className}`.trim()}>
      <div className="container">
        {(eyebrow || title || description) && (
          <header className="section__header">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h2>{title}</h2> : null}
            {description ? <p className="section__description">{description}</p> : null}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
