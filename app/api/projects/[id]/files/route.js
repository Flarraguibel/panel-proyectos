import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';

const KEY = 'proyectos';

export async function POST(request, { params }) {
  const { id } = params;
  const formData = await request.formData();
  const archivo = formData.get('archivo');

  if (!archivo || typeof archivo === 'string') {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
  }

  const proyectos = (await kv.get(KEY)) || [];
  const idx = proyectos.findIndex((p) => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
  }

  let blob;
  try {
    blob = await put(`${id}/${Date.now()}-${archivo.name}`, archivo, {
      access: 'public',
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Vercel Blob: ${err instanceof Error ? err.message : 'error desconocido'}` },
      { status: 500 }
    );
  }

  const nuevoArchivo = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nombre: archivo.name,
    url: blob.url,
    tamanoBytes: archivo.size,
    subidoEn: new Date().toISOString(),
  };

  if (!proyectos[idx].archivos) {
    proyectos[idx].archivos = [];
  }
  proyectos[idx].archivos.push(nuevoArchivo);

  await kv.set(KEY, proyectos);

  return NextResponse.json(nuevoArchivo, { status: 201 });
}
