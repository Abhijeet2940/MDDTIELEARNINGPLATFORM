const SESSION_KEY = 'mddti-demo-session';
const PORTAL_DATA_KEY = 'mddti-portal-data';
const ACCESS_REQUESTS_KEY = 'mddti-access-requests';
const LEARNERS_KEY = 'mddti-learners';
const ADMIN_CONTENT_KEY = 'mddti-admin-content';
const ACTIVITY_TOTAL = 4;

export const DEPARTMENT_OPTIONS = ['OPERATING', 'ENGINEERING', 'PERSONNEL'];

export function normalizeDepartment(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'OPERATIONS') return 'OPERATING';
  if (normalized === 'COMMERCIAL') return 'PERSONNEL';
  if (normalized === 'SIGNALS') return 'ENGINEERING';
  return DEPARTMENT_OPTIONS.includes(normalized) ? normalized : 'OPERATING';
}

const DEFAULT_LEARNERS = [
  { name: 'MDDTI Trainee', email: 'trainee@mddti.test', employeeId: 'DEMO-001', department: 'OPERATING', designation: 'Trainee', role: 'LEARNER' },
  { name: 'Ravi Kumar', email: 'ravi.kumar@mddti.test', employeeId: 'DEMO-002', department: 'ENGINEERING', designation: 'Trainee', role: 'LEARNER' },
  { name: 'Priya Nair', email: 'priya.nair@mddti.test', employeeId: 'DEMO-003', department: 'PERSONNEL', designation: 'Trainee', role: 'LEARNER' },
];

const DEFAULT_PORTAL_DATA = {
  'trainee@mddti.test': {
    profile: { name: 'MDDTI Trainee', email: 'trainee@mddti.test', employeeId: 'DEMO-001', department: 'OPERATING', designation: 'Trainee', batch: '2026-A', phone: '' },
    completedLessons: [],
    assessment: null,
  },
  'ravi.kumar@mddti.test': {
    profile: { name: 'Ravi Kumar', email: 'ravi.kumar@mddti.test', employeeId: 'DEMO-002', department: 'ENGINEERING', designation: 'Trainee', batch: '2026-A', phone: '' },
    completedLessons: ['safety', 'communication'],
    assessment: { score: 2, total: 3 },
  },
  'priya.nair@mddti.test': {
    profile: { name: 'Priya Nair', email: 'priya.nair@mddti.test', employeeId: 'DEMO-003', department: 'PERSONNEL', designation: 'Trainee', batch: '2026-A', phone: '' },
    completedLessons: ['safety'],
    assessment: { score: 1, total: 3 },
  },
};

const DEFAULT_ADMIN_CONTENT = {
  courses: [
    { id: 'course-operations-foundations', title: 'Railway Operations Foundations', category: 'Operational readiness', description: 'Core safety and communication practices for railway operations.', status: 'PUBLISHED', createdAt: '2026-10-01T00:00:00.000Z' },
  ],
  assignments: [
    { id: 'assignment-safety-knowledge-check', courseId: 'course-operations-foundations', title: 'Safety and service knowledge check', type: 'QUIZ', dueDate: '', description: 'Review core safety and passenger-service practices.', status: 'PUBLISHED', createdAt: '2026-10-01T00:00:00.000Z' },
  ],
};

export const DEMO_CREDENTIALS = {
  email: 'trainee@mddti.test',
  password: 'Training123!',
};

export const DEMO_ADMIN_CREDENTIALS = {
  email: 'admin@mddti.test',
  password: 'AdminTraining123!',
};

function readStoredValue(key, fallback) {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function getSession() {
  return readStoredValue(SESSION_KEY, null);
}

export function getDemoAccount(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    return { name: 'MDDTI Trainee', email: DEMO_CREDENTIALS.email, employeeId: 'DEMO-001', role: 'LEARNER' };
  }

  if (normalizedEmail === DEMO_ADMIN_CREDENTIALS.email && password === DEMO_ADMIN_CREDENTIALS.password) {
    return { name: 'Portal Administrator', email: DEMO_ADMIN_CREDENTIALS.email, employeeId: 'ADMIN-001', role: 'ADMIN' };
  }

  return null;
}

export function getHomePath(user = getSession()) {
  return user?.role === 'ADMIN' ? '/admin/requests' : '/app';
}

