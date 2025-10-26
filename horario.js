// =====================================
// CONFIGURACIÓN
// =====================================
const SCHEDULE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOCBCR_1CsQJz9YljFyiL3YxgnvlUy_eEQMSmmIf9jvsCt0aO0RjoUD0yfTbq1_liXXQ/exec';
window.tiendaAbierta = false;

// =====================================
// UTILIDADES
// =====================================
function parseHour(value) {
  if (!value) return null;
  if (typeof value === "number") {
    const hh = Math.floor(value);
    const mm = Math.round((value - hh) * 60);
    return { h: hh, m: mm };
  }

  const s = String(value).trim();
  const match = s.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (match) {
    return { h: parseInt(match[1]), m: parseInt(match[2] || "0") };
  }
  return null;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// =====================================
// CARGAR DESDE GOOGLE SHEETS
// =====================================
async function loadSchedule() {
  try {
    const res = await fetch(SCHEDULE_APPS_SCRIPT_URL, {
      cache: "no-cache",
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error("No se pudo conectar con Google Sheets");

    const data = await res.json();

    const schedule = data.map(item => ({
      day: capitalize(item.dia),
      open: parseHour(item.apertura),
      close: parseHour(item.cierre),
      estado: item.estado === true || String(item.estado).toLowerCase() === "true"
    }));

    displaySchedule(schedule);
  } catch (err) {
    console.error("❌ Error al cargar horarios:", err);
    // Si falla, mostrar mensaje claro
    const el = document.getElementById("status-header");
    el.textContent = "No se pudo cargar el horario, intenta recargar la página.";
    el.style.background = "#e67e22";
  }
}

// =====================================
// DETERMINAR ESTADO ACTUAL
// =====================================
// =====================================
// DETERMINAR ESTADO ACTUAL (versión mejorada sin emojis)
// =====================================
function displaySchedule(schedule) {
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const now = new Date();

  // Usamos hora local de Colombia
  const localNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  const currentDayIndex = localNow.getDay();
  const currentDay = days[currentDayIndex];
  const today = schedule.find(s => s.day === currentDay);

  // Si hoy no abre
  if (!today || !today.estado) {
    const { nextDay, daysUntil } = findNextOpenDay(schedule, currentDayIndex);
    if (nextDay) {
      const msg = daysUntil === 1
        ? `Volvemos mañana a las ${formatTime(nextDay.open)}`
        : `Abrimos el ${nextDay.day.toLowerCase()} a las ${formatTime(nextDay.open)} (${daysUntil} día${daysUntil > 1 ? 's' : ''})`;
      setClosed("Hoy la tienda no abre", msg);
    } else {
      setClosed("Cerrado temporalmente", "No hay próximos horarios disponibles.");
    }
    window.tiendaAbierta = false;
    return;
  }

  // Definir apertura y cierre
  const open = new Date(localNow);
  open.setHours(today.open.h, today.open.m, 0, 0);

  const close = new Date(localNow);
  close.setHours(today.close.h, today.close.m, 0, 0);

  // Si cierra pasada la medianoche
  if (close <= open) close.setDate(close.getDate() + 1);

  // 🟢 Está abierto actualmente
  if (localNow >= open && localNow <= close) {
    window.tiendaAbierta = true;
    const diffMin = Math.floor((close - localNow) / 60000);
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;

    let mensaje;
    if (diffMin <= 15) {
      mensaje = `Cerramos pronto a las ${formatTime(today.close)}`;
    } else if (h >= 1) {
      mensaje = `Cerramos a las ${formatTime(today.close)} (en ${h} h ${m} min)`;
    } else {
      mensaje = `Cerramos en ${m} minuto${m !== 1 ? "s" : ""}`;
    }

    setOpen("¡La tienda está abierta!", mensaje);
    return;
  }

  // ⏳ Aún no ha abierto hoy
  if (localNow < open) {
    const diffMin = Math.floor((open - localNow) / 60000);
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    const msg = h > 0
      ? `Abrimos hoy a las ${formatTime(today.open)} (en ${h} h ${m} min)`
      : `Abrimos en ${m} minuto${m !== 1 ? "s" : ""}`;
    setClosed("Aún no abrimos", msg);
    window.tiendaAbierta = false;
    return;
  }

  // 🌙 Ya cerró por hoy
  if (localNow > close) {
    const { nextDay, daysUntil } = findNextOpenDay(schedule, currentDayIndex);
    if (nextDay) {
      const msg = daysUntil === 1
        ? `Volvemos mañana a las ${formatTime(nextDay.open)}`
        : `Abrimos el ${nextDay.day.toLowerCase()} a las ${formatTime(nextDay.open)} (${daysUntil} día${daysUntil > 1 ? 's' : ''})`;
      setClosed("Cerramos por hoy", msg);
    } else {
      setClosed("Cerramos por hoy", "No hay próximos horarios disponibles.");
    }
    window.tiendaAbierta = false;
  }
}

// Encuentra el próximo día que la tienda abre
function findNextOpenDay(schedule, currentIndex) {
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (currentIndex + i) % 7;
    const next = schedule.find(s => s.day === days[nextIndex]);
    if (next && next.estado) {
      return { nextDay: next, daysUntil: i };
    }
  }
  return { nextDay: null, daysUntil: null };
}



function formatTime({ h, m }) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2,"0")} ${period}`;
}

// =====================================
// VISUALIZACIÓN
// =====================================
function setOpen(title, subtitle = "") {
  const header = document.getElementById("status-header");
  const sub = document.getElementById("status-subtext");
  header.style.background = "#27ae27";
  header.style.color = "#fff";
  header.textContent = title;
  sub.textContent = subtitle;
}

function setClosed(title, subtitle = "") {
  const header = document.getElementById("status-header");
  const sub = document.getElementById("status-subtext");
  header.style.background = "#e74c3c";
  header.style.color = "#fff";
  header.textContent = title;
  sub.textContent = subtitle;
}

// =====================================
// AUTOEJECUCIÓN Y REFRESCO
// =====================================
document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();
  // Refresca cada 1 min por si el horario cambia en Sheets
  setInterval(loadSchedule, 1 * 60 * 1000);
});
