import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function LessonReaderPage() {
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [lessonQuizzes, setLessonQuizzes] = useState([]);
  const [documentUrl, setDocumentUrl] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    setCourse(null);
    setLesson(null);
    setCourseQuizzes([]);
    setLessonQuizzes([]);
    setDocumentUrl('');
    setPreviewFileName('');
    setLoading(true);
    setError('');

    Promise.all([
      apiRequest('/api/v1/courses'),
      apiRequest(`/api/v1/courses/${courseId}/lessons`),
      apiRequest(`/api/v1/courses/${courseId}/assessments`),
    ]).then(async ([courses, lessons, assessments]) => {
      const selectedCourse = courses.find((item) => item.id === courseId);
      const selectedLesson = lessons.find((item) => item.id === lessonId);
      if (!selectedCourse || !selectedLesson) throw new Error('This lesson is not available in your catalogue.');

      const lessonDocuments = selectedLesson.documents || [];
      const previewDocument = lessonDocuments.find((document) => document.fileName?.toLowerCase().endsWith('.pdf'));
      let lessonFile = null;
      if (previewDocument) {
        lessonFile = await apiRequest(`/api/v1/lessons/${lessonId}/documents/${previewDocument.id}`);
      } else if (!lessonDocuments.length && selectedLesson.documentFileName?.toLowerCase().endsWith('.pdf')) {
        lessonFile = await apiRequest(`/api/v1/lessons/${lessonId}/document`);
      }
      if (!active) return;
      setCourse(selectedCourse);
      setLesson(selectedLesson);
      setCourseQuizzes(assessments.filter((assessment) => !assessment.lessonId && !assessment.certificateIssued));
      setLessonQuizzes(assessments.filter((assessment) => assessment.lessonId === lessonId && !assessment.certificateIssued));
      if (lessonFile) {
        objectUrl = URL.createObjectURL(lessonFile);
        setDocumentUrl(objectUrl);
        setPreviewFileName(previewDocument?.fileName || selectedLesson.documentFileName);
      }
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [courseId, lessonId]);

  const lessonDocuments = lesson?.documents?.length
    ? lesson.documents
    : lesson?.documentFileName ? [{ id: null, fileName: lesson.documentFileName }] : [];

  const downloadLessonDocument = async (attachment) => {
    setError('');
    try {
      const endpoint = attachment.id
        ? `/api/v1/lessons/${lessonId}/documents/${attachment.id}`
        : `/api/v1/lessons/${lessonId}/document`;
      const file = await apiRequest(endpoint);
      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = attachment.fileName || 'lesson-file';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="portal-page course-reader course-reader--lesson">
      <div className="portal-page__heading course-reader__heading">
        <div>
          <p className="portal-kicker">{course?.title || 'COURSE'} · LESSON</p>
          <h1>{lesson?.title || 'Lesson reader'}</h1>
        </div>
        <Link className="course-reader__back" to={`/app/learning/courses/${courseId}`}>Back to course</Link>
      </div>
      {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
      {loading ? <p className="course-reader__state" role="status">Loading lesson…</p> : null}
      {!loading && !error && lesson ? (
        <>
          <section className="course-reader__lessons course-reader__lesson-summary">
            <p className="portal-kicker">{lesson.category} · {lesson.durationMinutes} MINUTES</p>
            <h2>{lesson.title}</h2>
            {lesson.description ? <p className="course-reader__description">{lesson.description}</p> : null}
            {lesson.youtubeUrl ? (
              <a className="portal-button portal-button--outline" href={lesson.youtubeUrl} target="_blank" rel="noreferrer">
                Watch lesson video
              </a>
            ) : null}
          </section>
          {courseQuizzes.length ? (
            <section className="course-reader__lessons course-reader__course-assessments">
              <p className="portal-kicker">COURSE ASSESSMENT</p>
              <h2>Course quizzes</h2>
              {courseQuizzes.map((quiz) => (
                <article className="course-reader__quiz-item" key={quiz.id}>
                  <div><h3>{quiz.title}</h3><p>{quiz.description}</p></div>
                  <Link className="portal-button portal-button--primary" to={`/app/assessment?assessmentId=${quiz.id}`}>Take quiz</Link>
                </article>
              ))}
            </section>
          ) : null}
          {lessonQuizzes.length ? (
            <section className="course-reader__lessons course-reader__lesson-quizzes">
              <p className="portal-kicker">KNOWLEDGE CHECK</p>
              <h2>Lesson quizzes</h2>
              {lessonQuizzes.map((quiz) => (
                <article className="course-reader__quiz-item" key={quiz.id}>
                  <div><h3>{quiz.title}</h3><p>{quiz.description}</p></div>
                  <Link className="portal-button portal-button--primary" to={`/app/assessment?assessmentId=${quiz.id}`}>Take quiz</Link>
                </article>
              ))}
            </section>
          ) : null}
          {lessonDocuments.length ? (
            <div className="course-reader__document">
              <div className="course-reader__toolbar">
                <span>{lessonDocuments.length} attached file{lessonDocuments.length === 1 ? '' : 's'}</span>
                {lessonDocuments.map((attachment) => (
                  <button className="portal-button portal-button--primary" key={attachment.id || attachment.fileName} type="button" onClick={() => downloadLessonDocument(attachment)}>
                    Download {attachment.fileName}
                  </button>
                ))}
              </div>
              {documentUrl ? (
                <iframe className="course-reader__frame" src={documentUrl} title={`${lesson.title} ${previewFileName} preview`} />
              ) : null}
            </div>
          ) : (
            <p className="course-reader__state">No file is attached to this lesson.</p>
          )}
        </>
      ) : null}
    </section>
  );
}