export function startSession(user) {
  const sessionUser = {
    name: user.name || 'MDDTI Trainee',
    email: user.email,
    employeeId: user.employeeId || '',
    role: user.role || 'LEARNER',
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  const email = sessionUser.email.trim().toLowerCase();
  const allPortalData = readStoredValue(PORTAL_DATA_KEY, DEFAULT_PORTAL_DATA);
  const currentData = allPortalData[email] || {
    profile: {
      ...sessionUser,
      department: user.department || '',
      designation: user.designation || '',
      batch: user.batch || '',
      phone: user.phone || '',
    },
    completedLessons: [],
    assessment: null,
  };
  sessionStorage.setItem(PORTAL_DATA_KEY, JSON.stringify({
    ...allPortalData,
    [email]: {
      ...currentData,
      profile: { ...currentData.profile, ...sessionUser },
    },
  }));

  if (sessionUser.role === 'LEARNER') saveLearner({ ...sessionUser, ...currentData.profile });

  return sessionUser;
}

export function hasDemoCredentials(email, password) {
  return Boolean(getDemoAccount(email, password));
}

export function getAccessRequests() {
  return readStoredValue(ACCESS_REQUESTS_KEY, []);
}

export function createAccessRequest(details) {
  const requests = getAccessRequests();
  const normalizedEmail = details.email.trim().toLowerCase();
  const duplicate = requests.some((request) => request.email === normalizedEmail && request.status === 'PENDING');

  if (duplicate) return { error: 'A pending access request already exists for this email address.' };

  const request = {
    ...details,
    email: normalizedEmail,
    id: `request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
  };
  sessionStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify([request, ...requests]));
  return { request };
}

export function updateAccessRequestStatus(requestId, status) {
  if (!['APPROVED', 'REJECTED'].includes(status)) return getAccessRequests();

  const requests = getAccessRequests().map((request) => (
    request.id === requestId && request.status === 'PENDING'
      ? { ...request, status, reviewedAt: new Date().toISOString() }
      : request
  ));
  sessionStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify(requests));

  if (status === 'APPROVED') {
    const approvedRequest = requests.find((request) => request.id === requestId && request.status === 'APPROVED');
    if (approvedRequest) {
      saveLearner({
        name: approvedRequest.name,
        email: approvedRequest.email,
        employeeId: approvedRequest.employeeId,
        department: approvedRequest.department,
        designation: approvedRequest.designation,
        batch: approvedRequest.batch,
        phone: approvedRequest.phone,
        role: 'LEARNER',
      });
    }
  }

  return requests;
}

function saveLearner(learner) {
  const learners = getAdminLearnerRecords();
  const normalizedEmail = learner.email.trim().toLowerCase();
  const learnerRecord = { ...learner, email: normalizedEmail, role: 'LEARNER' };
  const existingIndex = learners.findIndex((item) => item.email === normalizedEmail);

  if (existingIndex >= 0) learners[existingIndex] = { ...learners[existingIndex], ...learnerRecord };
  else learners.unshift(learnerRecord);

  sessionStorage.setItem(LEARNERS_KEY, JSON.stringify(learners));
}

function getAdminLearnerRecords() {
  return readStoredValue(LEARNERS_KEY, DEFAULT_LEARNERS);
}

export function getAdminLearners() {
  const portalData = readStoredValue(PORTAL_DATA_KEY, DEFAULT_PORTAL_DATA);

  return getAdminLearnerRecords().map((learner) => {
    const learnerData = portalData[learner.email] || {
      profile: learner,
      completedLessons: [],
      assessment: null,
    };
    const completedLessons = learnerData.completedLessons || [];
    const activityCount = completedLessons.length + (learnerData.assessment ? 1 : 0);

    return {
      ...learner,
      ...learnerData.profile,
      completedLessons,
      assessment: learnerData.assessment,
      progress: Math.round((activityCount / ACTIVITY_TOTAL) * 100),
    };
  });
}

export function getAdminContent() {
  return readStoredValue(ADMIN_CONTENT_KEY, DEFAULT_ADMIN_CONTENT);
}

export function createAdminCourse(course) {
  const content = getAdminContent();
  const createdCourse = {
    ...course,
    id: `course-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
  };
  const next = { ...content, courses: [createdCourse, ...content.courses] };
  sessionStorage.setItem(ADMIN_CONTENT_KEY, JSON.stringify(next));
  return next;
}

export function createAdminAssignment(assignment) {
  const content = getAdminContent();
  const createdAssignment = {
    ...assignment,
    id: `assignment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
  };
  const next = { ...content, assignments: [createdAssignment, ...content.assignments] };
  sessionStorage.setItem(ADMIN_CONTENT_KEY, JSON.stringify(next));
  return next;
}

export function getPortalData() {
  const user = getSession();
  const email = user?.email?.trim().toLowerCase();
  const allPortalData = readStoredValue(PORTAL_DATA_KEY, DEFAULT_PORTAL_DATA);
  const fallback = {
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      employeeId: user?.employeeId || '',
      department: '',
      designation: '',
      batch: '',
      phone: '',
    },
    completedLessons: [],
    assessment: null,
  };

  return allPortalData[email] || fallback;
}

export function updatePortalData(updates) {
  const current = getPortalData();
  const next = {
    ...current,
    ...updates,
    profile: { ...current.profile, ...(updates.profile || {}) },
  };

  const email = getSession()?.email?.trim().toLowerCase();
  if (email) {
    const allPortalData = readStoredValue(PORTAL_DATA_KEY, DEFAULT_PORTAL_DATA);
    sessionStorage.setItem(PORTAL_DATA_KEY, JSON.stringify({ ...allPortalData, [email]: next }));
  }
  const user = getSession();
  if (user && updates.profile) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      ...user,
      name: next.profile.name || user.name,
      employeeId: next.profile.employeeId || user.employeeId,
    }));
  }
  return next;
}

export function endSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(PORTAL_DATA_KEY);
}