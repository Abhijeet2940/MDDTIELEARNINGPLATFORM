import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { PortalProgress } from './LearnerComponents';

export default function ProgressPage() {
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [progress, setProgress] = useState({ percentage: 0, completedCount: 0, totalLessons: 0 });
  const [quizScores, setQuizScores] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest('/api/v1/courses'), apiRequest('/api/v1/progress/me')])
      .then(async ([courses, currentProgress]) => {
        const [courseContent, courseAssessments] = await Promise.all([
          Promise.all(courses.map(async (course) => {
            const items = await apiRequest(`/api/v1/courses/${course.id}/lessons`);
            return items.map((lesson) => ({ ...lesson, courseTitle: course.title }));
          })),
          Promise.all(courses.map(async (course) => {
            const items = await apiRequest(`/api/v1/courses/${course.id}/assessments`);
            return items.map((item) => ({ ...item, courseId: course.id, courseTitle: course.title }));
          })),
        ]);
        const assessments = courseAssessments.flat();
        const assessmentDetails = await Promise.all(assessments.map((item) => apiRequest(`/api/v1/assessments/${item.id}`)));
        if (!active) return;
        const allLessons = courseContent.flat();
        const completed = currentProgress.completedLessons.map((item) => item.lessonId);
        const scores = {};
        const earnedCertificates = [];
        let quizPercentageTotal = 0;
        assessments.forEach((item, index) => {
          const detail = assessmentDetails[index];
          scores[item.id] = {
            courseId: item.courseId,
            courseTitle: item.courseTitle,
            lessonId: item.lessonId,
            title: item.title,
            percentage: detail.latestPercentage,
          };
          quizPercentageTotal += detail.latestPercentage ?? 0;
          if (detail.certificate) {
            earnedCertificates.push({ ...detail.certificate, assessmentId: item.id, assessmentTitle: item.title, courseTitle: item.courseTitle });
          }
        });
        const completedCount = allLessons.filter((lesson) => completed.includes(lesson.id)).length;
        const completionPercentage = allLessons.length ? completedCount * 100 / allLessons.length : 0;
        const quizPercentage = assessments.length ? quizPercentageTotal / assessments.length : null;
        setLessons(allLessons);
        setCompletedIds(completed);
        setQuizScores(scores);
        setCertificates(earnedCertificates);
        setProgress({
          percentage: Math.round(quizPercentage == null ? completionPercentage : (completionPercentage + quizPercentage) / 2),
          completedCount,
          totalLessons: allLessons.length,
        });
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <section className="portal-page portal-page--narrow">
      <div className="portal-page__heading"><div><p className="portal-kicker">YOUR TRAINING RECORD</p><h1>Progress Tracking</h1></div><span className="portal-date-mark">{progress.completedCount} / {progress.totalLessons} COMPLETE</span></div>
      {loading ? <p>Loading progress…</p> : null}
      {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
      <div className="portal-progress-panel">
        <div className="portal-progress-panel__top"><div><p className="portal-kicker">LESSON AND QUIZ PROGRESS</p><strong>{progress.percentage}%</strong></div><span>{progress.completedCount} of {progress.totalLessons} lessons marked complete</span></div>
        <PortalProgress value={progress.percentage} />
      </div>
      <div className="portal-progress-list">
        {lessons.map((lesson) => {
          const complete = completedIds.includes(lesson.id);
          return <div className="portal-progress-row" key={lesson.id}><span className={`portal-status-dot${complete ? ' portal-status-dot--done' : ''}`} aria-hidden="true" /><span>{lesson.courseTitle} · {lesson.title}</span><strong>{complete ? 'Complete' : 'Not started'}</strong></div>;
        })}
      </div>
      {Object.keys(quizScores).length ? <section className="portal-progress-certificates" aria-labelledby="progress-quizzes-title">
        <p className="portal-kicker">COURSE PERFORMANCE</p>
        <h2 id="progress-quizzes-title">Quiz results</h2>
        {Object.entries(quizScores).map(([quizId, quiz]) => <article className="portal-progress-row" key={quizId}>
          <span className={`portal-status-dot${quiz.percentage != null ? ' portal-status-dot--done' : ''}`} aria-hidden="true" />
          <span>{quiz.courseTitle} · {quiz.title}</span>
          <strong>{quiz.percentage == null ? 'Not attempted' : `${quiz.percentage}%`}</strong>
        </article>)}
      </section> : null}
      {certificates.length ? <section className="portal-progress-certificates" aria-labelledby="progress-certificates-title">
        <p className="portal-kicker">ACHIEVEMENTS</p>
        <h2 id="progress-certificates-title">Issued certificates</h2>
        {certificates.map((certificate) => <article className="portal-progress-row" key={certificate.id}>
          <span className="portal-status-dot portal-status-dot--done" aria-hidden="true" />
          <span>{certificate.courseTitle ? `${certificate.courseTitle} · ` : ''}{certificate.assessmentTitle}<small>Certificate {certificate.certificateNumber} · Issued {new Date(certificate.issuedAt).toLocaleDateString()}</small></span>
          <Link className="portal-button portal-button--outline portal-progress-certificate__link" to={`/app/certificates/${certificate.assessmentId}`}>View certificate</Link>
        </article>)}
      </section> : null}
    </section>
  );
}