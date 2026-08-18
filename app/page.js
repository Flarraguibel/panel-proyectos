'use client';

import { useEffect, useState } from 'react';
import { getEstado, ORDEN_SECCIONES } from '../lib/estado';

export default function Home() {
  const [proyectos, setProyectos] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [fechaNueva, setFechaNueva] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProyectos(data);
  }

  async function actualizarPorcentaje(id, porcentaje) {
    setProyectos((actuales) =>
      actuales.map((p) => (p.id === id ? { ...p, porcentaje } : p))
    );
  }

  async function guardarPorcentaje(id, porcentaje) {
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ porcentaje }),
    });
  }

  async function añadirProyecto(e) {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;
    setGuardando(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombreNuevo.trim(), fechaLimite: fechaNueva || null }),
    });
    const nuevo = await res.json();
    setProyectos((actuales) => [...(actuales || []), nuevo]);
    setNombreNuevo('');
    setFechaNueva('');
    setMostrarForm(false);
    setGuardando(false);
  }

  async function borrarProyecto(id) {
    if (!confirm('¿Eliminar este proyecto del panel?')) return;
    setProyectos((actuales) => actuales.filter((p) => p.id !== id));
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  }

  if (proyectos === null) {
    return (
      <div className="page">
        <div className="cargando">Cargando proyectos…</div>
      </div>
    );
  }

  const porSeccion = ORDEN_SECCIONES.map((seccion) => ({
    ...seccion,
    items: proyectos.filter((p) => getEstado(p.porcentaje).clave === seccion.clave),
  })).filter((seccion) => seccion.items.length > 0);

  const conteo = ORDEN_SECCIONES.map((s) => ({
    ...s,
    total: proyectos.filter((p) => getEstado(p.porcentaje).clave === s.clave).length,
  })).filter((s) => s.total > 0);

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>Panel de Proyectos</h1>
          <p>Avance de cada proyecto de práctica, actualizado en tiempo real</p>
        </div>
        <button className="btn" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Añadir proyecto'}
        </button>
      </div>

      <div className="resumen">
        {conteo.map((s) => (
          <span className="chip" key={s.clave}>
            {s.titulo}: <b>{s.total}</b>
          </span>
        ))}
      </div>

      {mostrarForm && (
        <form className="form-nuevo" onSubmit={añadirProyecto}>
          <div>
            <label>Nombre del proyecto</label>
            <input
              type="text"
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder="Ej: Control de horas automatizado"
              autoFocus
            />
          </div>
          <div>
            <label>Fecha límite (opcional)</label>
            <input
              type="date"
              value={fechaNueva}
              onChange={(e) => setFechaNueva(e.target.value)}
            />
          </div>
          <button className="btn" type="submit" disabled={guardando}>
            Guardar
          </button>
        </form>
      )}

      {proyectos.length === 0 && (
        <p className="vacio">Todavía no hay proyectos. Añade el primero con el botón de arriba.</p>
      )}

      {porSeccion.map((seccion) => (
        <div className="seccion" key={seccion.clave}>
          <h2>{seccion.titulo}</h2>
          {seccion.items.map((p) => {
            const estado = getEstado(p.porcentaje);
            return (
              <div className="tarjeta" style={{ '--card-color': estado.color }} key={p.id}>
                <div className="tarjeta-top">
                  <div>
                    <p className="tarjeta-nombre">{p.nombre}</p>
                    <p className="tarjeta-meta">
                      {p.fechaLimite ? `Fecha límite: ${p.fechaLimite}` : 'Sin fecha límite'}
                    </p>
                  </div>
                  <div className="tarjeta-porcentaje" style={{ color: estado.color }}>
                    {p.porcentaje}%
                  </div>
                </div>

                <div className="barra-fondo">
                  <div
                    className="barra-relleno"
                    style={{ width: `${p.porcentaje}%`, background: estado.color }}
                  />
                </div>

                <input
                  className="slider"
                  type="range"
                  min="0"
                  max="100"
                  value={p.porcentaje}
                  onChange={(e) => actualizarPorcentaje(p.id, Number(e.target.value))}
                  onMouseUp={(e) => guardarPorcentaje(p.id, Number(e.target.value))}
                  onTouchEnd={(e) => guardarPorcentaje(p.id, Number(e.target.value))}
                />

                <div className="tarjeta-acciones">
                  <button className="link-borrar" onClick={() => borrarProyecto(p.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
