const fs = require('fs');
const s = fs.readFileSync('src/components/views/MarketplaceView.tsx', 'utf8');
const lines = s.split('\n');
lines.forEach((l, i) => {
  if (l.includes('z-[') && l.includes('fixed')) console.log(`${i+1}: ${l.trim().substring(0, 120)}`);
});
