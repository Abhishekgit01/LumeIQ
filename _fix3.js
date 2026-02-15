const fs = require('fs');
const lines = fs.readFileSync('D:\\Project\\LumeIQ\\src\\components\\views\\MarketplaceView.tsx', 'utf8').split('\n');
console.log('Total lines:', lines.length);
console.log('Line 959:', lines[958]);
console.log('Line 960:', lines[959]);
console.log('Line 1156:', lines[1155] || 'DOES NOT EXIST');
