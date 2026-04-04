import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, IngredientAnalysis, ProgressEntry, RoutineBuilderResult } from '../types';

// Variable global para almacenar la instancia una vez creada
let aiInstance: GoogleGenAI | null = null;

// Función Helper para obtener el cliente
const getAIClient = () => {
  if (aiInstance) return aiInstance;

  // Acceso directo para permitir que el bundler (Vite/Netlify) inyecte el valor.
  // No usar verificaciones de 'typeof process' aquí porque bloquean la inyección en frontend.
  const key = process.env.API_KEY;

  if (key) {
    try {
        aiInstance = new GoogleGenAI({ apiKey: key });
        return aiInstance;
    } catch (err) {
        console.error("Error inicializando AI Client:", err);
        return null;
    }
  }

  // Si llegamos aquí, la key no está presente
  console.warn("⚠️ API Key no encontrada. Asegúrate de tener la variable de entorno API_KEY configurada en Netlify.");
  return null;
};

// Helper para limpiar respuestas de la IA que incluyen markdown o texto extra
const cleanJsonResponse = (text: string): string => {
  if (!text) return "{}";
  
  // 1. Remove Markdown code blocks first
  let clean = text.replace(/```json/gi, '').replace(/```/g, '');
  
  // 2. Find the first '{' and last '}' to isolate JSON object
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace >= 0 && lastBrace > firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1);
  } else {
      console.warn("No valid JSON object found in response");
      return "{}";
  }
  
  return clean.trim();
};

export const analyzeSkinImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = getAIClient();

  if (!ai) {
    // Lanzamos error explícito para detener el spinner de carga en la UI
    throw new Error("Falta la API Key. Configura la variable 'API_KEY' en Netlify.");
  }

  const prompt = `Analiza esta imagen facial dermatológicamente. Identifica el tipo de piel, ingredientes que se deben evitar y condiciones visibles. 
  Responde estrictamente en formato JSON válido con la siguiente estructura:
  {
    "skinType": "string (ej. Grasa, Seca)",
    "avoidIngredients": ["string", "string"],
    "conditions": ["string", "string"],
    "recommendations": "string (consejo breve)"
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    
    // Limpieza y Validación para evitar crashes
    let rawData;
    try {
        rawData = JSON.parse(cleanJsonResponse(text));
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw Text:", text);
        rawData = {
            skinType: "Error de análisis",
            avoidIngredients: [],
            conditions: ["No se pudo procesar la respuesta"],
            recommendations: "Intenta de nuevo con otra foto."
        };
    }

    const safeResult: AnalysisResult = {
        date: new Date().toLocaleDateString(),
        skinType: rawData.skinType || "Desconocido",
        avoidIngredients: Array.isArray(rawData.avoidIngredients) ? rawData.avoidIngredients : [],
        conditions: Array.isArray(rawData.conditions) ? rawData.conditions : [],
        recommendations: rawData.recommendations || "Sin recomendaciones específicas."
    };
    
    return safeResult;

  } catch (error: any) {
    console.error("❌ Falló el análisis:", error);
    throw new Error("Error de conexión con Gemini. Verifica tu API Key o intenta más tarde.");
  }
};

export const analyzeIngredients = async (base64Image: string, userSkinType: string): Promise<IngredientAnalysis> => {
  const ai = getAIClient();

  if (!ai) {
     throw new Error("Falta la API Key. Configura la variable 'API_KEY' en Netlify.");
  }

  const prompt = `
### ROL y OBJETIVO
Eres un Asistente Experto en Cosmetología. Analiza los ingredientes de la imagen y evalúalos para Piel "${userSkinType || 'Desconocido'}".

