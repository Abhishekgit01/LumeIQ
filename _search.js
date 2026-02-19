const fs = require('fs');
const lines = fs.readFileSync('src/components/views/ActivitiesView.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (/capturePhoto|Upload.*Proof|upload.*impact|verifyWith|handleUpload|impact.*proof|showVerif|proofImage/i.test(l)) {
    console.log((i + 1) + ': ' + l.trim());
  }
});
