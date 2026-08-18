'use client';

import { useEffect, useState } from 'react';
import { getEstado, ORDEN_SECCIONES } from '../lib/estado';

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Home() {
  const [proyectos, setProyectos] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [fechaNueva, setFechaNueva] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [subiendoId, setSubiendoId] = useState(null);

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

  async function subirArchivo(id, file) {
    if (!file) return;
    setSubiendoId(id);
    const formData = new FormData();
    formData.append('archivo', file);

    try {
      const res = await fetch(`/api/projects/${id}/files`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        let detalle = `HTTP ${res.status}`;
        try {
          const cuerpo = await res.json();
          if (cuerpo?.error) detalle = cuerpo.error;
        } catch {
          // la respuesta no era JSON, nos quedamos con el código HTTP
        }
        throw new Error(detalle);
      }
      const nuevoArchivo = await res.json();
      setProyectos((actuales) =>
        actuales.map((p) =>
          p.id === id ? { ...p, archivos: [...(p.archivos || []), nuevoArchivo] } : p
        )
      );
    } catch (err) {
      alert(`No se pudo subir el archivo: ${err.message}`);
    } finally {
      setSubiendoId(null);
    }
  }

  async function borrarArchivo(idProyecto, fileId) {
    if (!confirm('¿Eliminar este archivo?')) return;
    setProyectos((actuales) =>
      actuales.map((p) =>
        p.id === idProyecto
          ? { ...p, archivos: (p.archivos || []).filter((a) => a.id !== fileId) }
          : p
      )
    );
    await fetch(`/api/projects/${idProyecto}/files/${fileId}`, { method: 'DELETE' });
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
            const archivos = p.archivos || [];
            const subiendo = subiendoId === p.id;
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

                <div className="adjuntos">
                  {archivos.length > 0 && (
                    <ul className="lista-adjuntos">
                      {archivos.map((a) => (
                        <li key={a.id}>
                          <a href={a.url} target="_blank" rel="noopener noreferrer">
                            📎 {a.nombre}
                          </a>
                          <span className="adjunto-tamano">{formatearTamano(a.tamanoBytes)}</span>
                          <button
                            className="link-borrar"
                            onClick={() => borrarArchivo(p.id, a.id)}
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <label className={`btn-adjuntar ${subiendo ? 'disabled' : ''}`}>
                    {subiendo ? 'Subiendo…' : '+ Adjuntar archivo'}
                    <input
                      type="file"
                      hidden
                      disabled={subiendo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        subirArchivo(p.id, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="tarjeta-acciones">
                  <button className="link-borrar" onClick={() => borrarProyecto(p.id)}>
                    Eliminar proyecto
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
