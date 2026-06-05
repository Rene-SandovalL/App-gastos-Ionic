import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type GeminiTicketData = {
  monto: number;
  establecimiento: string;
  concepto: string;
  fecha: string;
  categoria: string;
};

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly model = 'gemini-3-flash-preview';
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  async analyzeTicket(base64Image: string): Promise<{ data: GeminiTicketData | null; error: string | null }> {
    const apiKey = environment.geminiApiKey;
    if (!apiKey) {
      return { data: null, error: 'Falta la API Key de Gemini.' };
    }

    const prompt =
      'Analiza la imagen del ticket y devuelve EXCLUSIVAMENTE un JSON con la estructura ' +
      '{"monto": number, "establecimiento": string, "concepto": string, "fecha": "YYYY-MM-DD", "categoria": string}. ' +
      'Categorias validas: Comida, Servicios, Transporte, Salud, Otros. No agregues texto adicional.';

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const message = errorPayload?.error?.message ?? 'Gemini no pudo analizar el ticket.';
        return { data: null, error: message };
      }

      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = this.safeParseJson(text);

      if (!parsed) {
        return { data: null, error: 'La respuesta de Gemini no fue valida.' };
      }

      return { data: parsed, error: null };
    } catch (error) {
      return { data: null, error: 'No se pudo conectar con Gemini.' };
    }
  }

  private safeParseJson(text: string): GeminiTicketData | null {
    const trimmed = text.trim();
    const normalized = trimmed
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {
      return JSON.parse(normalized) as GeminiTicketData;
    } catch (error) {
      return null;
    }
  }
}
