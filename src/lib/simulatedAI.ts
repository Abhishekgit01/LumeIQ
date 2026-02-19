/**
 * Simulated AI responses when Gemini API is unavailable
 * Context-aware responses based on keywords in the user's message
 */

interface SimulatedResponse {
  text: string;
  suggestions?: string[];
}

const RESPONSES: Record<string, SimulatedResponse[]> = {
  greeting: [
    { text: "Hey there! I'm LumeIQ AI, your eco-sustainability companion. I can help you earn more IQ points, suggest green habits, explain app features, or chat about reducing your carbon footprint. What's on your mind?", suggestions: ['How do I earn points?', 'Suggest an eco habit', 'What is Impact IQ?'] },
    { text: "Welcome to LumeIQ AI! I'm here to help you make greener choices and boost your Impact IQ. Ask me anything about sustainability, the app, or how to maximize your eco-impact!", suggestions: ['Show my stats', 'Daily challenge tips', 'Green living tips'] },
  ],
  points: [
    { text: "You earn IQ points through verified eco-actions: cycling/walking commutes (live timer), photo-verified habits like meatless meals or reusable bags, public transit trips tracked via GPS, and completing daily eco challenges. The more consistent you are, the higher your tier!" },
    { text: "Points come from 4 main sources: 1) Activity timer (cycling, walking, jogging, metro) 2) Impact Boosters (photo-verified habits) 3) Transit tracking with real GPS routes 4) Daily calendar challenges. Each action also saves CO2!" },
  ],
  iq: [
    { text: "Impact IQ is your sustainability score from 0-100, calculated across 3 ESG pillars: Environmental (40%), Social (30%), and Economic (30%). Higher IQ unlocks better rewards, partner cashback rates, and marketplace discounts. Bronze → Silver → Gold → Platinum tiers!" },
  ],
  carbon: [
    { text: "Every eco-action saves CO2! Cycling saves ~150g/min vs driving, a meatless meal saves ~2.5kg, using public transit saves ~100g/min. Your total is tracked in the ESG Metrics dashboard. Even small changes compound — a daily cycle commute saves ~50kg CO2/month!" },
  ],
  tips: [
    { text: "Here are 3 quick wins for today: 1) Take a reusable bag to the store (+5 pts, 120g CO2 saved) 2) Try a plant-based lunch (+8 pts, 2.5kg CO2 saved) 3) Walk or cycle for one trip instead of driving. Small consistent actions beat occasional big ones!", suggestions: ['More tips', 'How to start composting?', 'Best eco habits'] },
    { text: "Top eco habits with highest impact: Skip meat 2x/week (saves 5kg CO2), cycle to work (3.5kg/trip), use refillable bottles (80g/day), cold wash laundry (500g/load), and buy local produce (600g saved on transport). Which interests you?", suggestions: ['Tell me about cycling', 'Meatless meal ideas', 'Local produce benefits'] },
  ],
  marketplace: [
    { text: "The LumeIQ Marketplace lets you spend your earned IQ points on eco-friendly products, sustainable fashion, organic groceries, and more. Higher Impact IQ = better discounts. Check the Marketplace tab and look for the Eco Finance section for green investments too!" },
  ],
  photo: [
    { text: "Photo verification works in 2 steps: First, we check EXIF metadata (timestamp must be within 5 minutes, camera device info, GPS location). Then Google Cloud Vision AI analyzes the image content. This prevents cheating with old/downloaded photos. Just take a fresh photo with your camera!" },
  ],
  transit: [
    { text: "The Transit Tracker uses real GPS to map your eco-friendly routes. Start tracking in the Activities tab — choose your mode (metro, bus, bike), enter start/end points, and we calculate exact CO2 savings compared to driving. Each trip earns IQ points and carbon credits!" },
  ],
  challenge: [
    { text: "Daily challenges rotate through 31 unique eco-tasks across all 3 pillars. Today's challenge is on your Eco Calendar — tap any day to see its challenge. Completing them earns 6-18 points and up to 4.1kg CO2 saved. Try to build a streak for bonus multipliers!" },
  ],
  finance: [
    { text: "LumeIQ's Green Fintech features include: Carbon Credit Trading (buy/sell credits from eco-actions), Green Micro-Investments (auto-invest into ESG funds), Eco Savings Goals (save by cutting carbon-heavy spending), and a Sustainable Spending Score. All accessible from the Finance section!" },
  ],
  default: [
    { text: "That's an interesting question! While I'm best at helping with sustainability and the LumeIQ app, I'd love to steer our chat toward eco-living. Want me to suggest ways to reduce your carbon footprint or explain an app feature?", suggestions: ['Eco tips for beginners', 'How does scoring work?', 'App features overview'] },
    { text: "I'm your eco-sustainability buddy, so I shine brightest on green living topics! Try asking me about earning points, reducing carbon footprint, daily challenges, or how the verification system works.", suggestions: ['How to earn more points', 'Carbon saving tips', 'What can I do today?'] },
  ],
};

function matchIntent(message: string): string {
  const lower = message.toLowerCase();
  
  if (/^(hi|hello|hey|sup|yo|good morning|good evening|howdy|greetings)/i.test(lower)) return 'greeting';
  if (/point|earn|reward|how.*get|score.*up/i.test(lower)) return 'points';
  if (/impact.*iq|what.*iq|iq.*score|iq.*mean|pillar|esg.*score/i.test(lower)) return 'iq';
  if (/carbon|co2|emission|footprint|co₂|greenhouse/i.test(lower)) return 'carbon';
  if (/tip|suggest|advice|recommend|idea|habit|green.*living|eco.*friendly|help.*environment/i.test(lower)) return 'tips';
  if (/market|shop|buy|product|store|purchase|spend.*point/i.test(lower)) return 'marketplace';
  if (/photo|verify|proof|camera|exif|upload|cheat/i.test(lower)) return 'photo';
  if (/transit|commute|bus|train|metro|bike|cycle|walk|route|gps|track/i.test(lower)) return 'transit';
  if (/challenge|daily|calendar|today.*task|streak/i.test(lower)) return 'challenge';
  if (/finance|invest|credit|saving|money|bank|payment/i.test(lower)) return 'finance';
  
  return 'default';
}

export function getSimulatedResponse(message: string, userContext?: any): SimulatedResponse {
  const intent = matchIntent(message);
  const options = RESPONSES[intent] || RESPONSES.default;
  const response = options[Math.floor(Math.random() * options.length)];
  
  // Add contextual info if available
  if (userContext && intent === 'points') {
    return {
      ...response,
      text: response.text + ` You currently have ${userContext.ecoPoints || 0} eco points and ${(userContext.greenCredits || 0).toFixed(1)} green credits.`,
    };
  }
  
  if (userContext && intent === 'iq') {
    return {
      ...response,
      text: response.text + ` Your current Impact IQ is ${userContext.iq || 0} (${userContext.tier || 'Bronze'} tier).`,
    };
  }
  
  return response;
}
