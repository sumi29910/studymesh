export const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◆' },
  { id: 'tasks', label: 'Tasks', icon: '☰' },
  { id: 'alarms', label: 'Alarms', icon: '⏰' },
  { id: 'flashcards', label: 'Flashcards', icon: '▢' },
  { id: 'quiz', label: 'Quiz', icon: '?' },
  { id: 'focus', label: 'Focus', icon: '◔' },
  { id: 'progress', label: 'Progress', icon: '↗' },
]

export function renderSidebar(active) {
  return `
    <nav class="sidebar" aria-label="Main navigation">
      <div class="sidebar-brand">
        <span class="sidebar-brand-mark"></span>
        <span class="sidebar-brand-text">StudyMesh</span>
      </div>
      ${TABS.map(tab => `
        <button class="sidebar-tab ${active === tab.id ? 'active' : ''}" data-tab="${tab.id}" ${active === tab.id ? 'aria-current="page"' : ''}>
          <span class="sidebar-tab-icon" aria-hidden="true">${tab.icon}</span>
          ${tab.label}
        </button>
      `).join('')}
    </nav>
  `
}
