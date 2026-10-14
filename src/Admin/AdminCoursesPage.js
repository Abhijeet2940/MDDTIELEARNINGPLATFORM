import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client';
import CourseQuizBuilder from './CourseQuizBuilder';

let nextCourseLessonDraftId = 0;
const createCourseLessonDraft = () => ({
  id: ++nextCourseLessonDraftId,
  title: '',
  category: '',
  durationMinutes: '',
  description: '',
  youtubeUrl: '',
  files: [],
});

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [newCourseLessons, setNewCourseLessons] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingCourseId, setUpdatingCourseId] = useState('');
  const [unpublishingCourseId, setUnpublishingCourseId] = useState('');
  const [archivingCourseId, setArchivingCourseId] = useState('');
  const [activeLessonCourseId, setActiveLessonCourseId] = useState('');
  const [courseContentMode, setCourseContentMode] = useState('lessons');
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [lessonLoadingCourseId, setLessonLoadingCourseId] = useState('');
  const [lessonSubmittingCourseId, setLessonSubmittingCourseId] = useState('');
  const [lessonActionId, setLessonActionId] = useState('');
  const [courseDocumentUploadId, setCourseDocumentUploadId] = useState('');

  useEffect(() => {
    apiRequest('/api/v1/admin/courses?page=0&size=100')
      .then((page) => setCourses(page.content || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const published = courses.filter((course) => course.published || course.status === 'PUBLISHED').length;
    const draft = courses.length - published;

    return { published, draft };
  }, [courses]);

  const submitCourse = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('file');
    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      let course = await apiRequest('/api/v1/admin/courses', {
        method: 'POST',
        body: {
          title: formData.get('title').trim(),
          category: formData.get('category').trim(),
          department: formData.get('department').trim(),
          description: formData.get('description').trim(),
          youtubeUrl: formData.get('youtubeUrl').trim(),
          lessons: newCourseLessons.map((lesson, order) => ({
            title: lesson.title.trim(),
            category: lesson.category.trim(),
            durationMinutes: Number(lesson.durationMinutes),
            description: lesson.description.trim(),
            youtubeUrl: lesson.youtubeUrl.trim(),
            order,
          })),
        },
      });

      setCourses((current) => [{ ...course, published: false }, ...current]);
      let createdLessons = [];
      if (newCourseLessons.length > 0) {
        try {
          createdLessons = await apiRequest(`/api/v1/admin/courses/${course.id}/lessons`);
          for (let index = 0; index < newCourseLessons.length; index += 1) {
            const lessonFiles = newCourseLessons[index].files;
            if (!lessonFiles.length || !createdLessons[index]) continue;
            const upload = new FormData();
            lessonFiles.forEach((lessonFile) => upload.append('files', lessonFile));
            try {
              createdLessons[index] = await apiRequest(`/api/v1/admin/lessons/${createdLessons[index].id}/documents`, {
                method: 'POST',
                body: upload,
              });
            } catch (uploadError) {
              setError((current) => [current, `Files for lesson ${newCourseLessons[index].title} could not be uploaded: ${uploadError.message}`].filter(Boolean).join(' '));
            }
          }
          setLessonsByCourse((current) => ({ ...current, [course.id]: createdLessons }));
        } catch (requestError) {
          setError(`Course and lessons were saved, but the lesson list could not be loaded: ${requestError.message}`);
        }
      }

      if (file?.size) {
        const upload = new FormData();
        upload.append('file', file);
        try {
          course = await apiRequest(`/api/v1/admin/courses/${course.id}/document`, {
            method: 'POST',
            body: upload,
          });
          setCourses((current) => current.map((item) => item.id === course.id ? course : item));
        } catch (uploadError) {
          setError((current) => [current, `Course file could not be uploaded: ${uploadError.message}`].filter(Boolean).join(' '));
        }
      }

      setNotice(`Course saved as a draft with ${newCourseLessons.length} lesson${newCourseLessons.length === 1 ? '' : 's'}.`);
      form.reset();
      setNewCourseLessons([]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const publishCourse = async (course) => {
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/v1/admin/courses/${course.id}/publish`, { method: 'POST' });
      setCourses((current) => current.map((item) => item.id === course.id ? { ...item, published: true, status: 'PUBLISHED' } : item));
      setNotice(`${course.title} is now published to the learner catalogue.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const unpublishCourse = async (course) => {
    setUnpublishingCourseId(course.id);
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/v1/admin/courses/${course.id}/unpublish`, { method: 'POST' });
      setCourses((current) => current.map((item) => item.id === course.id
        ? { ...item, published: false, status: 'DRAFT' }
        : item));
      setNotice(`${course.title} is unpublished and hidden from the learner catalogue.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUnpublishingCourseId('');
    }
  };

  const deleteCourse = async (course) => {
    if (!window.confirm(`Delete "${course.title}" from the catalogue? Its lessons, assessments, and learner history will be archived.`)) return;
    setArchivingCourseId(course.id);
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/v1/admin/courses/${course.id}/archive`, { method: 'POST' });
      setCourses((current) => current.filter((item) => item.id !== course.id));
      setLessonsByCourse((current) => {
        const next = { ...current };
        delete next[course.id];
        return next;
      });
      if (activeLessonCourseId === course.id) setActiveLessonCourseId('');
      setNotice(`Course "${course.title}" deleted from the active catalogue.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setArchivingCourseId('');
    }
  };

  const uploadCourseDocument = async (event, course) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const upload = new FormData();
    upload.append('file', file);
    setCourseDocumentUploadId(course.id);
    setError('');
    setNotice('');

    try {
      const updatedCourse = await apiRequest(`/api/v1/admin/courses/${course.id}/document`, {
        method: 'POST',
        body: upload,
      });
      setCourses((current) => current.map((item) => item.id === course.id ? updatedCourse : item));
      setNotice(`File attached to ${course.title}. Learners can download it when they open the course.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCourseDocumentUploadId('');
      input.value = '';
    }
  };

  const toggleLessons = async (course) => {
    setCourseContentMode('lessons');
    if (activeLessonCourseId === course.id) {
      setActiveLessonCourseId('');
      return;
    }

    setActiveLessonCourseId(course.id);
    setLessonLoadingCourseId(course.id);
    setError('');
    try {
      const lessons = await apiRequest(`/api/v1/admin/courses/${course.id}/lessons`);
      setLessonsByCourse((current) => ({ ...current, [course.id]: lessons }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLessonLoadingCourseId('');
    }
  };

  const addLesson = async (event, course) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const lessonFiles = formData.getAll('lessonFiles').filter((file) => file.size > 0);
    if (lessonFiles.length > 3) {
      setError('Choose no more than 3 lesson files.');
      return;
    }
    setLessonSubmittingCourseId(course.id);
    setError('');
    setNotice('');

    try {
      let lesson = await apiRequest(`/api/v1/admin/courses/${course.id}/lessons`, {
        method: 'POST',
        body: {
          title: formData.get('title').trim(),
          category: formData.get('category').trim(),
          durationMinutes: Number(formData.get('durationMinutes')),
          description: formData.get('description').trim(),
          youtubeUrl: formData.get('youtubeUrl').trim(),
          order: Number(formData.get('order')),
        },
      });
      if (lessonFiles.length) {
        const upload = new FormData();
        lessonFiles.forEach((file) => upload.append('files', file));
        try {
          lesson = await apiRequest(`/api/v1/admin/lessons/${lesson.id}/documents`, {
            method: 'POST',
            body: upload,
          });
        } catch (uploadError) {
          setLessonsByCourse((current) => ({
            ...current,
            [course.id]: [...(current[course.id] || []), lesson].sort((first, second) => first.order - second.order),
          }));
          throw new Error(`Lesson was created, but its file could not be uploaded: ${uploadError.message}`);
        }
      }
      setLessonsByCourse((current) => ({
        ...current,
        [course.id]: [...(current[course.id] || []), lesson].sort((first, second) => first.order - second.order),
      }));
      setNotice(`Lesson added to ${course.title}.`);
      form.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLessonSubmittingCourseId('');
    }
  };

  const uploadLessonDocument = async (event, lesson, courseId) => {
    const input = event.currentTarget;
    const lessonFiles = Array.from(input.files || []);
    if (!lessonFiles.length) return;
    const attachedCount = lesson.documents?.length || (lesson.documentFileName ? 1 : 0);
    if (attachedCount + lessonFiles.length > 3) {
      setError('A lesson can have no more than 3 files.');
      input.value = '';
      return;
    }
    const upload = new FormData();
    lessonFiles.forEach((file) => upload.append('files', file));
    setLessonActionId(lesson.id);
    setError('');
    setNotice('');

    try {
      const updatedLesson = await apiRequest(`/api/v1/admin/lessons/${lesson.id}/documents`, {
        method: 'POST',
        body: upload,
      });
      setLessonsByCourse((current) => ({
        ...current,
        [courseId]: current[courseId].map((item) => item.id === lesson.id ? updatedLesson : item),
      }));
      setNotice(`File attached to ${lesson.title}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLessonActionId('');
      input.value = '';
    }
  };

  const deleteLesson = async (lesson, courseId) => {
    if (!window.confirm(`Delete "${lesson.title}"? Learner completion history will be retained.`)) return;
    setLessonActionId(lesson.id);
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/v1/admin/lessons/${lesson.id}/archive`, { method: 'POST' });
      setLessonsByCourse((current) => ({
        ...current,
        [courseId]: current[courseId].filter((item) => item.id !== lesson.id),
      }));
      setNotice(`Lesson "${lesson.title}" deleted.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLessonActionId('');
    }
  };

  const publishLesson = async (lesson, courseId) => {
    setError('');
    setNotice('');
    try {
      await apiRequest(`/api/v1/admin/lessons/${lesson.id}/publish`, { method: 'POST' });
      setLessonsByCourse((current) => ({
        ...current,
        [courseId]: current[courseId].map((item) => item.id === lesson.id ? { ...item, published: true } : item),
      }));
      setNotice(`${lesson.title} is now available to learners.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const makeAvailableToAll = async (course) => {
    setError('');
    setNotice('');
    setUpdatingCourseId(course.id);
    try {
      const updatedCourse = await apiRequest(`/api/v1/admin/courses/${course.id}`, {
        method: 'PATCH',
        body: {
          title: course.title,
          category: course.category,
          department: 'General',
          description: course.description,
          youtubeUrl: course.youtubeUrl,
        },
      });
      setCourses((current) => current.map((item) => item.id === course.id ? updatedCourse : item));
      setNotice(`${course.title} is now available to all departments.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingCourseId('');
    }
  };

  return (
    <section className="admin-page" aria-labelledby="courses-heading">
      <div className="admin-page-heading">
        <div>
          <p className="portal-kicker">LEARNING CONTENT</p>
          <h2 id="courses-heading">Courses</h2>
          <p>Build and publish high-quality learning paths for the learner cohort.</p>
        </div>
        <span className="admin-total-mark">{courses.length} courses</span>
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">Catalogue</span>
          <strong className="admin-stat-card__value">{courses.length}</strong>
          <span className="admin-stat-card__meta">Available learning items</span>
        </div>
        <div className="admin-stat-card admin-stat-card--accent">
          <span className="admin-stat-card__label">Published</span>
          <strong className="admin-stat-card__value">{summary.published}</strong>
          <span className="admin-stat-card__meta">Visible to learners</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">Drafts</span>
          <strong className="admin-stat-card__value">{summary.draft}</strong>
          <span className="admin-stat-card__meta">Ready for review</span>
        </div>
      </div>

      <div className="admin-management-grid">
        <form className="admin-form admin-form--feature" onSubmit={submitCourse}>
          <h3>Add a course</h3>
          <label className="portal-field">
            <span>Course title</span>
            <input name="title" required maxLength="180" placeholder="e.g. Railway Operations Foundations" />
          </label>
          <div className="portal-form__two-up">
            <label className="portal-field">
              <span>Category</span>
              <input name="category" required maxLength="120" placeholder="e.g. Operational readiness" />
            </label>
            <label className="portal-field">
              <span>Department</span>
              <select name="department" required defaultValue="">
                <option value="" disabled>Select a department</option>
                <option value="General">GENERAL (all departments)</option>
                <option value="OPERATING">OPERATING</option>
                <option value="ENGINEERING">ENGINEERING</option>
                <option value="PERSONNEL">PERSONNEL</option>
              </select>
            </label>
          </div>
          <label className="portal-field">
            <span>Description</span>
            <textarea name="description" required maxLength="10000" rows="4" placeholder="What will learners study?" />
          </label>
          <label className="portal-field">
            <span>YouTube video URL <small>(optional)</small></span>
            <input name="youtubeUrl" type="url" maxLength="2048" placeholder="https://www.youtube.com/watch?v=..." />
          </label>
          <label className="portal-field">
            <span>Course file <small>(PDF, PPT, PPTX, or XLSX; max 20 MB)</small></span>
            <input name="file" type="file" accept=".pdf,.ppt,.pptx,.xlsx" />
          </label>

          <div className="admin-course-draft-lessons">
            <div className="admin-course-draft-lessons__heading">
              <h4>Lessons</h4>
              <button
                className="portal-button portal-button--outline"
                type="button"
                onClick={() => setNewCourseLessons((current) => [...current, createCourseLessonDraft()])}
                disabled={newCourseLessons.length >= 100 || submitting}
              >
                Add lesson
              </button>
            </div>
            {newCourseLessons.map((lesson, index) => (
              <fieldset className="admin-course-draft-lesson" key={lesson.id}>
                <legend>Lesson {index + 1}</legend>
                <button
                  className="portal-button portal-button--outline"
                  type="button"
                  onClick={() => setNewCourseLessons((current) => current.filter((item) => item.id !== lesson.id))}
                  disabled={submitting}
                >
                  Remove lesson
                </button>
                <label className="portal-field">
                  <span>Lesson title</span>
                  <input required maxLength="180" value={lesson.title} onChange={(event) => setNewCourseLessons((current) => current.map((item) => item.id === lesson.id ? { ...item, title: event.target.value } : item))} />
                </label>
                <div className="portal-form__two-up">
                  <label className="portal-field">
                    <span>Category</span>
                    <input required maxLength="120" value={lesson.category} onChange={(event) => setNewCourseLessons((current) => current.map((item) => item.id === lesson.id ? { ...item, category: event.target.value } : item))} />
                  </label>
                  <label className="portal-field">
                    <span>Duration (minutes)</span>
                    <input type="number" required min="1" value={lesson.durationMinutes} onChange={(event) => setNewCourseLessons((current) => current.map((item) => item.id === lesson.id ? { ...item, durationMinutes: event.target.value } : item))} />
                  </label>
                </div>
                <label className="portal-field">
                  <span>Description</span>
                  <textarea required maxLength="10000" rows="3" value={lesson.description} onChange={(event) => setNewCourseLessons((current) => current.map((item) => item.id === lesson.id ? { ...item, description: event.target.value } : item))} />
                </label>
                <label className="portal-field">
                  <span>YouTube video URL <small>(optional)</small></span>
                  <input type="url" maxLength="2048" placeholder="https://www.youtube.com/watch?v=..." value={lesson.youtubeUrl} onChange={(event) => setNewCourseLessons((current) => current.map((item) => item.id === lesson.id ? { ...item, youtubeUrl: event.target.value } : item))} />
                </label>
                <label className="portal-field">
                  <span>Lesson files <small>(up to 3; PDF, PPT, PPTX, or XLSX)</small></span>
                  <input type="file" multiple accept=".pdf,.ppt,.pptx,.xlsx" onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    if (files.length > 3) {
                      setError('Choose no more than 3 lesson files.');
                      event.target.value = '';
                      return;
                    }
                    setNewCourseLessons((current) => current.map((item) => item.id === lesson.id ? { ...item, files } : item));
                  }} />
                </label>
              </fieldset>
            ))}
          </div>

          {notice ? <p className="portal-message portal-message--success" role="status">{notice}</p> : null}
          {error ? <p className="portal-message portal-message--error" role="alert">{error}</p> : null}

          <button className="portal-button portal-button--primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save course draft'}
          </button>
        </form>

        <div className="admin-content-list">
          <h3>Course catalogue</h3>
          {loading ? <p>Loading courses…</p> : null}
          {!loading && courses.length === 0 ? <p>No courses have been created.</p> : null}
          {courses.map((course) => (
            <article className="admin-content-item admin-content-item--course" key={course.id}>
              <div className="admin-content-item__copy">
                <p className="portal-kicker">{course.category} · {course.department}</p>
                <h4>{course.title}</h4>
                <p>{course.description}</p>
              </div>
              <div className="admin-content-item__actions admin-course-card-actions">
                <button className="portal-button portal-button--outline" type="button" onClick={() => toggleLessons(course)}>
                  {activeLessonCourseId === course.id ? 'Hide course content' : 'Manage course content'}
                </button>
                {course.published || course.status === 'PUBLISHED' ? (
                  <button className="portal-button admin-course-published-button" type="button" disabled>Published course</button>
                ) : (
                  <button className="portal-button portal-button--primary" type="button" onClick={() => publishCourse(course)}>Publish course</button>
                )}
                <button className="portal-button portal-button--outline admin-course-delete-button" type="button" onClick={() => deleteCourse(course)} disabled={archivingCourseId === course.id}>
                  {archivingCourseId === course.id ? 'Deleting…' : 'Delete course'}
                </button>
              </div>
              {activeLessonCourseId === course.id ? (
                <div className="admin-course-lessons">
                  <div className="admin-course-content-toolbar" aria-label={`Manage content for ${course.title}`}>
                    <button className={`portal-button ${courseContentMode === 'lessons' ? 'portal-button--primary' : 'portal-button--outline'}`} type="button" onClick={() => setCourseContentMode('lessons')}>Manage lessons</button>
                    <button className={`portal-button ${courseContentMode === 'quiz' ? 'portal-button--primary' : 'portal-button--outline'}`} type="button" onClick={() => setCourseContentMode('quiz')}>Add quiz</button>
                    <label className="portal-button portal-button--outline admin-course-file-button">
                      {courseDocumentUploadId === course.id ? 'Uploading file…' : course.documentFileName ? 'Replace course file' : 'Attach course file'}
                      <input type="file" accept=".pdf,.ppt,.pptx,.xlsx" aria-label={`Attach course file to ${course.title}`} disabled={courseDocumentUploadId === course.id} onChange={(event) => uploadCourseDocument(event, course)} />
                    </label>
                  </div>
                  {course.documentFileName ? <p className="admin-course-document-name">Attached file: {course.documentFileName}</p> : null}
                  {courseContentMode === 'quiz' ? <CourseQuizBuilder course={course} /> : (
                  <>
                  <div className="admin-course-lessons__heading">
                    <div>
                      <p className="portal-kicker">COURSE CONTENT</p>
                      <h5>Lessons</h5>
                    </div>
                    <span>{(lessonsByCourse[course.id] || []).length} total</span>
                  </div>
                  {course.published || course.status === 'PUBLISHED' ? (
                    <div className="admin-course-settings-actions">
                      <button className="portal-button portal-button--outline" type="button" onClick={() => unpublishCourse(course)} disabled={unpublishingCourseId === course.id}>
                        {unpublishingCourseId === course.id ? 'Unpublishing…' : 'Unpublish course'}
                      </button>
                      {course.department?.toLowerCase() !== 'general' ? (
                        <button className="portal-button portal-button--outline" type="button" onClick={() => makeAvailableToAll(course)} disabled={updatingCourseId === course.id}>
                          {updatingCourseId === course.id ? 'Updating…' : 'Show to all departments'}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {lessonLoadingCourseId === course.id ? <p>Loading lessons…</p> : null}
                  {!lessonLoadingCourseId && (lessonsByCourse[course.id] || []).length === 0 ? <p>No lessons added yet.</p> : null}
                  {(lessonsByCourse[course.id] || []).map((lesson) => (
                    <div className="admin-course-lesson-group" key={lesson.id}>
                      <div className="admin-course-lesson-row">
                        <span><strong>{lesson.order + 1}. {lesson.title}</strong><small>{lesson.category} · {lesson.durationMinutes} min</small></span>
                        <span className="admin-course-lesson-actions">
                          {lesson.documents?.length ? <small>Files: {lesson.documents.map((document) => document.fileName).join(', ')}</small> : lesson.documentFileName ? <small>File: {lesson.documentFileName}</small> : null}
                          {lesson.published ? (
                            <span className="admin-status admin-status--approved">Published</span>
                          ) : course.published || course.status === 'PUBLISHED' ? (
                            <button className="portal-button portal-button--outline" type="button" onClick={() => publishLesson(lesson, course.id)}>
                              Publish lesson
                            </button>
                          ) : (
                            <span className="admin-status">Draft</span>
                          )}
                          {!lesson.published ? (
                            <label className="portal-button portal-button--outline admin-course-file-button">
                              {lessonActionId === lesson.id ? 'Uploading…' : `Add files (${lesson.documents?.length || (lesson.documentFileName ? 1 : 0)}/3)`}
                              <input type="file" multiple accept=".pdf,.ppt,.pptx,.xlsx" aria-label={`Attach files to ${lesson.title}`} disabled={lessonActionId === lesson.id || (lesson.documents?.length || (lesson.documentFileName ? 1 : 0)) >= 3} onChange={(event) => uploadLessonDocument(event, lesson, course.id)} />
                            </label>
                          ) : null}
                          <button className="portal-button portal-button--outline admin-course-delete-button" type="button" onClick={() => deleteLesson(lesson, course.id)} disabled={lessonActionId === lesson.id}>
                            Delete
                          </button>
                        </span>
                      </div>
                    </div>
                  ))}
                  {lessonLoadingCourseId !== course.id ? (
                  <form className="admin-course-lesson-form" key={`${course.id}-${(lessonsByCourse[course.id] || []).length}`} onSubmit={(event) => addLesson(event, course)}>
                    <div className="admin-course-lesson-form__heading">
                      <h6>Add a lesson</h6>
                      <p>Provide the lesson details and optionally attach a course file.</p>
                    </div>
                    <label className="portal-field">
                      <span>Lesson title</span>
                      <input name="title" required maxLength="180" />
                    </label>
                    <div className="portal-form__two-up admin-course-lesson-form__details">
                      <label className="portal-field">
                        <span>Category</span>
                        <input name="category" required maxLength="120" />
                      </label>
                      <label className="portal-field">
                        <span>Duration (minutes)</span>
                        <input name="durationMinutes" type="number" required min="1" />
                      </label>
                    </div>
                    <label className="portal-field">
                      <span>Description</span>
                      <textarea name="description" required maxLength="10000" rows="3" />
                    </label>
                    <label className="portal-field">
                      <span>YouTube video URL <small>(optional)</small></span>
                      <input name="youtubeUrl" type="url" maxLength="2048" placeholder="https://www.youtube.com/watch?v=..." />
                    </label>
                    <label className="portal-field">
                      <span>Lesson order</span>
                      <input name="order" type="number" required min="0" defaultValue={Math.max(-1, ...(lessonsByCourse[course.id] || []).map((lesson) => lesson.order)) + 1} />
                    </label>
                    <label className="portal-field">
                      <span>Lesson files <small>(up to 3; PDF, PPT, PPTX, or XLSX; max 20 MB each)</small></span>
                      <input name="lessonFiles" type="file" multiple accept=".pdf,.ppt,.pptx,.xlsx" />
                    </label>
                    <button className="portal-button portal-button--primary" type="submit" disabled={lessonSubmittingCourseId === course.id}>
                      {lessonSubmittingCourseId === course.id ? 'Adding…' : 'Add lesson'}
                    </button>
                  </form>
                  ) : null}
                  </>
                  )}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}