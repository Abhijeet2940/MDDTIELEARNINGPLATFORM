export const menuItems = [
  { label: 'Set your profile', to: '/app/profile-setup', number: '01' },
  { label: 'Learning Module', to: '/app/learning', number: '02' },
  { label: 'Assessment Module', to: '/app/assessment', number: '03' },
  { label: 'Progress Tracking', to: '/app/progress', number: '04' },
  { label: 'Your Profile', to: '/app/profile', number: '05' },
];

export const lessons = [
  { id: 'safety', title: 'Safety starts with awareness', category: 'Operational readiness', duration: '12 min', description: 'Review the everyday habits that support safe, reliable railway operations.' },
  { id: 'communication', title: 'Clear communication on duty', category: 'Professional practice', duration: '16 min', description: 'Use concise handovers and confirmation to keep teams aligned.' },
  { id: 'service', title: 'Passenger-first service', category: 'Service excellence', duration: '10 min', description: 'Explore practical ways to support passengers with confidence and care.' },
];

export const questions = [
  { prompt: 'What is the best first step when a safety concern is noticed?', options: ['Ignore it until the next shift', 'Report it through the correct channel', 'Ask an unrelated team to handle it'], answer: 1 },
  { prompt: 'A clear duty handover should be:', options: ['Brief, specific, and confirmed', 'Only verbal if time allows', 'Focused on personal opinions'], answer: 0 },
  { prompt: 'Good passenger service includes:', options: ['Giving directions without checking', 'Listening and offering clear help', 'Avoiding questions during busy periods'], answer: 1 },
];