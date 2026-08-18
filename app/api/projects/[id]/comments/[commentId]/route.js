import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KEY = 'proyectos';

export async function DELETE(_request, { params }) {
  const { id, commentId } = params;
  const proyectos = (await kv.get(KEY)) || [];
  const idx = proyectos.findIndex((p) => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  const comentarios = proyectos[idx].comentarios || [];
  proyectos[idx].comentarios = comentarios.filter((c) => c.id !== commentId);

  await kv.set(KEY, proyectos);

  return NextResponse.json({ ok: true });
}
