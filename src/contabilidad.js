// --- Registro de Anticipo ---

import { showToast } from "./toast.js";
const formAnticipo = document.getElementById("form-anticipo");
const inputAnticipo = document.getElementById("input-anticipo");
const inputFechaAnticipo = document.getElementById("input-fecha-anticipo");
const inputComprobante = document.getElementById("input-comprobante");

formAnticipo.addEventListener("submit", async (e) => {
  e.preventDefault();
  const presupuestoId = selectPresupuesto.value;
  if (!presupuestoId) {
    showToast("Selecciona un presupuesto antes de registrar el anticipo.", "error");
    return;
  }
  const formData = new FormData();
  formData.append("presupuesto_id", presupuestoId);
  formData.append("anticipo", inputAnticipo.value);
  formData.append("fechaAnticipo", inputFechaAnticipo.value);
  if (inputComprobante.files[0]) {
    formData.append("comprobante", inputComprobante.files[0]);
  }
  const apiBase = config.apiBaseUrl || "/api/";
  try {
    const res = await fetch(apiBase.replace(/\/$/, "") + "/guardar_anticipo.php", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      showToast("Anticipo guardado correctamente.", "success");
      cargarKPIs(presupuestoId);
      formAnticipo.reset();
    } else {
      showToast(data.error || "Error al guardar el anticipo.", "error");
    }
  } catch (err) {
    showToast("Error de red al guardar el anticipo.", "error");
  }
});
// contabilidad.js
// Lógica inicial para poblar los selects de Proyecto > Actividad > Presupuesto

import { config } from "./config.js";

const selectProyecto = document.getElementById("select-proyecto");
const selectActividad = document.getElementById("select-actividad");
const selectPresupuesto = document.getElementById("select-presupuesto");

// --- Persistencia de estado (selecciones y borrador) ---
const STORAGE_KEYS = {
  proyecto: "contab_proyecto",
  actividad: "contab_actividad",
  presupuesto: "contab_presupuesto",
  draft: "contab_draft_anticipo"
};

function saveSelection(key, value) {
  try { localStorage.setItem(key, value || ""); } catch {}
}

function getSelection(key) {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}

function saveDraft() {
  const draft = {
    anticipo: inputAnticipo?.value || "",
    fecha: inputFechaAnticipo?.value || ""
  };
  try { sessionStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft)); } catch {}
}

function restoreDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.draft);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (draft?.anticipo != null) inputAnticipo.value = draft.anticipo;
    if (draft?.fecha != null) inputFechaAnticipo.value = draft.fecha;
  } catch {}
}

async function cargarProyectos() {
  const apiBase = config.apiBaseUrl || "/api/";
  const res = await fetch(apiBase.replace(/\/$/, "") + "/projects.php");
  if (!res.ok) return;
  const proyectos = await res.json();
  selectProyecto.innerHTML = '<option value="">Selecciona un proyecto…</option>' +
    proyectos.map(p => `<option value="${p.id}">${p.name || p.nombre}</option>`).join("");
  selectProyecto.disabled = false;
}

async function cargarActividades(projectId) {
  selectActividad.innerHTML = '<option value="">Selecciona una actividad…</option>';
  selectActividad.disabled = true;
  selectPresupuesto.innerHTML = '<option value="">Selecciona un presupuesto…</option>';
  selectPresupuesto.disabled = true;
  if (!projectId) return;
  const apiBase = config.apiBaseUrl || "/api/";
  const res = await fetch(apiBase.replace(/\/$/, "") + `/actividades.php?project_id=${encodeURIComponent(projectId)}`);
  if (!res.ok) return;
  const actividades = await res.json();
  selectActividad.innerHTML = '<option value="">Selecciona una actividad…</option>' +
    actividades.map(a => `<option value="${a.id}">${a.nombre}</option>`).join("");
  selectActividad.disabled = false;
}


async function cargarPresupuestos(actividadId) {
  selectPresupuesto.innerHTML = '<option value="">Selecciona un presupuesto…</option>';
  selectPresupuesto.disabled = true;
  if (!actividadId) return;
  const apiBase = config.apiBaseUrl || "/api/";
  const res = await fetch(apiBase.replace(/\/$/, "") + `/presupuestos_by_actividad.php?actividad_id=${encodeURIComponent(actividadId)}`);
  if (!res.ok) return;
  const presupuestos = await res.json();
  selectPresupuesto.innerHTML = '<option value="">Selecciona un presupuesto…</option>' +
    presupuestos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join("");
  selectPresupuesto.disabled = false;
}

// --- Dashboard KPIs ---
const kpiPresupuestoTotal = document.getElementById("kpi-presupuesto-total");
const kpiMontoEjecutado = document.getElementById("kpi-monto-ejecutado");
const kpiSaldoDisponible = document.getElementById("kpi-saldo-disponible");
const kpiAvanceFinanciero = document.getElementById("kpi-avance-financiero");
const kpiAnticipos = document.getElementById("kpi-anticipos");
const kpiValuaciones = document.getElementById("kpi-valuaciones");
const kpiUltimaActualizacion = document.getElementById("kpi-ultima-actualizacion");
const kpiEstado = document.getElementById("kpi-estado");

function limpiarKPIs() {
  kpiPresupuestoTotal.textContent = '—';
  kpiMontoEjecutado.textContent = '—';
  kpiSaldoDisponible.textContent = '—';
  kpiAvanceFinanciero.textContent = '—';
  kpiAnticipos.textContent = '—';
  kpiValuaciones.textContent = '—';
  kpiUltimaActualizacion.textContent = '—';
  kpiEstado.textContent = '—';
}

