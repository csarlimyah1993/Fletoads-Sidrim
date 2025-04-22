import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const webhookUrl = 'https://n8n-w.robotizze.us/webhook/end-conexao';

  try {
    // 1. Receive the request body from the frontend
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Missing name or phone in request body' }, { status: 400 });
    }

    // 2. Make a POST request to the external webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, phone }), // 3. Send name and phone
    });

    // 4. Wait for the response and get its JSON body
    const responseData = await webhookResponse.json();
    const responseStatus = webhookResponse.status;

    // 5. Return the response from the webhook back to the frontend
    return NextResponse.json(responseData, { status: responseStatus });

  } catch (error) {
    console.error('Error proxying request to end connection webhook:', error);
    // 6. Basic error handling
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Failed to proxy request to webhook', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}