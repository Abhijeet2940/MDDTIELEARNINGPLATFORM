import { useState } from 'react';
import Hero from '../components/Hero';
import Section from '../components/Section';
import instituteEntrance from '../Assessts/AboutInstitute1.jpg';
import instituteCampus from '../Assessts/AboutInstitute2.jpg';
import PreviousBatches from '../Assessts/PreviousBatches.jpg';
import leadership1 from '../Assessts/Leadership1.jpg';
import HostelEntrance from '../Assessts/HostelEntrance.jpg';

const leadership = [
  { name: 'Shri Souvik Sinha', role: 'Principal' },
  { name: 'Shri P.K. Roy', role: 'Chief Welfare Inspector' },
  { name: 'Shri Sudipta Basu', role: 'Operating Instructor' },
  { name: 'Shri Sudipta Mukherjee', role: 'Engineering Instructor' },
];

const galleryPhotos = [
  { src: PreviousBatches, alt: 'Students from a previous training batch', caption: 'Previous batches' },
  { src: leadership1, alt: 'Leadership team', caption: 'Institute leadership' },
  { src: instituteEntrance, alt: 'Entrance to the Multi-Disciplinary Divisional Training Institute', caption: 'Institute entrance' },
  { src: instituteCampus, alt: 'Campus building and courtyard', caption: 'Campus grounds' },
  { src: HostelEntrance, alt: 'Entrance to the hostel', caption: 'Hostel entrance' },
];



export default function FacultyPage() {
  const [activePhoto, setActivePhoto] = useState(0);

  const showPhoto = (index) => {
    setActivePhoto((index + galleryPhotos.length) % galleryPhotos.length);
  };

  const handleCarouselKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(activePhoto - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(activePhoto + 1);
    }
  };

  return (
    <>
      <Hero
        eyebrow="Faculty"
        title="Guidance that turns knowledge into capability"
        description="Meet the dedicated faculty and instructors who make practice-based learning part of every training journey."
        primaryCta={{ children: 'About the institute', to: '/about' }}
        secondaryCta={{ children: 'Contact us', to: '/contact' }}
      />
      <Section id="faculty-overview" eyebrow="Faculty" title="Guiding a modern training culture" description="The institute is backed by a dedicated faculty team committed to practice-based learning and professional standards.">
        <div className="faculty-table-wrap">
          <table className="faculty-table">
            <thead>
              <tr>
                <th scope="col">Faculty member</th>
                <th scope="col">Designation</th>
              </tr>
            </thead>
            <tbody>
              {leadership.map((person) => (
                <tr key={person.name}>
                  <td>{person.name}</td>
                  <td>{person.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="institute-gallery" eyebrow="Gallery" title="A closer look at the institute">
        <div
          className="faculty-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="Institute photo gallery"
          tabIndex={0}
          onKeyDown={handleCarouselKeyDown}
        >
          <div className="faculty-carousel__stage" aria-live="polite">
            <div className="faculty-carousel__photo">
              <img
                src={galleryPhotos[activePhoto].src}
                alt={galleryPhotos[activePhoto].alt}
                decoding="async"
              />
            </div>
            <div className="faculty-carousel__caption">
              <span>{galleryPhotos[activePhoto].caption}</span>
              <span>{String(activePhoto + 1).padStart(2, '0')} / {String(galleryPhotos.length).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="faculty-carousel__controls">
            <button className="faculty-carousel__arrow faculty-carousel__arrow--previous" type="button" onClick={() => showPhoto(activePhoto - 1)} aria-label="Previous photo" />
            <p className="faculty-carousel__current" aria-live="polite">{galleryPhotos[activePhoto].caption}</p>
            <button className="faculty-carousel__arrow faculty-carousel__arrow--next" type="button" onClick={() => showPhoto(activePhoto + 1)} aria-label="Next photo" />
          </div>

          <div className="faculty-carousel__pagination" role="group" aria-label="Choose a photo">
            {galleryPhotos.map((photo, index) => (
              <button
                className={`faculty-carousel__dot${index === activePhoto ? ' faculty-carousel__dot--active' : ''}`}
                key={photo.src}
                type="button"
                aria-label={`Show ${photo.caption}`}
                aria-current={index === activePhoto ? 'true' : undefined}
                onClick={() => showPhoto(index)}
              />
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
