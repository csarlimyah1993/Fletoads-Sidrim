import { NextResponse } from 'next/server';

const EXTERNAL_WEBHOOK_URL = 'https://n8n.robotizze.us/webhook-test/start-conexao';

export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Missing name or phone in request body' }, { status: 400 });
    }

    const webhookResponse = await fetch(EXTERNAL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, phone }),
    });

    if (!webhookResponse.ok) {
      // Attempt to read error body if available
      let errorBody = 'Unknown error';
      try {
        errorBody = await webhookResponse.text();
      } catch (e) {
        console.error('Failed to read webhook error body:', e);
      }
      console.error(`Webhook responded with status ${webhookResponse.status}: ${errorBody}`);
      return NextResponse.json({ error: `Webhook error: ${webhookResponse.status}` }, { status: webhookResponse.status });
    }

    const data = await webhookResponse.json();

    // Assuming the webhook returns { "base64": "<base64 image>" }
    if (!data || typeof data.base64 !== 'string') {
       console.error('Webhook response did not contain a valid base64 field:', data);
       return NextResponse.json({ error: 'Invalid response from webhook' }, { status: 500 });
    }


    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('Error processing WhatsApp QR request:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}