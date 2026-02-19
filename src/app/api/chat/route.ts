import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GOOGLE_CLOUD_VISION_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY || '';
const MODEL = 'gemini-2.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are EcoBot, the AI assistant for LumeIQ — an eco-sustainability rewards app. You help users:

1. Understand their eco-impact (CO2 saved, green streaks, IQ points)
2. Suggest ways to earn more IQ points (public transport, vegan meals, recycling, cycling)
3. Explain how photo verification works (EXIF check, freshness, GPS, camera validation)
4. Answer questions about the marketplace, eco-investments, and green goals
5. Motivate users to maintain green streaks and improve their sustainability score

Key facts about LumeIQ:
- Users earn IQ points by logging verified eco-actions (cycling, public transit, vegan meals, recycling)
- Photos must be taken within 5 minutes and from a real camera (EXIF verified)
- Trust Score affects point multiplier (1.0x at 100%, down to 0.3x if flagged)
- Marketplace has eco-friendly products purchasable with IQ points
- EcoSpace shows nearby eco-friendly locations
- Carbon footprint is tracked daily/weekly/monthly

Be concise, friendly, and encouraging. Use short paragraphs. If asked something unrelated to sustainability or the app, gently redirect.`;

// Simulated AI responses as fallback
const SIMULATED_RESPONSES: Record<string, string> = {
  'default': "I can help you with your eco-journey! Try asking about how to earn more IQ points, your carbon footprint, or tips for sustainable living.",
  'points': "Here are the best ways to earn IQ points:\n\n• **Cycle to work** — 50 IQ per trip\n• **Take public transport** — 30 IQ per trip\n• **Eat a vegan meal** — 20 IQ per meal\n• **Recycle properly** — 15 IQ per action\n• **Use reusable bags** — 10 IQ per shopping trip\n\nRemember: photos must be taken fresh (within 5 min) from your camera for verification!",
  'verify': "**How Photo Verification Works:**\n\n1. Take a photo with your phone camera (not gallery)\n2. Our system checks EXIF metadata:\n   - **Timestamp** — must be within 5 minutes\n   - **Camera info** — must be from a real device\n   - **GPS** — optional but boosts trust score\n3. Google Cloud Vision AI analyzes the image content\n4. If everything checks out, you earn your IQ points!\n\nScreenshots and downloaded images will be rejected.",
  'trust': "**Your Trust Score** determines your IQ point multiplier:\n\n• **100%** = 1.0x multiplier (full points)\n• **75-99%** = 0.8x multiplier\n• **50-74%** = 0.5x multiplier\n• **Below 50%** = 0.3x multiplier\n\nTo keep it high: always use fresh photos, don't submit duplicates, and add receipts when possible.",
  'carbon': "**Understanding Your Carbon Footprint:**\n\nThe average person produces ~4.5 tons of CO2/year. LumeIQ tracks how much you save:\n\n• Cycling instead of driving saves ~0.21 kg CO2/km\n• Public transit saves ~0.14 kg CO2/km vs car\n• Vegan meals save ~2.5 kg CO2 vs meat meals\n\nCheck your Activities tab for your personal impact dashboard!",
  'streak': "**Green Streaks** reward consistency!\n\n• Log at least 1 eco-action per day to maintain your streak\n• 7-day streak = 2x bonus points\n• 30-day streak = 5x bonus + exclusive badge\n• Streaks reset at midnight if no action is logged\n\nTip: Even a small action like recycling counts!",
  'marketplace': "**The LumeIQ Marketplace** lets you spend IQ points on eco-friendly products:\n\n• Reusable water bottles, bags, and containers\n• Organic food and eco-certified items\n• Plant-based products\n• Sustainable fashion\n\nEarn points through eco-actions and shop sustainably!",
};

function getSimulatedResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('point') || lower.includes('earn') || lower.includes('iq')) return SIMULATED_RESPONSES['points'];
  if (lower.includes('verif') || lower.includes('photo') || lower.includes('proof') || lower.includes('exif')) return SIMULATED_RESPONSES['verify'];
  if (lower.includes('trust') || lower.includes('score') || lower.includes('fraud')) return SIMULATED_RESPONSES['trust'];
  if (lower.includes('carbon') || lower.includes('co2') || lower.includes('footprint') || lower.includes('emission')) return SIMULATED_RESPONSES['carbon'];
  if (lower.includes('streak') || lower.includes('daily') || lower.includes('consecutive')) return SIMULATED_RESPONSES['streak'];
  if (lower.includes('market') || lower.includes('shop') || lower.includes('buy') || lower.includes('store')) return SIMULATED_RESPONSES['marketplace'];
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return "Hey there! I'm LumeIQ AI, your sustainability assistant. How can I help you today? Ask me about earning IQ points, your carbon impact, or anything eco-related!";
  if (lower.includes('tip') || lower.includes('suggest') || lower.includes('advice')) return "**Quick Eco Tips:**\n\n1. Bike or walk for trips under 3km\n2. Bring your own bags and containers\n3. Choose plant-based meals 2-3x per week\n4. Sort your waste properly for recycling\n5. Use public transport for longer commutes\n\nEvery small action counts toward a greener planet!";
  return SIMULATED_RESPONSES['default'];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    const history = body?.history;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Try Gemini first
    if (GEMINI_API_KEY) {
      try {
        const contents = [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Understood! I\'m EcoBot, ready to help with all things sustainability and LumeIQ. How can I help?' }] },
          ...(history || []).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ];

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 400,
                topP: 0.9,
              },
            }),
            signal: controller.signal,
          });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return NextResponse.json({ reply: text, source: 'gemini' });
          }
        }
        // Fall through to simulated if Gemini fails
      } catch {
        // Gemini failed, use simulated
      }
    }

    // Fallback: simulated AI
    const reply = getSimulatedResponse(message);
    return NextResponse.json({ reply, source: 'simulated' });
  } catch {
    return NextResponse.json(
      { reply: getSimulatedResponse(''), source: 'simulated' },
      { status: 200 }
    );
  }
}
