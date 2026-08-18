import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { proyectosIniciales } from '../../../lib/seed';

const KEY = 'proyectos';

export async function GET() {
  let proyectos = await kv.get(KEY);
  if (!proyectos) {
    proyectos = proyectosIniciales;
    await kv.set(KEY, proyectos);
  }
  return NextResponse.json(proyectos);
}

export async function POST(request) {
  const body = await request.json();
  const nombre = (body.nombre || '').trim();

  if (!nombre) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  }

  const proyectos = (await kv.get(KEY)) || [];
  const nuevo = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nombre,
    porcentaje: 0,
    fechaLimite: body.fechaLimite || null,
    archivos: [],
    comentarios: [],
    actualizadoEn: new Date().toISOString(),
  };

  proyectos.push(nuevo);
  await kv.set(KEY, proyectos);

  return NextResponse.json(nuevo, { status: 201 });
}
