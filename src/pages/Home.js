import Hero from '../components/Hero';
import Card from '../components/Card';
import Section from '../components/Section';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import  principalImage from'../Assessts/PrincipalImage.jpg';
import heroCarouselImage from '../Assessts/Hero-Corousel.png';
import heroCarouselImage2 from '../Assessts/Hero_Crousel2.png';
import aboutInstituteImage1 from '../Assessts/AboutInstitute1.jpg';

const serviceCards = [
  {
    icon: '🎓',
    title: 'Trainee Registration',
    description: 'Register for upcoming training courses and stay informed about the latest programmes.',
    href: '/register',
  },
  {
    icon: '📘',
    title: 'LMS Login',
    description: 'Access training management tools and manage your participation with ease.',
    href: '/login',
  },
  {
    icon: '💻',
    title: 'Admin Login',
    description: 'Use the admin portal to manage courses, lessons, and assessments efficiently.',
    href: '/login',
  },
  {
    icon: '🗓️',
    title: 'Trainee Guideline',
    description: 'Follow the steps to register, access your learning modules, and take a quiz.',
    href: '/guide',
  },
];


export default function HomePage() {
  return (
    <>
      <Hero
        slides={[
          {
            image: heroCarouselImage,
            eyebrow: 'Training center in Sealdah, Rajasthan',
            title: 'Multi-Disciplinary Divisional Training Institute',
            description: 'Empowering trainees with practical knowledge, confidence, and professional excellence to build a stronger future for Indian Railways.',
            primaryCta: { children: 'Register Now', to: '/register' },
            secondaryCta: { children: 'Login', to: '/login' },
          },
          {
            image: heroCarouselImage2,
            eyebrow: 'Connected learning',
            title: 'Your next step starts here',
            description: 'Access registrations, calendars, and learning resources from one trusted training destination.',
            primaryCta: { children: 'Contact Us', to: '/contact' },
            secondaryCta: { children: 'Login', to: '/login' },
          },
        ]}
      />

      <Section id="services">
        <div className="card-grid card-grid--four">
          {serviceCards.map((card) => (
            <Card key={card.title} title={card.title} description={card.description} icon={card.icon} className="card--featured">
              <Link className="card__link" to={card.href} aria-label={`Go to ${card.title}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 17 17 7M8 7h9v9"></path>
                </svg>
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="about" eyebrow="About the institute" >
        
        <div className="split-layout">
          <div>
            <p>
              <h1>About Us  </h1>
            </p>
            <p>
             The Multi-Disciplinary Divisional Training Institute (MDDTI), Beliaghata, Sealdah, Eastern Railway,
              is dedicated to enhancing the knowledge, skills and professional competence of railway personnel.
               Through modern training methods, practical learning and technology-enabled facilities, the Institute
                promotes safety, efficiency, continuous development and operational excellence across multiple disciplines of Indian Railways.
              
            </p>
            <Button to="/about">Learn More</Button>
          </div>
          <div className="info-panel" aria-label="Institute photograph">
            <img
              className="about-photo"
              src={aboutInstituteImage1}
              alt="MDDTI institute"
            />
          </div>
        </div>
      </Section>

      <Section id="principal" eyebrow="Leadership" >
        <div className="principal-box">
          <div className="principal-box__portrait" aria-hidden="true">
            <img src={principalImage} alt="Principal of MDDTI Sealdah" />
          </div>
          <div>
            <p>
              <h1>Principal's Desk</h1>
            </p>
            <p>
            It gives me immense pleasure to welcome you to the Multi-Disciplinary Divisional Training Institute (MDDTI), Beliaghata, Sealdah, Eastern Railway.
            Training is the foundation of professional excellence, operational efficiency and railway safety. At MDDTI, our endeavour is to provide 
            a dynamic and technology-enabled learning environment that empowers railway personnel with updated knowledge, practical skills and a strong sense of responsibility.
            </p>
            We are committed to fostering continuous learning, innovation, discipline and safety consciousness through structured training and competency development. 
            With dedicated faculty, modern facilities and a learner-centric approach, we strive to prepare our workforce to meet the evolving challenges of Indian Railways.
            Together, let us learn, improve and serve with excellence.
            <br />
            <strong>Shri Souvik Sinha</strong>
            <div className="principal-role">Principal</div>
          </div>
        </div>
      </Section>
    </>
  );
}
