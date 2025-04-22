import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Missing name or phone in request body' }, { status: 400 });
    }

    const webhookUrl = 'https://n8n-w.robotizze.us/webhook/start-conexao';

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, phone }),
    });

    // Check if the webhook response is ok, otherwise throw an error to be caught
    if (!webhookResponse.ok) {
        const errorData = await webhookResponse.text(); // Use text() in case response is not JSON
        console.error(`Webhook error: ${webhookResponse.status} ${webhookResponse.statusText}`, errorData);
        throw new Error(`Webhook request failed with status ${webhookResponse.status}: ${errorData}`);
    }

    const responseData = await webhookResponse.json();

    // Return the successful response from the webhook directly to the frontend
    return NextResponse.json(responseData, { status: webhookResponse.status });

  } catch (error) {
    console.error('Error proxying WhatsApp start connection request:', error);

    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    if (error instanceof Error) {
        // Provide a more specific message if available, but avoid leaking sensitive details
        errorMessage = `Failed to proxy request to webhook. ${error.message}`;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}