import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

const createQuestions = (count = 5) => Array.from({ length: count }, () => ({
  prompt: '',
  options: ['', '', '', ''],
  correctOption: 0,
}));
const MAX_QUESTIONS = 100;

export default function CourseQuizBuilder({ course }) {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState(createQuestions);
  const [title, setTitle] = useState(`${course.title} quiz`);
  const [description, setDescription] = useState(`Check your understanding of ${course.title}.`);
  const [passPercentage, setPassPercentage] = useState(70);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest(`/api/v1/admin/courses/${course.id}/assessments`)
      .then((assessments) => {
        if (active) setQuizzes(assessments.filter((assessment) => !assessment.lessonId));
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [course.id]);

  const updateQuestion = (questionIndex, updates) => {
    setQuestions((current) => current.map((question, index) => (
      index === questionIndex ? { ...question, ...updates } : question
    )));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      return { ...question, options: question.options.map((option, currentOption) => (
        currentOption === optionIndex ? value : option
      )) };
    }));
  };

  const saveQuiz = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const assessment = await apiRequest(`/api/v1/admin/courses/${course.id}/quizzes`, {
        method: 'POST',
        body: {
          title: title.trim(),
          description: description.trim(),
          passPercentage: Number(passPercentage),
          questions: questions.map((question) => ({
            prompt: question.prompt.trim(),
            options: question.options.map((text, index) => ({
              text: text.trim(),
              correct: index === question.correctOption,
            })),
          })),
        },
      });
      setQuizzes((current) => [...current, assessment]);
      setNotice('Course quiz saved as a draft. Publish it after the course is published.');
      setTitle(`${course.title} quiz`);
      setDescription(`Check your understanding of ${course.title}.`);
      setPassPercentage(70);
      setQuestions(createQuestions());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const publishQuiz = async (quiz) => {
    setPublishingId(quiz.id);
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/v1/admin/assessments/${quiz.id}/publish`, { method: 'POST' });
      setQuizzes((current) => current.map((item) => item.id === quiz.id ? { ...item, published: true } : item));
      setNotice(`"${quiz.title}" is available to learners.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPublishingId('');
    }
  };

  return (
    <section className="admin-lesson-quiz" aria-label={`Course quiz for ${course.title}`}>
      <div className="admin-lesson-quiz__heading">
        <div>
          <p className="portal-kicker">ASSESSMENT</p>
          <h5>Course quiz</h5>
        </div>
        <span className="admin-quiz-count">{quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}</span>
      </div>
      {loading ? <p>Loading course quizzes…</p> : null}
      {quizzes.map((quiz) => (
        <div className="admin-lesson-quiz__item" key={quiz.id}>
          <span><strong>{quiz.title}</strong><small>Pass mark {quiz.passPercentage}%</small></span>
          {quiz.published ? (
            <span className="admin-status admin-status--approved">Published</span>
          ) : (
            <button
              className="portal-button portal-button--outline"
              type="button"
              onClick={() => publishQuiz(quiz)}
              disabled={!course.published || publishingId === quiz.id}
              title={!course.published ? 'Publish the course first' : undefined}
            >
              {publishingId === quiz.id ? 'Publishing…' : 'Publish quiz'}
            </button>
          )}
        </div>
      ))}
      <form className="admin-lesson-quiz__form" onSubmit={saveQuiz}>
        <div className="admin-quiz-create-heading">
          <h6>Create a quiz</h6>
          <p>Set the pass mark, then add questions and mark one correct answer for each.</p>
        </div>
        <label className="portal-field">
          <span>Quiz title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength="180" />
        </label>
        <label className="portal-field">
          <span>Instructions</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} required maxLength="10000" rows="2" />
        </label>
        <label className="portal-field admin-lesson-quiz__passmark">
          <span>Pass mark (%)</span>
          <input type="number" value={passPercentage} onChange={(event) => setPassPercentage(event.target.value)} min="0" max="100" required />
        </label>
        <div className="admin-quiz-question-list">
        {questions.map((question, questionIndex) => (
          <fieldset className="admin-quiz-question" key={questionIndex}>
            <legend><span>Question {String(questionIndex + 1).padStart(2, '0')}</span><small>Choose one correct answer</small></legend>
            <label className="portal-field">
              <span>Question prompt</span>
              <textarea value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })} required maxLength="4000" rows="2" />
            </label>
            {question.options.map((option, optionIndex) => (
              <div className={`admin-quiz-option${question.correctOption === optionIndex ? ' admin-quiz-option--correct' : ''}`} key={optionIndex}>
                <label className="admin-quiz-option__selector">
                  <input type="radio" name={`correct-${course.id}-${questionIndex}`} checked={question.correctOption === optionIndex} onChange={() => updateQuestion(questionIndex, { correctOption: optionIndex })} aria-label={`Mark answer ${optionIndex + 1} correct for question ${questionIndex + 1}`} />
                  <span>{String.fromCharCode(65 + optionIndex)}</span>
                </label>
                <input value={option} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} required maxLength="2000" aria-label={`Answer ${optionIndex + 1} for question ${questionIndex + 1}`} placeholder={`Answer ${optionIndex + 1}`} />
              </div>
            ))}
            {questions.length > 5 ? (
              <button className="portal-button portal-button--outline admin-quiz-question__remove" type="button" onClick={() => setQuestions((current) => current.filter((_, index) => index !== questionIndex))}>Remove question</button>
            ) : null}
          </fieldset>
        ))}
        </div>
        {questions.length < MAX_QUESTIONS ? (
          <button className="portal-button portal-button--outline admin-quiz-add-question" type="button" onClick={() => setQuestions((current) => [...current, ...createQuestions(1)])}>Add question <span>{questions.length}/{MAX_QUESTIONS}</span></button>
        ) : <p className="admin-quiz-question__hint">Maximum of {MAX_QUESTIONS} questions reached.</p>}
        {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}
        {notice ? <p className="portal-message portal-message--success" role="status">{notice}</p> : null}
        <button className="portal-button portal-button--primary" type="submit" disabled={saving}>
          {saving ? 'Saving quiz…' : `Save ${questions.length}-question quiz`}
        </button>
      </form>
    </section>
  );
}