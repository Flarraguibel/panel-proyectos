import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KEY = 'proyectos';

export async function PATCH(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const proyectos = (await kv.get(KEY)) || [];
  const idx = proyectos.findIndex((p) => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  if (typeof body.porcentaje === 'number' && !Number.isNaN(body.porcentaje)) {
    proyectos[idx].porcentaje = Math.max(0, Math.min(100, Math.round(body.porcentaje)));
  }
  if (typeof body.nombre === 'string' && body.nombre.trim()) {
    proyectos[idx].nombre = body.nombre.trim();
  }
  if ('fechaLimite' in body) {
    proyectos[idx].fechaLimite = body.fechaLimite || null;
  }
  proyectos[idx].actualizadoEn = new Date().toISOString();

  await kv.set(KEY, proyectos);
  return NextResponse.json(proyectos[idx]);
}

export async function DELETE(_request, { params }) {
  const { id } = params;
  const proyectos = (await kv.get(KEY)) || [];
  const filtrados = proyectos.filter((p) => p.id !== id);

  await kv.set(KEY, filtrados);
  return NextResponse.json({ ok: true });
}
