import { Injectable } from '@nestjs/common';
import { CreateDiagnosticoDto } from './dto/create-diagnostico.dto';

@Injectable()
export class DiagnosticoService {
  async create(dto: CreateDiagnosticoDto) {
    const prompt = `
Eres un veterinario experto.

Animal:
Especie: ${dto.especie}
Raza: ${dto.raza}
Edad: ${dto.edad} años

Síntomas:
${dto.sintomas.join(', ')}

Devuelve posibles diagnósticos veterinarios.
`;

    const response = await fetch(`${process.env.URL_API_IA}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    return {
      diagnostico: data.choices[0].message.content,
    };
  }
}
