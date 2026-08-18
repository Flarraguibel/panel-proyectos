export function getEstado(porcentaje) {
  if (porcentaje >= 100) {
    return { clave: 'completado', etiqueta: 'Completado', emoji: '✅', color: '#059669' };
  }
  if (porcentaje >= 85) {
    return { clave: 'apunto', etiqueta: 'A punto de terminar', emoji: '🟢', color: '#22c55e' };
  }
  if (porcentaje >= 40) {
    return { clave: 'curso', etiqueta: 'En curso', emoji: '🔵', color: '#3b82f6' };
  }
  if (porcentaje >= 1) {
    return { clave: 'riesgo', etiqueta: 'En riesgo', emoji: '🟠', color: '#f59e0b' };
  }
  return { clave: 'sinempezar', etiqueta: 'Sin empezar', emoji: '🔴', color: '#ef4444' };
}

export const ORDEN_SECCIONES = [
  { clave: 'apunto', titulo: '🟢 A punto de terminar' },
  { clave: 'riesgo', titulo: '🟠 En riesgo' },
  { clave: 'sinempezar', titulo: '🔴 Sin empezar / no tenidos en cuenta' },
  { clave: 'curso', titulo: '🔵 En curso' },
  { clave: 'completado', titulo: '✅ Completados' },
];
