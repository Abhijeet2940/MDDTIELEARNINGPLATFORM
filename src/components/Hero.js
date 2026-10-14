import { useEffect, useState } from 'react';
import Button from './Button';
import heroCarouselImage from '../Assessts/Hero-Corousel.png';

export default function Hero({ eyebrow, title, description, primaryCta, secondaryCta, slides = [] }) {
  const carouselSlides = slides.length ? slides : [{ eyebrow, title, description, primaryCta, secondaryCta, image: heroCarouselImage }];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (carouselSlides.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [carouselSlides.length]);

  const slide = carouselSlides[activeSlide];

  return (
    <section className={`hero ${slide.image ? 'hero--image' : ''}`}>
      {slide.image ? (
        <img className="hero__image" src={slide.image} alt={slide.title || ''} />
      ) : (
        <div className="container hero__inner">
          <div className="hero__content">
            <p className="eyebrow eyebrow--light">{slide.eyebrow}</p>
            <h1 key={activeSlide}>{slide.title}</h1>
            <p className="hero__description">{slide.description}</p>
            <div className="cta-row">
              {slide.primaryCta ? <Button {...slide.primaryCta} /> : null}
              {slide.secondaryCta ? <Button variant="secondary" {...slide.secondaryCta} /> : null}
            </div>
          </div>
        </div>
      )}

      {carouselSlides.length > 1 ? (
        <div className="container hero__controls" aria-label="Hero slides">
          <button type="button" className="hero__control" onClick={() => setActiveSlide((activeSlide - 1 + carouselSlides.length) % carouselSlides.length)} aria-label="Previous slide">
            ←
          </button>
          {carouselSlides.map((item, index) => (
            <button
              type="button"
              key={item.title}
              className={`hero__indicator ${index === activeSlide ? 'hero__indicator--active' : ''}`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeSlide ? 'true' : undefined}
            />
          ))}
          <button type="button" className="hero__control" onClick={() => setActiveSlide((activeSlide + 1) % carouselSlides.length)} aria-label="Next slide">
            →
          </button>
        </div>
      ) : null}
    </section>
  );
}
