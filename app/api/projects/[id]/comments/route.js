import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const KEY = 'proyectos';

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const texto = (body.texto || '').trim();
  const autor = (body.autor || '').trim() || 'Anónimo';

  if (!texto) {
    return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 });
  }

  const proyectos = (await kv.get(KEY)) || [];
  const idx = proyectos.findIndex((p) => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  const nuevoComentario = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    autor,
    texto,
    creadoEn: new Date().toISOString(),
  };

  if (!proyectos[idx].comentarios) {
    proyectos[idx].comentarios = [];
  }
  proyectos[idx].comentarios.push(nuevoComentario);

  await kv.set(KEY, proyectos);

  return NextResponse.json(nuevoComentario, { status: 201 });
}
