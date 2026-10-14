import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";

export default function CourseReaderPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [documentUrl, setDocumentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    setCourse(null);
    setLessons([]);
    setQuizzes([]);
    setDocumentUrl("");
    setLoading(true);
    setError("");

    apiRequest("/api/v1/courses")
      .then(async (courses) => {
        if (!active) return;
        const selectedCourse = courses.find((item) => item.id === courseId);
        if (!selectedCourse)
          throw new Error("This course is not available in your catalogue.");
        setCourse(selectedCourse);

        const [courseLessons, courseAssessments, coursePdf] = await Promise.all(
          [
            apiRequest(`/api/v1/courses/${courseId}/lessons`),
            apiRequest(`/api/v1/courses/${courseId}/assessments`),
            selectedCourse.documentFileName
              ? apiRequest(`/api/v1/courses/${courseId}/document`)
              : Promise.resolve(null),
          ],
        );
        if (!active) return;
        setLessons(courseLessons);
        setQuizzes(courseAssessments.filter((quiz) => !quiz.certificateIssued));
        if (coursePdf) {
          objectUrl = URL.createObjectURL(coursePdf);
          setDocumentUrl(objectUrl);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [courseId]);

  const downloadLessonDocument = async (lesson, attachment) => {
    setError("");
    try {
      const endpoint = attachment.id
        ? `/api/v1/lessons/${lesson.id}/documents/${attachment.id}`
        : `/api/v1/lessons/${lesson.id}/document`;
      const file = await apiRequest(endpoint);
      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachment.fileName || "lesson-file";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="portal-page course-reader">
      <div className="portal-page__heading course-reader__heading">
        <div>
          <p className="portal-kicker">COURSE MATERIAL</p>
          <h1>{course?.title || "Course reader"}</h1>
        </div>
        <Link className="course-reader__back" to="/app/learning">
          Back to courses
        </Link>
      </div>
      {error ? (
        <p className="portal-message portal-message--error" role="alert">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="course-reader__state" role="status">
          Loading course materials…
        </p>
      ) : null}
      {!loading && !error && documentUrl ? (
        <div className="course-reader__document">
          <div className="course-reader__toolbar">
            <span>{course.documentFileName}</span>
            <a
              className="portal-button portal-button--primary"
              href={documentUrl}
              download={course.documentFileName || "course.pdf"}
            >
              Download file
            </a>
          </div>
          {course.documentFileName?.toLowerCase().endsWith(".pdf") ? (
            <iframe
              className="course-reader__frame"
              src={documentUrl}
              title={`${course.title} course PDF`}
            />
          ) : null}
        </div>
      ) : null}
      {!loading && !error && course ? (
        <section className="course-reader__lessons">
          <p className="portal-kicker">COURSE LESSONS</p>
          <h2>{course.title}</h2>
          {course.description ? (
            <p className="course-reader__description">{course.description}</p>
          ) : null}
          {course.youtubeUrl ? (
            <a className="portal-button portal-button--outline" href={course.youtubeUrl} target="_blank" rel="noreferrer">
              Watch course video
            </a>
          ) : null}
          {!course.documentFileName ? (
            <p className="course-reader__state" role="status">
              No course file is attached. Contact an administrator to add one.
            </p>
          ) : null}
          {lessons.length ? (
            <div className="portal-lesson-list">
              {lessons.map((lesson, index) => (
                <article className="portal-lesson" key={lesson.id}>
                  <span className="portal-lesson__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="portal-lesson__body">
                    <p className="portal-kicker">
                      {lesson.category}
                      {lesson.durationMinutes
                        ? ` · ${lesson.durationMinutes} min`
                        : ""}
                    </p>
                    <h2>{lesson.title}</h2>
                    {lesson.description ? <p>{lesson.description}</p> : null}
                    {lesson.youtubeUrl ? (
                      <a className="portal-button portal-button--outline" href={lesson.youtubeUrl} target="_blank" rel="noreferrer">
                        Watch lesson video
                      </a>
                    ) : null}
                    <Link
                      className="portal-button portal-button--primary"
                      to={`/app/learning/courses/${courseId}/lessons/${lesson.id}`}
                    >
                      View lesson
                    </Link>
                    {(lesson.documents?.length ? lesson.documents : lesson.documentFileName ? [{ id: null, fileName: lesson.documentFileName }] : []).map((attachment) => (
                      <button
                        className="portal-button portal-button--outline"
                        type="button"
                        key={attachment.id || attachment.fileName}
                        onClick={() => downloadLessonDocument(lesson, attachment)}
                      >
                        Download {attachment.fileName}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : documentUrl ? null : (
            <p className="course-reader__state">
              No course file or lessons are currently available for this course.
            </p>
          )}
        </section>
      ) : null}
      {!loading && !error && quizzes.length ? (
        <section className="course-reader__lessons course-reader__course-assessments">
          <p className="portal-kicker">COURSE ASSESSMENT</p>
          <h2>Course quizzes</h2>
          {quizzes.map((quiz) => (
            <article className="course-reader__quiz-item" key={quiz.id}>
              <div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>
              </div>
              <Link
                className="portal-button portal-button--primary"
                to={`/app/assessment?assessmentId=${quiz.id}`}
              >
                Take quiz
              </Link>
            </article>
          ))}
        </section>
      ) : null}
    </section>
  );
}
