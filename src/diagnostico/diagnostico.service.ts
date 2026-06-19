import { Injectable } from '@nestjs/common';
import { CreateDiagnosticoDto } from './dto/create-diagnostico.dto';
import { CreateConsultaAgricolaDto } from './dto/agricultura-diagnostico.dto';
import { DensidadSiembraDto } from './dto/densidad-siembra.dto';

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

  async consulta(dto: CreateConsultaAgricolaDto) {
    const prompt = `
Eres un ingeniero agrónomo experto en agricultura.

Cultivo: ${dto.cultivo}
Tipo de suelo: ${dto.tipoSuelo || 'No especificado'}
Clima: ${dto.clima || 'No especificado'}

Problemas reportados:
${dto.problemas.join(', ')}

Devuelve:
1. Posibles causas
2. Recomendaciones
3. Fertilizantes sugeridos
4. Manejo preventivo
5. Nivel de gravedad
`;

    const response = await fetch(process.env.URL_API_IA, {
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
      respuesta: data.choices[0].message.content,
    };
  }

  async densidad(dto: DensidadSiembraDto) {
    const prompt = `
Eres un ingeniero agrónomo experto en agricultura.

Cultivo: ${dto.cultivo}
Tipo de terreno: ${dto.tipoTerreno || 'No especificado'}
Clima: ${dto.clima || 'No especificado'}

Área:
${dto.area || 'No especificada'} ${dto.unidad || ''}

Devuelve:
1. Cantidad recomendada de semillas por ${dto.area}
2. Cantidad recomendada por ${dto.area}
3. Distancia entre plantas
4. Distancia entre surcos
5. Producción estimada
6. Recomendaciones técnicas
`;

    const response = await fetch(process.env.URL_API_IA, {
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
      respuesta: data.choices[0].message.content,
    };
  }
}
