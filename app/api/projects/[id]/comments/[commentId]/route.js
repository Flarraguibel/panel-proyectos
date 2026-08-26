import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KEY = 'proyectos';

export async function PATCH(request, { params }) {
  const { id, commentId } = params;
  const body = await request.json();
  const texto = (body.texto || '').trim();

  if (!texto) {
    return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 });
  }

  const proyectos = (await kv.get(KEY)) || [];
  const idx = proyectos.findIndex((p) => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  const comentarios = proyectos[idx].comentarios || [];
  const comentarioIdx = comentarios.findIndex((c) => c.id === commentId);

  if (comentarioIdx === -1) {
    return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 });
  }

  comentarios[comentarioIdx] = {
    ...comentarios[comentarioIdx],
    texto,
    editadoEn: new Date().toISOString(),
  };
  proyectos[idx].comentarios = comentarios;

  await kv.set(KEY, proyectos);

  return NextResponse.json(comentarios[comentarioIdx]);
}

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
