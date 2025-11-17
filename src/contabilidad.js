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


selectProyecto.addEventListener("change", e => {
  cargarActividades(e.target.value);
  limpiarKPIs();
});

selectActividad.addEventListener("change", e => {
  cargarPresupuestos(e.target.value);
  limpiarKPIs();
});

selectPresupuesto.addEventListener("change", e => {
  cargarKPIs(e.target.value);
});

// Inicial
cargarProyectos();
limpiarKPIs();
