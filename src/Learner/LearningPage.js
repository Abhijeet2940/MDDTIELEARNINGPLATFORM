import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function LearningPage() {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzesByCourse, setQuizzesByCourse] = useState({});
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([
      apiRequest('/api/v1/courses'),
      apiRequest('/api/v1/progress/me'),
    ]).then(async ([courseList, progress]) => {
        const courseContent = await Promise.all(courseList.map(async (course) => {
          const [courseLessons, courseQuizzes] = await Promise.all([
            apiRequest(`/api/v1/courses/${course.id}/lessons`),
            apiRequest(`/api/v1/courses/${course.id}/assessments`),
          ]);
          return {
            course,
            lessons: courseLessons,
            quizzes: courseQuizzes.filter((quiz) => !quiz.certificateIssued),
          };
        }));
      if (!active) return;
      setCourses(courseList);
        setQuizzesByCourse(Object.fromEntries(courseContent.map(({ course, quizzes }) => [course.id, quizzes])));
        setLessons(courseContent.flatMap(({ course, lessons: courseItems }) => (
        courseItems.map((lesson) => ({ ...lesson, courseTitle: course.title }))
      )));
      setCompletedLessons(progress.completedLessons.map((item) => item.lessonId));
    }).catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
    return () => { active = false; };
  }, [refreshKey]);

  useEffect(() => {
    const refreshCatalogue = () => setRefreshKey((current) => current + 1);
    window.addEventListener('focus', refreshCatalogue);
    return () => window.removeEventListener('focus', refreshCatalogue);
  }, []);

  const markComplete = async (lessonId) => {
    try {
      await apiRequest(`/api/v1/lessons/${lessonId}/completion`, {
        method: 'PUT',
        body: { completed: true },
      });
      setCompletedLessons((current) => current.includes(lessonId) ? current : [...current, lessonId]);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="portal-page">
      <div className="portal-page__heading"><div><p className="portal-kicker">LEARN AT YOUR PACE</p><h1>Learning Module</h1></div><span className="portal-date-mark">{completedLessons.length} / {lessons.length} COMPLETE</span></div>
      <p className="portal-page__lede">Short, practical modules for the skills you use every day.</p>
      {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
      {loading ? <p>Loading courses…</p> : null}
      {!loading && !error && courses.length === 0 ? <p className="portal-page__lede">No published courses are available for your department yet.</p> : null}
      <div className="portal-course-list" aria-label="Available courses">
        {courses.map((course) => <article className="portal-course portal-course--learner" key={course.id}>
          <div className="portal-course__top">
            <p className="portal-kicker">{course.category || 'COURSE'} · {course.department}</p>
            {course.documentFileName ? <span className="portal-course__badge">COURSE FILE</span> : null}
          </div>
          <h2>{course.title}</h2>
          <p className="portal-course__description">{course.description || 'Course material and lessons for your training.'}</p>
          <div className="portal-course__footer">
            <span>{course.documentFileName || 'No course file attached'}</span>
            <div className="portal-course__actions">
              <Link className="portal-button portal-button--primary" to={`/app/learning/courses/${course.id}`}>Open course</Link>
              {(quizzesByCourse[course.id] || []).map((quiz) => (
                <Link
                  className="portal-button portal-button--outline"
                  key={quiz.id}
                  to={`/app/assessment?assessmentId=${quiz.id}`}
                  aria-label={`Take ${quiz.title}`}
                >Take quiz</Link>
              ))}
            </div>
          </div>
        </article>)}
      </div>
      <div className="portal-lesson-list">
        {lessons.map((lesson, index) => {
          const complete = completedLessons.includes(lesson.id);
          return (
            <article className="portal-lesson" key={lesson.id}>
              <span className="portal-lesson__index">0{index + 1}</span>
              <div className="portal-lesson__body"><p className="portal-kicker">{lesson.courseTitle} · {lesson.category} <span>· {lesson.durationMinutes} min</span></p><h2>{lesson.title}</h2><p>{lesson.description}</p></div>
              <button className={`portal-button ${complete ? 'portal-button--quiet' : 'portal-button--outline'}`} type="button" onClick={() => markComplete(lesson.id)} disabled={complete}>{complete ? 'Completed' : 'Mark complete'}</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}