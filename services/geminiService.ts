
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface EssayRubricBreakdown {
  knowledge: number; // Max 8
  reasoning: number; // Max 6
  communication: number; // Max 6
}

export interface GranularGradeResult {
  scores: number[];
  comments: string[];
  overallFeedback: string;
  rubricBreakdowns?: EssayRubricBreakdown[];
}

export const geminiService = {
  async gradeGranularStructural(questions: string[], answers: string[]): Promise<GranularGradeResult> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
          Analyze these ${questions.length} STPM History structural questions (Section A). 
          Each is worth 4 marks.
          Questions: ${JSON.stringify(questions)}
          Student Answers: ${JSON.stringify(answers)}
          
          For EACH answer, provide:
          1. A score (0-4).
          2. A specific constructive comment in Malay identifying "Kekuatan" (what was correct) and "Kelemahan" (what was missing or wrong).
          
          Be very direct and helpful for an STPM student.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
              comments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              overallFeedback: {
                type: Type.STRING,
              }
            },
            required: ["scores", "comments", "overallFeedback"]
          },
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("AI Structural Grading failed:", error);
      throw error;
    }
  },

  async gradeGranularEssay(questions: string[], answers: string[]): Promise<GranularGradeResult> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
          Analyze these STPM History essay questions based on the OFFICIAL RUBRIC:
          
          DIMENSI 1: PENGETAHUAN DAN KEFAHAMAN (Max 8)
          DIMENSI 2: TAAKULAN/REASONING (Max 6)
          DIMENSI 3: KOMUNIKASI (Max 6)
          Total = 20 Markah.

          Questions: ${JSON.stringify(questions)}
          Student Answers: ${JSON.stringify(answers)}
          
          For EACH essay, provide:
          1. Dimension scores.
          2. A detailed comment in Malay highlighting:
             - KEKUATAN: Analisis gaya penulisan, fakta yang tepat, atau hujah yang bernas.
             - KELEMAHAN: Apa yang perlu diperbaiki (contoh: kekurangan bukti, hujah kurang logik, atau bahasa kurang analitikal).
          
          Ensure the student understands exactly where they lost marks in their writing style.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
              rubricBreakdowns: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    knowledge: { type: Type.NUMBER },
                    reasoning: { type: Type.NUMBER },
                    communication: { type: Type.NUMBER }
                  },
                  required: ["knowledge", "reasoning", "communication"]
                }
              },
              comments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              overallFeedback: {
                type: Type.STRING,
              }
            },
            required: ["scores", "rubricBreakdowns", "comments", "overallFeedback"]
          },
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("AI Essay Grading failed:", error);
      throw error;
    }
  }
};
