// --- NUEVO PRESUPUESTO ---
const newPresupuestoBtn = document.getElementById("new-presupuesto-btn");
const newPresupuestoModal = document.getElementById("new-presupuesto-modal");
const newPresupuestoForm = document.getElementById("new-presupuesto-form");
const newPresupuestoNombre = document.getElementById("new-presupuesto-nombre");
const newPresupuestoCancel = document.getElementById("new-presupuesto-cancel");
const projectId = getQueryParam('project_id');

if (newPresupuestoBtn && newPresupuestoModal && newPresupuestoForm && newPresupuestoNombre && newPresupuestoCancel) {
  newPresupuestoBtn.addEventListener("click", () => {
    newPresupuestoModal.classList.remove("hidden");
    newPresupuestoModal.classList.add("flex");
    setTimeout(() => newPresupuestoNombre.focus(), 0);
  });
  newPresupuestoCancel.addEventListener("click", () => {
    newPresupuestoModal.classList.add("hidden");
    newPresupuestoModal.classList.remove("flex");
    newPresupuestoForm.reset();
  });
  newPresupuestoModal.addEventListener("click", (e) => {
    if (e.target === newPresupuestoModal) {
      newPresupuestoModal.classList.add("hidden");
      newPresupuestoModal.classList.remove("flex");
      newPresupuestoForm.reset();
    }
  });
  newPresupuestoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = newPresupuestoNombre.value.trim();
    if (!nombre) return;
    if (!actividadId) {
      showToast("No hay actividad seleccionada", "error");
      return;
    }
    try {
      const apiBase = config.apiBaseUrl || "/api/";
      const url = apiBase.replace(/\/$/, "") + "/presupuesto_create.php";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, actividad_id: Number(actividadId) }),
      });
      if (!res.ok) throw new Error("Error creando presupuesto");
      const data = await res.json();
      if (!data.success || !data.presupuesto) throw new Error("Respuesta inválida del servidor");
      showToast("Presupuesto creado", "success");
      // Redirigir a la página del nuevo presupuesto
      window.location.href = `presupuesto.html?id=${data.presupuesto.id}&actividad_id=${actividadId}&project_id=${projectId}`;
    } catch (err) {
      console.error(err);
      showToast("No se pudo crear el presupuesto", "error");
    }
  });
}
// --- FIN NUEVO PRESUPUESTO ---
import "./styles/app.css";
import "./components/side-nav.js";
import "./sidebar.js";
document.body.dataset.active = 'presupuesto';
import { config } from "./config.js";

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const actividadId = getQueryParam('actividad_id');
const tbody = document.getElementById("presupuestos-tbody");
const actividadTitle = document.getElementById("actividad-title");
const backBtn = document.getElementById("back-btn");
const toastContainer = document.getElementById('toast-container');

function showToast(message, type = 'success') {
  if (!toastContainer) return;
  const base = 'pointer-events-auto min-w-[220px] max-w-sm px-3 py-2 rounded shadow-md text-sm transition opacity-0';
  const palette = type === 'error'
    ? 'bg-red-600 text-white'
    : type === 'info'
    ? 'bg-zinc-800 text-white'
    : 'bg-green-600 text-white';
  const el = document.createElement('div');
  el.className = `${base} ${palette}`;
  el.textContent = message;
  toastContainer.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.add('opacity-100');
  });
  setTimeout(() => {
    el.classList.remove('opacity-100');
    el.classList.add('opacity-0');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

async function loadActividadNombre() {
  const actividadNombreH2 = document.getElementById('actividad-nombre');
  if (!actividadId) return;
  try {
    const res = await fetch((config.apiBaseUrl || '/api/') + `actividad_info.php?id=${encodeURIComponent(actividadId)}`);
    if (res.ok) {
      const actividad = await res.json();
      if (actividad && actividad.nombre) {
        if (actividadTitle) actividadTitle.textContent = `Presupuestos de la Actividad`;
        if (actividadNombreH2) actividadNombreH2.textContent = actividad.nombre;
      }
    }
  } catch {}
}

async function loadPresupuestos() {
  if (!actividadId) return;
  try {
    const res = await fetch((config.apiBaseUrl || '/api/') + `presupuestos_by_actividad.php?actividad_id=${encodeURIComponent(actividadId)}`);
    if (!res.ok) throw new Error('No se pudo cargar los presupuestos');
    const presupuestos = await res.json();
    tbody.innerHTML = '';
    if (!presupuestos.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-zinc-500 py-4">No hay presupuestos para esta actividad.</td></tr>';
      return;
    }
    presupuestos.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-3 py-2 align-top font-medium">${p.nombre}</td>
        <td class="px-3 py-2 text-right align-top">${Number(p.monto).toLocaleString('es-MX', { style: 'currency', currency: 'USD' })}</td>
        <td class="px-3 py-2 text-right align-top">${p.ejecutado !== undefined ? Number(p.ejecutado).toLocaleString('es-MX', { style: 'currency', currency: 'USD' }) : '-'}</td>
        <td class="px-3 py-2 text-right align-top">${p.avance !== undefined ? p.avance + '%' : '-'}</td>
        <td class="px-3 py-2 text-center align-top">
          <button class="text-xs rounded bg-brand-600 text-white px-2 py-1 hover:bg-brand-700" data-action="ver-presupuesto" data-id="${p.id}">Ver</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    showToast('No se pudieron cargar los presupuestos', 'error');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-zinc-500 py-4">Error al cargar presupuestos.</td></tr>';
  }
}

tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="ver-presupuesto"]');
  if (btn) {
    const id = btn.getAttribute('data-id');
    if (id) {
      window.location.href = `presupuesto.html?id=${encodeURIComponent(id)}`;
    }
  }
});

if (backBtn) {
  backBtn.addEventListener('click', () => {
    window.history.back();
  });
}

(async function init() {
  await loadActividadNombre();
  await loadPresupuestos();
})();
