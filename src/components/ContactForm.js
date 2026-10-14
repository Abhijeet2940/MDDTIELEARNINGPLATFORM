import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label>
          <span>Name</span>
          <input type="text" name="name" placeholder="Your name" required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" name="email" placeholder="name@example.com" required />
        </label>
      </div>
      <label>
        <span>Subject</span>
        <input type="text" name="subject" placeholder="How can we help?" required />
      </label>
      <label>
        <span>Message</span>
        <textarea name="message" rows="5" placeholder="Write your query here" required />
      </label>
      <button className="btn btn--primary" type="submit">
        Send Message
      </button>
      {submitted ? <p className="form-success">Thanks! Your message has been noted for follow-up.</p> : null}
    </form>
  );
}
