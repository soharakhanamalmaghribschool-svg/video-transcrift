
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
    Your task is to break this transcript into logical, readable subtitle segments.
    Each segment should be roughly 3-7 words long or one short sentence.
    You must assign start and end timestamps (in seconds) to each segment, ensuring they are evenly distributed across the total duration of ${duration} seconds.
    The segments should not overlap. The first segment should start at 0.
    
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
                  text: { type: Type.STRING, description: "The subtitle text" }
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
    throw new Error("Failed to synchronize transcript using AI.");
  }
};
