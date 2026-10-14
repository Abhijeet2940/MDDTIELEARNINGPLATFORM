import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import emblem from '../Assessts/emblem.png';
import indianRailways from '../Assessts/Indian Railways.png';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Faculty', to: '/faculty' },
  { label: 'Contact', to: '/contact' },
];

export default function Layout({ children }) {
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    const root = document.documentElement;
    const previousFontSize = root.style.fontSize;
    root.style.fontSize = `${fontScale * 100}%`;

    return () => {
      root.style.fontSize = previousFontSize;
    };
  }, [fontScale]);

  return (
    <div className="site-shell">
      <div className="gov-bar">
        <div className="gov-bar__links" aria-label="Government links">
          <a href="https://www.india.gov.in/" target="_blank" rel="noreferrer">
            <span lang="hi">भारत सरकार</span>
            <strong>Government of India</strong>
          </a>
          <a href="https://indianrailways.gov.in/" target="_blank" rel="noreferrer">
            <span lang="hi">रेल मंत्रालय</span>
            <strong>Ministry of Railways</strong>
          </a>
          <a href="https://er.indianrailways.gov.in/" target="_blank" rel="noreferrer">
            <span lang="hi">पूर्व रेलवे</span>
            <strong>Eastern Railway</strong>
          </a>
        </div>
        <div className="gov-bar__accessibility">
          <div className="font-controls" aria-label="Text size">
            <button type="button" onClick={() => setFontScale(Math.max(0.9, fontScale - 0.05))} aria-label="Decrease text size">A-</button>
            <button type="button" onClick={() => setFontScale(1)} aria-label="Reset text size">A</button>
            <button type="button" onClick={() => setFontScale(Math.min(1.1, fontScale + 0.05))} aria-label="Increase text size">A+</button>
          </div>
          {/* <a href="#main-content">Screen Reader Access</a> */}
        </div>
      </div>

      <header className="site-header">
        <div className="container header__inner">
          <NavLink className="brand" to="/" aria-label="MDDTI home">
            <img className="brand__mark" src={emblem} alt="Government of India emblem" />
            <img className="brand__mark" src={indianRailways} alt="Indian Railways" />
            <span className="brand__copy">
              <span lang="hi">ई-लर्निंग प्लेटफॉर्म - सियालदह मंडल</span>
              <strong>MDDTI E-Learning Platform</strong>
              <small>Elearning Platform - Sealdah division</small>
            </span>
          </NavLink>

          <div className="header-menu">
            <nav className="main-nav" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="header-actions">
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="header-actions__primary">
                Registration
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex="-1">{children}</main>

      <footer className="site-footer">
        <div className="container footer__grid">
          <div>
            <h3>MDDTI Sealdah</h3>
            <p>
              A training-focused institution dedicated to professional development, practical learning, and
              railway service excellence.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/about">About Us</NavLink></li>
              <li><NavLink to="/faculty">Faculty</NavLink></li>
              <li><NavLink to="/guide">Guideline</NavLink></li>
              <li><NavLink to="/contact">Contact</NavLink></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>+0294 256 0321</li>
              <li>sealdahrailway@gmail.com</li>
              <li>Sealdah, West Bengal</li>
            </ul>
          </div>
        </div>
        <div className="container footer__bottom">© 2026 Eastern Railway. Developed by Towerlink pvt. LTd under the visionary leadership of Sri Kundan Kumar Sahay (Sr. DPO), Sealdah Division. </div>
      </footer>
    </div>
  );
}
