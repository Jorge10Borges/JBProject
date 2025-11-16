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

selectProyecto.addEventListener("change", e => {
  cargarActividades(e.target.value);
});

selectActividad.addEventListener("change", e => {
  cargarPresupuestos(e.target.value);
});

// Inicial
cargarProyectos();
