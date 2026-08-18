import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { kv } from '@vercel/kv';

const KEY = 'proyectos';

export async function DELETE(_request, { params }) {
  const { id, fileId } = params;
  const proyectos = (await kv.get(KEY)) || [];
  const idx = proyectos.findIndex((p) => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  const archivos = proyectos[idx].archivos || [];
  const archivo = archivos.find((a) => a.id === fileId);

  if (archivo) {
    await del(archivo.url).catch(() => {});
  }

  proyectos[idx].archivos = archivos.filter((a) => a.id !== fileId);
  await kv.set(KEY, proyectos);

  return NextResponse.json({ ok: true });
}
