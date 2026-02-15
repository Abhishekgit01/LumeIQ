import { NextRequest, NextResponse } from 'next/server';

const VISION_API_KEY = process.env.GOOGLE_CLOUD_VISION_API_KEY;
const VISION_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

// Map eco action modes to keywords that Vision AI should detect
const MODE_KEYWORDS: Record<string, string[]> = {
  'transit': ['bicycle', 'bike', 'bus', 'train', 'subway', 'metro', 'tram', 'cycling', 'walking', 'pedestrian', 'scooter', 'electric vehicle', 'rail', 'station', 'platform', 'ticket', 'commute', 'public transport', 'road', 'street', 'vehicle', 'car', 'transport'],
  'plant-based': ['food', 'vegetable', 'fruit', 'salad', 'meal', 'plant', 'vegan', 'dish', 'plate', 'bowl', 'cooking', 'kitchen', 'grocery', 'produce', 'organic', 'green', 'leaf', 'herb', 'grain', 'legume', 'tofu', 'rice', 'bread'],
  'thrift': ['clothing', 'shirt', 'jacket', 'dress', 'pants', 'shoe', 'bag', 'store', 'shop', 'rack', 'hanger', 'fabric', 'textile', 'vintage', 'secondhand', 'market', 'fashion', 'garment', 'wardrobe', 'apparel'],
  'repair': ['tool', 'wrench', 'screwdriver', 'hammer', 'sewing', 'needle', 'thread', 'workshop', 'fix', 'broken', 'electronics', 'machine', 'appliance', 'furniture', 'wood', 'metal', 'glue', 'tape', 'workbench'],
  'minimal': ['reusable', 'bottle', 'container', 'bag', 'compost', 'recycle', 'bin', 'waste', 'trash', 'clean', 'solar', 'panel', 'energy', 'light', 'bulb', 'thermostat', 'switch', 'power', 'meter', 'nature'],
};

export async function POST(req: NextRequest) {
  try {
    if (!VISION_API_KEY) {
      return NextResponse.json({ error: 'Vision API key not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { image, modeId } = body;

    if (!image || !modeId) {
      return NextResponse.json({ error: 'Missing image or modeId' }, { status: 400 });
    }

    // Strip the data URL prefix to get raw base64
    const base64Image = image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    // Call Google Cloud Vision API
    const visionResponse = await fetch(VISION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 20 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
              { type: 'WEB_DETECTION', maxResults: 5 },
            ],
          },
        ],
      }),
    });

    if (!visionResponse.ok) {
      const errText = await visionResponse.text();
      console.error('Vision API error:', errText);
      const status = visionResponse.status;
      if (status === 401 || status === 403) {
        return NextResponse.json({
          error: 'Invalid API key. Google Cloud Vision API keys start with "AIza...". Please check your GOOGLE_CLOUD_VISION_API_KEY in .env.',
        }, { status: 401 });
      }
      return NextResponse.json({ error: 'Vision API request failed', details: errText }, { status: 502 });
    }

    const visionData = await visionResponse.json();
    const response = visionData.responses?.[0];

    if (!response) {
      return NextResponse.json({ verified: false, confidence: 0, labels: [], reason: 'No response from Vision API' });
    }

    // Collect all detected labels/objects
    const detectedLabels: string[] = [];

    // From label detection
    if (response.labelAnnotations) {
      for (const label of response.labelAnnotations) {
        detectedLabels.push(label.description.toLowerCase());
      }
    }

    // From object localization
    if (response.localizedObjectAnnotations) {
      for (const obj of response.localizedObjectAnnotations) {
        detectedLabels.push(obj.name.toLowerCase());
      }
    }

    // From web detection
    if (response.webDetection?.webEntities) {
      for (const entity of response.webDetection.webEntities) {
        if (entity.description) {
          detectedLabels.push(entity.description.toLowerCase());
        }
      }
    }

    // Match against mode keywords
    const keywords = MODE_KEYWORDS[modeId] || [];
    const matchedLabels = detectedLabels.filter(label =>
      keywords.some(keyword => label.includes(keyword) || keyword.includes(label))
    );

    const confidence = keywords.length > 0
      ? Math.min(1, matchedLabels.length / 3) // 3+ matches = 100% confidence
      : 0;

    const verified = confidence >= 0.33; // At least 1 match

    return NextResponse.json({
      verified,
      confidence: Math.round(confidence * 100),
      matchedLabels: [...new Set(matchedLabels)],
      allLabels: [...new Set(detectedLabels)].slice(0, 15),
      reason: verified
        ? `Detected: ${[...new Set(matchedLabels)].join(', ')}`
        : `No matching eco-action detected. Found: ${detectedLabels.slice(0, 5).join(', ')}`,
    });
  } catch (error) {
    console.error('Verify action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
