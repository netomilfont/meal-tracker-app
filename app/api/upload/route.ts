import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image') as File;

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN; // Usa a variável de ambiente local

  if (!token) {
    return NextResponse.json({ error: 'Token não encontrado' }, { status: 500 });
  }

  const blob = await put(file.name, file, {
    access: 'public',
    token: token, // Passa o token
  });

  return NextResponse.json(blob);
}