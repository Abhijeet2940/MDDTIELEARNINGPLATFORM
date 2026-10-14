import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSession } from "../auth/session";
import { apiRequest } from "../api/client";
import easternRailwayLogo from "../Assessts/Indian Railways.png";

export default function AssessmentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedAssessmentId = searchParams.get("assessmentId");
  const [assessments, setAssessments] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    let active = true;
    const loadAssessments = () => {
      setLoading(true);
      setError("");
      apiRequest("/api/v1/assessment-catalog")
        .then((available) => {
        if (!active) return;
        const availableQuizzes = available.filter((item) => !item.certificateIssued);
        setAssessments(availableQuizzes);
        setSelectedId((current) => {
          const selected =
            availableQuizzes.find((item) => item.id === requestedAssessmentId) ||
            availableQuizzes.find((item) => item.id === current) ||
            availableQuizzes[0];
          return selected?.id || "";
        });
      })
        .catch((requestError) => {
          if (active) setError(requestError.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };
    loadAssessments();
    window.addEventListener("focus", loadAssessments);
    return () => {
      active = false;
      window.removeEventListener("focus", loadAssessments);
    };
  }, [requestedAssessmentId]);

  useEffect(() => {
    if (!selectedId) {
      setAssessment(null);
      setResult(null);
      setSelectedAnswers({});
      return undefined;
    }
    let active = true;
    setAssessment(null);
    setResult(null);
    setSelectedAnswers({});
    apiRequest(`/api/v1/assessments/${selectedId}`)
      .then((data) => {
        if (active) setAssessment(data);
      })
      .catch((requestError) => setError(requestError.message));
    return () => {
      active = false;
    };
  }, [selectedId]);

  useEffect(() => {
    if (assessment?.certificate && window.location.hash === '#certificate-title') {
      document.getElementById('certificate-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [assessment]);

  const submitAssessment = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      const response = await apiRequest(
        `/api/v1/assessments/${selectedId}/attempts`,
        {
          method: "POST",
          body: {
            answers: assessment.questions.map((question) => ({
              questionId: question.id,
              optionId: formData.get(`question-${question.id}`),
            })),
          },
        },
      );
      setResult(response);
      setAssessment((current) => ({
        ...current,
        attemptsUsed: response.attemptsUsed,
        attemptsRemaining: response.attemptsRemaining,
        latestPercentage: response.percentage,
        certificate: response.certificate || current.certificate,
      }));
      if (response.certificate) {
        navigate(`/app/certificates/${selectedId}`);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selected = assessments.find((item) => item.id === selectedId);
  const questionCount = assessment?.questions.length ?? 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <section className="portal-page portal-page--narrow assessment-page">
      <div className="portal-page__heading assessment-page__heading">
        <div>
          <p className="portal-kicker">KNOWLEDGE CHECK</p>
          <h1>Assessment</h1>
          <p>
            Review the questions and submit your answers when you are ready.
          </p>
        </div>
        <span className="assessment-attempts">
          {assessment?.attemptsRemaining ?? "—"} <small>attempts left</small>
        </span>
      </div>
      {loading ? (
        <p className="assessment-state" role="status">
          Loading your assessments…
        </p>
      ) : null}
      {!loading && assessments.length === 0 ? (
        <p className="assessment-state">
          No quizzes are currently available.
        </p>
      ) : null}
      {assessments.length > 0 ? (
        <label className="portal-field assessment-selector">
          <span>Choose an assessment</span>
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {[...new Map(assessments.map((item) => [item.courseId, item.courseTitle]))].map(
              ([courseId, courseTitle]) => (
                <optgroup key={courseId} label={courseTitle}>
                  {assessments.filter((item) => item.courseId === courseId).map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </optgroup>
              ),
            )}
          </select>
        </label>
      ) : null}
      {assessment ? (
        <section
          className="assessment-overview"
          aria-labelledby="assessment-title"
        >
          <p className="assessment-overview__course">
            {selected?.courseTitle || "LEARNING ASSESSMENT"}
          </p>
          <h2 id="assessment-title">{selected?.title || "Assessment"}</h2>
          {selected?.description ? (
            <p className="assessment-overview__description">
              {selected.description}
            </p>
          ) : null}
          <div className="assessment-overview__meta">
            <span>
              <strong>{questionCount}</strong> questions
            </span>
            <span>
              <strong>{assessment.attemptsUsed ?? 0}</strong> attempts used
            </span>
            {assessment.latestPercentage != null ? (
              <span>
                <strong>{assessment.latestPercentage}%</strong> latest score
              </span>
            ) : null}
          </div>
          {assessment.attemptsRemaining > 0 ? (
            <div className="assessment-progress">
              <div className="assessment-progress__label">
                <span>Assessment progress</span>
                <strong>
                  {answeredCount} of {questionCount} answered
                </strong>
              </div>
              <div
                className="assessment-progress__track"
                role="progressbar"
                aria-label="Questions answered"
                aria-valuemin="0"
                aria-valuemax={questionCount}
                aria-valuenow={answeredCount}
              >
                <span
                  style={{
                    width: `${questionCount ? (answeredCount / questionCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
      {error ? (
        <p className="portal-message portal-message--error" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <p className="assessment-result" role="status">
          <span className="assessment-result__score">{result.percentage}%</span>
          <span>
            <strong>Assessment submitted</strong>
            <small>
              {result.score} of {result.possibleScore} correct ·{" "}
              {result.attemptsRemaining} attempts remaining
            </small>
          </span>
        </p>
      ) : null}
      {assessment?.certificate ? (
        <section
          className="portal-certificate portal-certificate-print"
          aria-labelledby="certificate-title"
        >
          <div className="portal-certificate__header">
            <div className="portal-certificate__brand" aria-label="Eastern Railway brand">
              <img
                className="portal-certificate__logo-image"
                src={easternRailwayLogo}
                alt="Eastern Railway logo"
              />
              <div className="portal-certificate__brand-copy">
                <span>Eastern Railway</span>
                <small>MDDTI • Beleghata Sealdah Division</small>
              </div>
            </div>
          </div>

          <div className="portal-certificate__content">
            <p className="portal-kicker portal-certificate__heading">
              CERTIFICATE OF COMPLETION
            </p>
            <p className="portal-certificate__lead">This is to certify that</p>
            <h2 id="certificate-title" className="portal-certificate__name">
              {[getSession()?.name].filter(Boolean).join(" ") || "Name"}
            </h2>
            <p className="portal-certificate__statement">
              has successfully completed the <strong>{selected?.title || "assessment"}</strong> with an assessment score of <strong>{assessment.latestPercentage ?? result?.percentage ?? 0}%</strong>, demonstrating a strong understanding of the subject.
            </p>
          </div>

          <div className="portal-certificate__footer">
            <div className="portal-certificate__signature">
              <span className="portal-certificate__signature-line" aria-hidden="true" />
              <small>MDDTI, Beleghata Sealdah Division</small>
            </div>
            <div className="portal-certificate__meta">
              <div className="portal-certificate__meta-row">
                <span>Certificate ID</span>
                <strong>{assessment.certificate.certificateNumber}</strong>
              </div>
              <div className="portal-certificate__meta-row">
                <span>Date of Issue</span>
                <strong>
                  {new Date(assessment.certificate.issuedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>
          </div>

          <button
            className="portal-button portal-button--primary"
            type="button"
            onClick={() => window.print()}
          >
            Print certificate
          </button>
        </section>
      ) : null}
      {assessment && assessment.attemptsRemaining > 0 ? (
        <form
          key={selectedId}
          className="portal-assessment"
          onSubmit={submitAssessment}
        >
          {assessment.questions.map((question, questionIndex) => (
            <fieldset
              className="portal-question"
              key={question.id}
              aria-labelledby={`question-${question.id}`}
            >
              <div
                className="portal-question__prompt"
                id={`question-${question.id}`}
              >
                <span>{String(questionIndex + 1).padStart(2, "0")}</span>
                {question.prompt}
              </div>
              <div className="portal-question__options">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className={`portal-choice${selectedAnswers[question.id] === option.id ? " portal-choice--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={selectedAnswers[question.id] === option.id}
                      onChange={() =>
                        setSelectedAnswers((current) => ({
                          ...current,
                          [question.id]: option.id,
                        }))
                      }
                      required
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="assessment-submit">
            <p>
              {answeredCount === questionCount
                ? "All questions answered"
                : `${questionCount - answeredCount} ${questionCount - answeredCount === 1 ? "question" : "questions"} remaining`}
            </p>
            <button
              className="portal-button portal-button--primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit assessment"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
