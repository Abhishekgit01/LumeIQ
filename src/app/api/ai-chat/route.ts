import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are LumeIQ AI, the built-in assistant for the LumeIQ sustainability app. You are friendly, concise, and knowledgeable about:

- Eco-sustainability, carbon footprint reduction, green living tips
- The LumeIQ app features: Impact IQ score (ESG-based), eco activities tracking, photo-verified eco habits, green marketplace, carbon credit trading, transit tracking, daily eco challenges
- How users earn IQ points: cycling, walking, public transit, recycling, meatless meals, reusable bags, etc.
- Green fintech: carbon credits, ESG investments, sustainable spending scores
- The 3 pillars: Environmental (E), Social (S), Economic (Ec)
- Photo verification: EXIF metadata checks (timestamp freshness, GPS, camera info) + Google Cloud Vision AI

Keep responses SHORT (2-4 sentences max unless asked for detail). Use a warm, encouraging tone. If asked about something unrelated to sustainability or the app, gently redirect. Never reveal you are using Gemini or any specific AI model - you are "LumeIQ AI".`;

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json();

    // Build conversation for Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + (userContext ? `\n\nUser's current stats: ${JSON.stringify(userContext)}` : '') }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood! I\'m LumeIQ AI, ready to help with sustainability tips, app guidance, and eco-living advice. How can I help you today?' }],
      },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300,
          topP: 0.9,
        },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Gemini API error:', res.status, error);
      return NextResponse.json({ fallback: true, error: `Gemini API: ${res.status}` }, { status: 200 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json({ fallback: true, error: 'No response from Gemini' }, { status: 200 });
    }

    return NextResponse.json({ text, fallback: false });
  } catch (err: any) {
    console.error('AI chat error:', err);
    return NextResponse.json({ fallback: true, error: err.message }, { status: 200 });
  }
}
