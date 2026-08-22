import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with API Key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert File to base64 buffer for Gemini API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const imagePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: file.type
      }
    };

    // Use Gemini 1.5 Flash - it is extremely fast and great for vision tasks
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Strict prompt to force JSON format based on user request
    const prompt = `
    You are an AI tasked with analyzing images of streets, trash bins, or urban areas for a smart waste management system.
    Analyze the provided image and return a JSON response strictly matching this structure:
    {
      "severity_score": number (0 to 100, representing how overflowing, messy, or hazardous the area is),
      "dispatch_required": boolean (true if severity is high enough to warrant sending a garbage truck immediately, false otherwise),
      "analysis_summary": string (a very brief 1-sentence description of the mess or context)
    }
    Make sure to only return valid JSON. Do not include markdown formatting like \`\`\`json.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting if the model adds it
    text = text.replace(/```json\n?|```/g, '').trim();

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
