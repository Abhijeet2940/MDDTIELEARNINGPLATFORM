import Hero from '../components/Hero';
import Section from '../components/Section';

const values = [
  { title: 'Our Mission', description: 'To provide systematic and practical training to railway employees,  promote a strong culture of safety and operational excellence' },
  { title: 'Our Campus', description: 'To upgrade employee skills in line with emerging railway technologies, facilitate transparent and technology-driven computer-based examinations.' },
  { title: 'Our Approach', description: 'To encourage continuous learning, reskilling and professional development,provide multidisciplinary training that supports efficient railway operations.' },
];

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About the institute"
        title="A learning culture built on discipline and service"
        description="Discover the people, place, and purpose behind Multi-Disciplinary Divisional Training Institute, Sealdah."
        primaryCta={{ children: 'Meet our faculty', to: '/faculty' }}
        secondaryCta={{ children: 'Contact us', to: '/contact' }}
      />
      <Section id="about-overview" eyebrow="About us" title="The institute at a glance" description="To develop a skilled, competent, safety-conscious and future-ready railway workforce through high-quality multidisciplinary training, modern technology and continuous professional development.">
        <div className="card-grid card-grid--three">
          {values.map((value) => (
            <article key={value.title} className="card">
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="campus" title="Campus ambience and learning culture">
        <div className="story-grid">
          <div>
            <p>
              The institute aims to provide a combination of classroom learning, practical training, technology-based learning 
              and competency assessment. Its modernisation plans include advanced simulation facilities, an S&T model room with
               Kavach-related systems, and a dedicated CBT facility, further strengthening its role as a modern training hub for 
               Eastern Railway.
              </p>
            <p>
             MDDTI Beliaghata is therefore envisioned not merely as a training centre, but as an important institutional platform
              for continuous learning, skill enhancement, safety improvement and development of a future-ready workforce for Eastern Railway.
            </p>
          </div>
          <div className="quote-box">
            <p>
              "Building Competence, Inspiring Excellence, Enabling Safer and Future-Ready Railways.”
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
