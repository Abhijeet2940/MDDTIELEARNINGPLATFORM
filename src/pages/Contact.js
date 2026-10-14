import ContactForm from '../components/ContactForm';
import Hero from '../components/Hero';
import MapEmbed from '../components/MapEmbed';
import Section from '../components/Section';

export default function ContactPage() {
  return (
    <>
      <Hero
        eyebrow="Contact us"
        title="Let’s connect and move forward together"
        description="Our team is ready to help with training, registration, and institute enquiries."
        primaryCta={{ children: 'Send a message', href: '#contact' }}
        secondaryCta={{ children: 'View location', href: '#location' }}
      />
      <Section id="contact" eyebrow="Contact us" title="We’re here to help" description="For any queries, please contact us and our team will guide you through the next step.">
        <div className="contact-grid">
          <div className="contact-panel">
            <h3>Send  Message</h3>
            <ContactForm />
          </div>
          <div className="contact-panel">
            <h3 className="contact-panel__title">We’re ready for your Solution</h3>
            <ul className="contact-list">
              <li><strong>Phone:</strong><span>+0294 256 0321</span></li>
              <li><strong>Email:</strong><span>sealdahrailway@gmail.com</span></li>
              <li><strong>Location:</strong><span>Sealdah, West Bengal</span></li>
            </ul>
          </div>
        </div>
      </Section>
      <div id="location">
        <MapEmbed />
      </div>
    </>
  );
}
