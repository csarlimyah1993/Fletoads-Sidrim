import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    // Recebe o corpo da requisição do frontend
    const body = await request.json();
    const { instance } = body;

    if (!instance) {
      return NextResponse.json({ error: 'Missing instance in request body' }, { status: 400 });
    }
    const logoutUrl = `${ENV.EVOLUTION_API_BASE_URL}/instance/logout/${encodeURIComponent(instance)}`;

    // Envia a requisição DELETE para o endpoint externo
    const response = await fetch(logoutUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ENV.EVOLUTION_API_KEY,
      },
    });

    // Aguarda a resposta e obtém o corpo JSON
    let responseData = null;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { message: await response.text() };
    }
    const responseStatus = response.status;

    // Retorna a resposta do endpoint externo para o frontend
    return NextResponse.json(responseData, { status: responseStatus });

  } catch (error) {
    console.error('Erro ao enviar requisição DELETE para logout da instância:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Falha ao enviar requisição DELETE para logout', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Ocorreu um erro desconhecido' }, { status: 500 });
  }
}