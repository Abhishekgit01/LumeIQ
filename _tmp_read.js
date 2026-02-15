const f = require('fs').readFileSync('D:/Project/LumeIQ/src/components/views/MarketplaceView.tsx','utf8');
const lines = f.split('\n');
for(let i = 315; i < 335 && i < lines.length; i++) {
  console.log((i+1)+': '+lines[i]);
}
console.log('===610-650===');
for(let i = 609; i < 650 && i < lines.length; i++) {
  console.log((i+1)+': '+lines[i]);
}
console.log('===785-870===');
for(let i = 784; i < 870 && i < lines.length; i++) {
  console.log((i+1)+': '+lines[i]);
}
