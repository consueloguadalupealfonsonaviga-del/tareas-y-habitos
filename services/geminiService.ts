
import { GoogleGenAI } from "@google/genai";
import { Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestHabits = async (category: Category, goal: string): Promise<string[]> => {
  try {
    const prompt = `
      Actúa como un coach de productividad experto.
      El usuario quiere mejorar en el área: "${category}".
      Su objetivo específico es: "${goal}".
      
      Genera una lista de 3 hábitos concretos, pequeños y realizables que pueda empezar hoy.
      Devuelve SOLO una lista separada por el símbolo "|" sin numeración ni texto extra.
      Ejemplo: Beber un vaso de agua al despertar|Leer 5 páginas|Caminar 10 minutos
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (!text) return [];

    return text.split('|').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Error fetching habits:", error);
    return ["No se pudo conectar con el coach IA. Intenta más tarde."];
  }
};

export const motivateUser = async (points: number, streak: number): Promise<string> => {
  try {
     const prompt = `
      El usuario tiene ${points} puntos y una racha de ${streak} días.
      Escribe una frase motivacional muy corta (máximo 15 palabras) y enérgica para que siga así.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "¡Sigue así, vas genial!";
  } catch (e) {
    return "¡El éxito es la suma de pequeños esfuerzos!";
  }
}

export const getCategoryWisdom = async (category: Category): Promise<string> => {
    try {
        const prompt = `
            Dame un consejo corto, poderoso y científico o filosófico relacionado con la categoría "${category}" para motivar a alguien a mejorar.
            Menciona teorías famosas si aplica (ej: Pareto para laboral/productividad, Pomodoro, Kaizen, etc).
            Máximo 30 palabras.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || `${category} es clave para el equilibrio.`;
    } catch (e) {
        return "La disciplina es el puente entre metas y logros.";
    }
}
