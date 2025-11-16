import "./styles/app.css";
import "./components/side-nav.js";
import "./sidebar.js";
document.body.dataset.active = 'proyectos';

const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '192.168.0.200')
  ? 'http://192.168.0.200/JBProject/api/'
  : '/api/';

function getProjectId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchProject(id) {
  try {
    const res = await fetch(API_BASE + 'projects.php');
    if (!res.ok) throw new Error('Error al cargar proyectos');
    const projects = await res.json();
    return projects.find(p => String(p.id) === String(id));
  } catch (e) {
    console.error('No se pudo cargar el proyecto', e);
    return null;
  }
}


async function renderTab(tab, project) {
  const content = document.getElementById('tab-content');
  if (!content) return;
  if (!project) {
    content.innerHTML = '<div class="text-red-600">Proyecto no encontrado.</div>';
    return;
  }
  if (tab === 'resumen') {
    content.innerHTML = `
      <div class="mb-4">
        <span class="text-xs text-zinc-500">Código:</span>
        <span class="font-mono text-sm">${project.project_code}</span>
      </div>
      <h3 class="text-2xl font-semibold mb-2">${project.name}</h3>
      <div class="mb-2"><span class="font-medium">Cliente:</span> ${project.client_name || ''}</div>
      <div class="mb-2"><span class="font-medium">Estado:</span> ${project.status}</div>
      <div class="mb-2"><span class="font-medium">Inicio:</span> ${project.start_date ? new Date(project.start_date).toLocaleDateString('es-MX') : ''}</div>
      <div class="mb-2"><span class="font-medium">Presupuesto:</span> ${Number(project.budget).toLocaleString('es-MX', { style: 'currency', currency: 'USD' })}</div>
      <div class="mb-2"><span class="font-medium">Moneda:</span> ${project.currency}</div>
    `;
  } else if (tab === 'actividades') {
    content.innerHTML = '<div class="text-zinc-700">Cargando actividades...</div>';
    try {
      const res = await fetch(`${API_BASE}actividades.php?project_id=${encodeURIComponent(project.id)}`);
      const items = await res.json();
      if (!items.length) {
        content.innerHTML = '<div class="text-zinc-500">No hay actividades registradas para este proyecto.</div>';
        return;
      }
      content.innerHTML = `
        <table class="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr class="text-left text-zinc-700">
              <th class="px-3 py-2">Actividad</th>
              <th class="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => `
              <tr class="hover:bg-zinc-50 transition">
                <td class="px-3 py-2 align-top">${it.nombre}</td>
                <td class="px-3 py-2 align-top text-center">
                  <button class="text-xs rounded bg-brand-600 text-white px-2 py-1 hover:bg-brand-700" data-action="ver-actividad" data-id="${it.id}">Ver</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      // Delegación para botón "Ver"
      content.querySelector('tbody').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action="ver-actividad"]');
        if (btn) {
          const actividadId = btn.getAttribute('data-id');
          // Navegar a presupuesto.html pasando id de proyecto y actividad
          window.location.href = `presupuestos.html?actividad_id=${encodeURIComponent(actividadId)}`;

        }
      });
    } catch (e) {
      content.innerHTML = '<div class="text-red-600">No se pudo cargar las actividades.</div>';
    }
  } else if (tab === 'presupuesto') {
    content.innerHTML = '<div class="text-zinc-700">Cargando presupuesto...</div>';
    try {
      const res = await fetch(`${API_BASE}presupuesto.php?project_id=${encodeURIComponent(project.id)}`);
      const items = await res.json();
      content.innerHTML = `
        <table class="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr class="text-left text-zinc-700">
              <th class="px-3 py-2">Actividad</th>
              <th class="px-3 py-2 text-right">Monto</th>
              <th class="px-3 py-2 text-right">Ejecutado</th>
              <th class="px-3 py-2 text-right">Avance</th>
              <th class="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => `
              <tr class="hover:bg-zinc-50 transition">
                <td class="px-3 py-2 align-top">${it.nombre}</td>
                <td class="px-3 py-2 align-top text-right">${Number(it.monto).toLocaleString('es-MX', { style: 'currency', currency: 'USD' })}</td>
                <td class="px-3 py-2 align-top text-right">${it.ejecutado !== undefined ? Number(it.ejecutado).toLocaleString('es-MX', { style: 'currency', currency: 'USD' }) : '-'}</td>
                <td class="px-3 py-2 align-top text-right">${it.avance !== undefined ? it.avance + '%' : '-'}</td>
                <td class="px-3 py-2 align-top text-center">
                  <button class="text-xs rounded bg-brand-600 text-white px-2 py-1 hover:bg-brand-700" data-action="ver-actividad" data-id="${it.id}">Ver</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      // Agregar event delegation para el botón "Ver"
      content.querySelector('tbody').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action="ver-actividad"]');
        if (btn) {
          const actividadId = btn.getAttribute('data-id');
          // Navegar a presupuestos.html pasando id de actividad
          alert("Navegando a presupuestos.html");
          window.location.href = `presupuestos.html?actividad_id=${encodeURIComponent(actividadId)}`;
        }
      });
    } catch (e) {
      content.innerHTML = '<div class="text-red-600">No se pudo cargar el presupuesto.</div>';
    }
  } else if (tab === 'avances') {
    content.innerHTML = `<div class="text-zinc-700">(Aquí irán los avances del proyecto)</div>`;
  }
}

function setupTabs(project) {
  const tabs = document.querySelectorAll('.tab-btn');
  let active = 'resumen';
  async function activate(tab) {
    tabs.forEach(btn => {
      if (btn.dataset.tab === tab) {
        btn.classList.add('bg-white', 'border-b-2', 'border-brand-600');
      } else {
        btn.classList.remove('bg-white', 'border-b-2', 'border-brand-600');
      }
    });
    await renderTab(tab, project);
    active = tab;
  }
  tabs.forEach(btn => {
    btn.addEventListener('click', () => activate(btn.dataset.tab));
  });
  activate(active);
}


const id = getProjectId();
if (id) {
  fetchProject(id).then(project => {
    // Mostrar el nombre del proyecto en el h2 principal
    const h2 = document.querySelector('main h2');
    if (h2 && project && project.name) {
      h2.textContent = project.name;
    }
    setupTabs(project);
  });
} else {
  renderTab('resumen', null);
}
