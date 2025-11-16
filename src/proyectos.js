import "./styles/app.css";
import "./components/side-nav.js";
import "./sidebar.js";
document.body.dataset.active = 'proyectos';

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

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-MX');
}

function formatMoney(num) {
  return Number(num).toLocaleString('es-MX', { style: 'currency', currency: 'USD' });
}

function renderProjects(projects) {
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;
  tbody.innerHTML = projects.map(p => `
    <tr class="hover:bg-zinc-50 transition">
      <td class="px-3 py-2 align-top">${p.project_code}</td>
      <td class="px-3 py-2 align-top font-medium">${p.name}</td>
      <td class="px-3 py-2 align-top">${p.client_name || ''}</td>
      <td class="px-3 py-2 align-top">${p.status}</td>
      <td class="px-3 py-2 align-top">${formatDate(p.start_date)}</td>
      <td class="px-3 py-2 align-top text-right">${formatMoney(p.budget)}</td>
      <td class="px-3 py-2 align-top text-center flex gap-2 justify-center">
        <button class="text-xs rounded bg-brand-600 text-white px-2 py-1 hover:bg-brand-700" data-action="view" data-id="${p.id}">Ver</button>
        <button class="text-xs rounded bg-brand-500 text-white px-2 py-1 hover:bg-brand-700">Editar</button>
        <button class="text-xs rounded bg-red-600 text-white px-2 py-1 hover:bg-red-700">Eliminar</button>
      </td>
    </tr>
  `).join('');
// Delegar click para botón Ver
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="view"]');
  if (btn) {
    const id = btn.getAttribute('data-id');
    if (id) {
      window.location.href = `project.html?id=${encodeURIComponent(id)}`;
    }
  }
});
}

fetchProjects().then(renderProjects);
