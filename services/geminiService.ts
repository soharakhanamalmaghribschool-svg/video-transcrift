import { GoogleGenAI, Type } from "@google/genai";
import { SubtitleSegment } from "../types";

export const processTranscriptWithAI = async (
  transcript: string,
  duration: number
): Promise<SubtitleSegment[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    I have a video that is exactly ${duration} seconds long.
    I have a transcript of this video. 
    Your task is to break this transcript into meaningful, high-impact subtitle segments.
    
    CRITICAL RULES:
    1. Do NOT break sentences into tiny pieces. Group complete thoughts, long phrases, or even 2-3 short sentences together if they are spoken quickly.
    2. Each segment should represent a "syllable-heavy" block of text that stays on screen long enough to be readable.
    3. The segments must be synchronized with the total duration of ${duration} seconds.
    4. Detect the natural flow of the text. If the text looks dense, assume fast speech and create longer text blocks with longer time durations.
    5. The first segment MUST start at 0. The last segment MUST end at ${duration}.
    6. Ensure NO overlaps in timestamps.
    
    Transcript:
    "${transcript}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["segments"],
          properties: {
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["startTime", "endTime", "text"],
                properties: {
                  startTime: { type: Type.NUMBER, description: "Start time in seconds" },
                  endTime: { type: Type.NUMBER, description: "End time in seconds" },
                  text: { type: Type.STRING, description: "The full phrase or sentence block" }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text);
    return result.segments.map((s: any, index: number) => ({
      ...s,
      id: `seg-${index}`
    }));
  } catch (error) {
    console.error("AI Processing Error:", error);
    throw new Error("Failed to synchronize transcript. The AI might be having trouble with the transcript density.");
  }
};