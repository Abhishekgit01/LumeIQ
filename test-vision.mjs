const r = await fetch('http://localhost:3000/api/verify-action', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ modeId: 'transit', image: 'dGVzdA==' }),
});
const d = await r.json();
console.log(JSON.stringify(d, null, 2));
