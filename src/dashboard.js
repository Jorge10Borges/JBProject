// dashboard.js: carga proyectos y muestra selector en el dashboard


// Detectar entorno y definir base de la API
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '192.168.0.200')
  ? 'http://192.168.0.200/JBProject/api/'
  : '/api/';

async function fetchProjects() {
  try {
    const res = await fetch(API_BASE + 'projects.php');
    if (!res.ok) throw new Error('Error al cargar proyectos');
    return await res.json();
  } catch (e) {
    console.error('No se pudieron cargar los proyectos', e);
    return [];
  }
}

function renderProjectSelector(projects) {
  const container = document.getElementById('project-selector-container');
  if (!container) return;
  container.innerHTML = `
    <label for="project-selector" class="block text-sm font-medium text-zinc-200 mb-1">Proyecto</label>
    <select id="project-selector" class="w-full max-w-xs rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
      <option value="all">Todos</option>
      ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
    </select>
  `;
}

// Inicialización
fetchProjects().then(renderProjectSelector);