async function cargarKPIs(presupuestoId) {
  limpiarKPIs();
  if (!presupuestoId) return;
  const apiBase = config.apiBaseUrl || "/api/";
  try {
    const res = await fetch(apiBase.replace(/\/$/, "") + `/dashboard_kpis.php?presupuesto_id=${encodeURIComponent(presupuestoId)}`);
    if (!res.ok) return;
    const data = await res.json();
    kpiPresupuestoTotal.textContent = data.presupuesto_total ?? '—';
    kpiMontoEjecutado.textContent = data.monto_ejecutado ?? '—';
    kpiSaldoDisponible.textContent = data.saldo_disponible ?? '—';
    kpiAvanceFinanciero.textContent = data.avance_financiero ? data.avance_financiero + '%' : '—';
    const kpiAnticiposPct = document.getElementById("kpi-anticipos-pct");
    if (data.anticipo && typeof data.anticipo_pct !== 'undefined') {
      kpiAnticipos.textContent = data.anticipo;
      kpiAnticiposPct.textContent = `(${data.anticipo_pct}%)`;
    } else {
      kpiAnticipos.textContent = data.anticipo ?? '—';
      kpiAnticiposPct.textContent = '';
    }
    kpiValuaciones.textContent = data.valuaciones ?? '—';
    kpiUltimaActualizacion.textContent = data.ultima_actualizacion ?? '—';
    kpiEstado.textContent = data.estado ?? '—';
  } catch (e) {
    // Silenciar error
  }
}

// --- Tabs UI ---
const TAB_KEY = 'contab_active_tab';
function setActiveTab(name) {
  const btns = document.querySelectorAll('[data-tab-btn]');
  const panels = {
    anticipo: document.getElementById('panel-anticipo'),
    avance: document.getElementById('panel-avance')
  };
  btns.forEach(btn => {
    const isActive = btn.dataset.tab === name;
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    // Asegurar base: siempre con borde inferior para tabs
    btn.classList.toggle('border-b-2', true);
    // Activa: color de marca, borde marcado y semibold
    if (isActive) {
      btn.classList.add('border-brand-600', 'text-brand-700', 'font-semibold', 'bg-white', 'rounded-t-md', 'shadow-sm');
      btn.classList.remove('text-zinc-600', 'bg-transparent');
    } else {
      // Inactiva: borde transparente, texto zinc
      btn.classList.remove('border-brand-600', 'text-brand-700', 'font-semibold', 'bg-white', 'rounded-t-md', 'shadow-sm');
      btn.classList.add('text-zinc-600', 'bg-transparent');
    }
  });
  Object.entries(panels).forEach(([key, el]) => {
    if (!el) return;
    if (key === name) el.classList.remove('hidden'); else el.classList.add('hidden');
  });
  try { localStorage.setItem(TAB_KEY, name); } catch {}
}

function initTabs() {
  const btns = document.querySelectorAll('[data-tab-btn]');
  btns.forEach(btn => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
  });
  let saved = 'anticipo';
  try { saved = localStorage.getItem(TAB_KEY) || 'anticipo'; } catch {}
  setActiveTab(saved);
}


selectProyecto.addEventListener("change", e => {
  const projectId = e.target.value;
  saveSelection(STORAGE_KEYS.proyecto, projectId);
  // Reset dependientes
  saveSelection(STORAGE_KEYS.actividad, "");
  saveSelection(STORAGE_KEYS.presupuesto, "");
  cargarActividades(projectId);
  limpiarKPIs();
});

selectActividad.addEventListener("change", e => {
  const actividadId = e.target.value;
  saveSelection(STORAGE_KEYS.actividad, actividadId);
  // Reset dependiente
  saveSelection(STORAGE_KEYS.presupuesto, "");
  cargarPresupuestos(actividadId);
  limpiarKPIs();
});

selectPresupuesto.addEventListener("change", e => {
  const presupuestoId = e.target.value;
  saveSelection(STORAGE_KEYS.presupuesto, presupuestoId);
  cargarKPIs(presupuestoId);
});

// Guardar borrador en tiempo real y restaurar al cargar
inputAnticipo?.addEventListener("input", saveDraft);
inputFechaAnticipo?.addEventListener("input", saveDraft);

// Limpia borrador al guardar correctamente
formAnticipo?.addEventListener("submit", () => {
  try { sessionStorage.removeItem(STORAGE_KEYS.draft); } catch {}
});

// Inicial con restauración de estado en cascada
async function init() {
  await cargarProyectos();
  const savedProyecto = getSelection(STORAGE_KEYS.proyecto);
  const savedActividad = getSelection(STORAGE_KEYS.actividad);
  const savedPresupuesto = getSelection(STORAGE_KEYS.presupuesto);

  if (savedProyecto) {
    selectProyecto.value = savedProyecto;
    await cargarActividades(savedProyecto);
    if (savedActividad) {
      selectActividad.value = savedActividad;
      await cargarPresupuestos(savedActividad);
      if (savedPresupuesto) {
        selectPresupuesto.value = savedPresupuesto;
        await cargarKPIs(savedPresupuesto);
      }
    }
  } else {
    limpiarKPIs();
  }

  restoreDraft();
  initTabs();
}

init();