### FORMATO JSON:
{
  "analisis_general": "string",
  "tipo_piel_usuario": "string",
  "es_recomendable_para_usuario": boolean,
  "nivel_comedogenico_total": "Bajo" | "Medio" | "Alto",
  "lista_ingredientes_detectados_ocr": ["string"],
  "problemas_encontrados": [{"ingrediente": "string", "riesgo": "string", "explicacion": "string"}],
  "ingredientes_beneficiosos": [{"ingrediente": "string", "beneficio": "string", "explicacion": "string"}],
  "sugerencia_final": "string"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
      }
    });

    let rawData;
    try {
        rawData = JSON.parse(cleanJsonResponse(response.text || '{}'));
    } catch(e) {
        rawData = {};
    }

    return {
        analisis_general: rawData.analisis_general || "No se pudo generar un análisis detallado.",
        tipo_piel_usuario: rawData.tipo_piel_usuario || userSkinType,
        es_recomendable_para_usuario: !!rawData.es_recomendable_para_usuario,
        nivel_comedogenico_total: rawData.nivel_comedogenico_total || "Bajo",
        lista_ingredientes_detectados_ocr: Array.isArray(rawData.lista_ingredientes_detectados_ocr) ? rawData.lista_ingredientes_detectados_ocr : [],
        problemas_encontrados: Array.isArray(rawData.problemas_encontrados) ? rawData.problemas_encontrados : [],
        ingredientes_beneficiosos: Array.isArray(rawData.ingredientes_beneficiosos) ? rawData.ingredientes_beneficiosos : [],
        sugerencia_final: rawData.sugerencia_final || ""
    } as IngredientAnalysis;

  } catch (error: any) {
    throw new Error("No pudimos leer los ingredientes. Intenta de nuevo.");
  }
};

export const analyzeRoutine = async (base64Image: string): Promise<RoutineBuilderResult> => {
  const ai = getAIClient();
  if (!ai) throw new Error("Falta la API Key. Configura la variable 'API_KEY' en Netlify.");

  const prompt = `
### ROL y OBJETIVO
Eres un Químico Formulador. Analiza la imagen de productos. Crea una rutina optimizada (mañana/noche).

### OUTPUT JSON:
{
  "productos_detectados": [{ "nombre_estimado": "string", "ingredientes_detectados": [], "activos_principales": [] }],
  "analisis_interacciones_global": [{ "tipo_interaccion": "string", "productos_implicados": [], "razon_quimica": "string", "recomendacion": "string" }],
  "rutina_optimizada_sugerida": { "pasos_manana": [], "pasos_noche": [], "orden_detallado": [{"producto": "string", "paso": "string", "razon": "string"}] },
  "advertencias_generales": "string"
}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
      }
    });

    let rawData;
    try {
        rawData = JSON.parse(cleanJsonResponse(response.text || '{}'));
    } catch(e) {
        rawData = {};
    }

    return {
        productos_detectados: Array.isArray(rawData.productos_detectados) ? rawData.productos_detectados : [],
        analisis_interacciones_global: Array.isArray(rawData.analisis_interacciones_global) ? rawData.analisis_interacciones_global : [],
        rutina_optimizada_sugerida: {
            pasos_manana: Array.isArray(rawData.rutina_optimizada_sugerida?.pasos_manana) ? rawData.rutina_optimizada_sugerida.pasos_manana : [],
            pasos_noche: Array.isArray(rawData.rutina_optimizada_sugerida?.pasos_noche) ? rawData.rutina_optimizada_sugerida.pasos_noche : [],
            orden_detallado: Array.isArray(rawData.rutina_optimizada_sugerida?.orden_detallado) ? rawData.rutina_optimizada_sugerida.orden_detallado : []
        },
        advertencias_generales: rawData.advertencias_generales || "Sin advertencias."
    } as RoutineBuilderResult;

  } catch (error: any) {
    throw new Error("No se pudo analizar la rutina. Intenta con otra foto.");
  }
};

export const chatWithEmma = async (history: {role: string, parts: {text: string}[]}[], userMessage: string) => {
   const ai = getAIClient();
   if (!ai) return "Error: API Key no configurada.";

   const systemInstruction = `Eres Emma, la mascota virtual de la app Emma Glow. 
   Tu personalidad es empática y experta en skincare.`;

   try {
     const chat = ai.chats.create({
       model: 'gemini-2.5-flash',
       config: { systemInstruction },
       history: history
     });

     const result = await chat.sendMessage({ message: userMessage });
     return result.text;
   } catch (error: any) {
     return `Error: ${error.message}`;
   }
};

export const generateProgressReport = async (entries: ProgressEntry[], productName: string): Promise<string> => {
    const ai = getAIClient();
    if (!ai) return "Error: API Key no configurada.";
  
    const dataPoints = entries.map(e => 
      `Fecha: ${e.date}, Score Piel: ${e.score}/100, Notas: ${e.notes}`
    ).join('\n');
  
    const prompt = `
      Actúa como dermatóloga. Analiza el progreso del paciente con "${productName}".
      Datos:
      ${dataPoints}
      Genera reporte breve.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text || "No se pudo generar el reporte.";
    } catch (e) {
      return "Error generando el pronóstico.";
    }
  };