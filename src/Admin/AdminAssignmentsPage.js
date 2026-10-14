import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createAdminAssignment, getAdminContent } from '../auth/session';

const DEPARTMENT_OPTIONS = ['OPERATING', 'ENGINEERING', 'PERSONNEL'];

export default function AdminAssignmentsPage() {
  const [content, setContent] = useState(getAdminContent);
  const [notice, setNotice] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(DEPARTMENT_OPTIONS[0]);

  const departmentCourses = content.courses.filter((course) => (course.department || '').toUpperCase() === selectedDepartment);

  const submitAssignment = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const courseId = formData.get('courseId');

    if (!courseId || !departmentCourses.some((course) => course.id === courseId)) {
      setNotice('');
      return;
    }

    const updated = createAdminAssignment({
      title: formData.get('title').trim(),
      courseId,
      department: selectedDepartment,
      type: formData.get('type'),
      dueDate: formData.get('dueDate'),
      description: formData.get('description').trim(),
    });

    setContent(updated);
    setNotice('Assignment added to the administrator preview.');
    form.reset();
    setSelectedDepartment(DEPARTMENT_OPTIONS[0]);
  };

  return (
    <section className="admin-page" aria-labelledby="assignments-heading">
      <div className="admin-page-heading">
        <div>
          <p className="portal-kicker">ASSESSMENTS AND TASKS</p>
          <h2 id="assignments-heading">Assignments</h2>
          <p>Assignments here are admin previews. Publish learner quizzes from a course.</p>
          <Link className="portal-button portal-button--outline" to="/admin/courses">Open course quiz builder</Link>
        </div>
        <span className="admin-total-mark">{content.assignments.length} assignments</span>
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">Assignments saved</span>
          <strong className="admin-stat-card__value">{content.assignments.length}</strong>
          <span className="admin-stat-card__meta">This browser session</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__label">Courses</span>
          <strong className="admin-stat-card__value">{content.courses.length}</strong>
          <span className="admin-stat-card__meta">Learning tracks</span>
        </div>
      </div>

      <div className="admin-management-grid">
        <form className="admin-form admin-form--feature" onSubmit={submitAssignment}>
          <h3>Assessment studio</h3>
          <label className="portal-field">
            <span>Department</span>
            <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)}>
              {DEPARTMENT_OPTIONS.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </label>
          <label className="portal-field">
            <span>Assignment title</span>
            <input name="title" required maxLength="100" placeholder="e.g. Safety knowledge check" />
          </label>
          <label className="portal-field">
            <span>Course</span>
            <select name="courseId" required defaultValue={departmentCourses[0]?.id || ''}>
              {departmentCourses.length === 0 ? (
                <option value="" disabled>No courses available for this department</option>
              ) : (
                departmentCourses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))
              )}
            </select>
          </label>
          <div className="portal-form__two-up">
            <label className="portal-field">
              <span>Due date</span>
              <input type="date" name="dueDate" />
            </label>
          </div>
          <label className="portal-field">
            <span>Instructions</span>
            <textarea name="description" required maxLength="500" rows="4" placeholder="Describe the learner task" />
          </label>

          {notice ? <p className="portal-message portal-message--success" role="status">{notice}</p> : null}
          <button className="portal-button portal-button--primary" type="submit" disabled={!departmentCourses.length}>Add assignment</button>
        </form>

        <div className="admin-content-list">
          <h3>Published assignments</h3>
          {content.assignments.map((assignment) => {
            const courseTitle = content.courses.find((course) => course.id === assignment.courseId)?.title || 'Course unavailable';

            return (
              <article className="admin-content-item admin-content-item--assignment" key={assignment.id}>
                <div className="admin-content-item__copy">
                  <p className="portal-kicker">{assignment.type} · {courseTitle}</p>
                  <h4>{assignment.title}</h4>
                  <p>{assignment.description}</p>
                  {assignment.dueDate ? <small>Due {assignment.dueDate}</small> : null}
                </div>
                <div className="admin-content-item__actions">
                  <span className="admin-status admin-status--approved">{assignment.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <p className="portal-prototype-note">
        Assignments saved here are local to this browser session and do not appear in the learner assessment list. To create learner quizzes, open <Link to="/admin/courses">Courses</Link> and use the course quiz builder.
      </p>
    </section>
  );
}