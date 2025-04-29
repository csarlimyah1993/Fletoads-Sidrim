'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea component exists
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast'; // Assuming a toast hook exists for notifications
import { useSession } from 'next-auth/react'; // Import useSession

export default function PanAiPage() {
  const { data: session } = useSession(); // Get session data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const webhookUrl = 'https://n8n-w.robotizze.us/webhook/pan-ai'; // Updated webhook URL

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedImageUrl(null); // Clear previous image

    const formData = {
      description,
      // Include user session data
      userSession: session?.user,
      // Add any other fields you need here
    };

    console.log('Sending data to webhook:', formData); // Log data being sent
    console.log('Description value being sent:', description); // Explicitly log description
    console.log('User session data being sent:', session?.user); // Explicitly log session data

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Webhook response status:', response.status); // Log response status

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook response error:', errorText); // Log error response body
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      // Assuming the webhook responds with the URL of the generated image in JSON format like { imageUrl: '...' }
      // Adjust this based on the actual webhook response structure
      const result = await response.json();
      console.log('Webhook response success:', result); // Log success response body

      if (result.imageUrl) {
         setGeneratedImageUrl(result.imageUrl);
         toast({ title: 'Sucesso!', description: 'Panfleto gerado com sucesso.' });
      } else {
         // Handle cases where imageUrl might be missing even on success
         console.warn('Webhook response successful, but imageUrl missing:', result);
         toast({ title: 'Aviso', description: 'Resposta recebida, mas URL da imagem não encontrada.', variant: 'destructive' });
      }

    } catch (error) {
      console.error('Error sending data to webhook:', error);
      toast({
        title: 'Erro ao gerar panfleto',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Gerador de Panfletos AI</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para gerar um panfleto automaticamente.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Panfleto</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Promoção Imperdível!"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição / Conteúdo</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da sua oferta, evento ou produto..."
                required
                rows={5}
                disabled={isLoading}
              />
            </div>
            {/* Add more input fields here as needed */}
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4">
             <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Gerando...' : 'Gerar Panfleto'}
            </Button>
            {generatedImageUrl && (
              <div className="mt-6 w-full">
                <h3 className="text-lg font-semibold mb-2 text-center">Panfleto Gerado:</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={generatedImageUrl} alt="Panfleto Gerado" className="max-w-full h-auto rounded-md border" />
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}