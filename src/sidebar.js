// Script para manejar botón hamburguesa
export function initSidebarToggle() {
  document.body.dataset.sidebarOpen = window.innerWidth >= 768 ? 'true' : 'false';
  const toggleButtons = document.querySelectorAll('[data-sidebar-toggle]');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('sidebar:toggle'));
    });
  });
}

if (document.readyState !== 'loading') {
  initSidebarToggle();
} else {
  document.addEventListener('DOMContentLoaded', initSidebarToggle);
}
