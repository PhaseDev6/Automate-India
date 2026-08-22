import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize with the new unified Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to base64 for the Gemini API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Strict prompt to force a JSON response matching the user's specification
    const prompt = `
    You are an AI system for UrbanSweep, a smart urban waste management platform.
    Analyze the provided image and return ONLY a valid JSON object with this exact structure:
    {
      "severity_score": <number from 0 to 100>,
      "dispatch_required": <true or false>,
      "analysis_summary": "<one brief sentence describing what you see>"
    }
    Rules:
    - severity_score should reflect how urgent the waste situation is (0 = clean, 100 = critical hazard)
    - dispatch_required should be true if severity_score > 60
    - Do NOT include markdown formatting or code fences in your response. Return raw JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    let text = response.text ?? '';

    // Strip markdown code fences if the model adds them despite instructions
    text = text.replace(/```json\n?|```/g, '').trim();

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
