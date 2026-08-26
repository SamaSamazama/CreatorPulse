import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const coachModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction: "You are CreatorPulse AI, an expert YouTube channel coach. Provide highly specific, data-driven advice." });
export const scriptModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction: "You are an expert YouTube scriptwriter. Write engaging scripts with [VISUAL] and [AUDIO] cues." });
