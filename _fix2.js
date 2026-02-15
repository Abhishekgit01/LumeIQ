const fs = require('fs');
const path = 'D:\\Project\\LumeIQ\\src\\components\\views\\MarketplaceView.tsx';
let code = fs.readFileSync(path, 'utf8');
const lines = code.split('\n');

// Find the old duplicate modals block (starts after line with "</>  )} " for finance tab close)
// and remove it up to the MARKETPLACE REWARDS comment
// The structure: line ~785 "</>" ~786 "          </>" ~787 "        )}" 
// Then lines 789-982 are old duplicate modals
// Then line 984 is MARKETPLACE REWARDS

// Find index of first "═══ PAY MODAL ═══" (the old duplicate)
let firstPayIdx = -1;
let rewardsIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('═══ PAY MODAL ═══') && firstPayIdx === -1) {
    firstPayIdx = i;
  }
  if (lines[i].includes('═══ MARKETPLACE REWARDS ═══') && firstPayIdx > -1) {
    rewardsIdx = i;
    break;
  }
}

console.log('First PAY MODAL at line:', firstPayIdx + 1);
console.log('MARKETPLACE REWARDS at line:', rewardsIdx + 1);

if (firstPayIdx > -1 && rewardsIdx > -1) {
  // Also need to remove the premature closing tags before the old modals
  // Lines before firstPayIdx should be the finance tab's Carbon Offset section ending with </section>
  // Then we need to NOT close the fragment yet (remove </> and )} before the old modals)
  
  // Find the </> and )} that close the finance fragment prematurely
  let closeFragIdx = -1;
  let closeTernaryIdx = -1;
  for (let i = firstPayIdx - 1; i >= firstPayIdx - 5; i--) {
    if (lines[i].trim() === '</>') closeFragIdx = i;
    if (lines[i].trim() === ')}') closeTernaryIdx = i;
  }
  console.log('Close fragment at line:', closeFragIdx + 1);
  console.log('Close ternary at line:', closeTernaryIdx + 1);
  
  // Remove: closeFragIdx, closeTernaryIdx, and lines from firstPayIdx to rewardsIdx-1
  // Keep the MARKETPLACE REWARDS line
  let toRemove = new Set();
  if (closeFragIdx > -1) toRemove.add(closeFragIdx);
  if (closeTernaryIdx > -1) toRemove.add(closeTernaryIdx);
  for (let i = firstPayIdx; i < rewardsIdx; i++) {
    toRemove.add(i);
  }
  
  const newLines = lines.filter((_, i) => !toRemove.has(i));
  code = newLines.join('\n');
  
  // Now find the second set of modals + closing and check if there's a duplicate closing
  // The new structure should be: ...Transactions...</AnimatePresence> then </div></section></></)  then modals
  // But we already have the proper closing from the previous edit
  
  fs.writeFileSync(path, code, 'utf8');
  console.log('DONE - removed', toRemove.size, 'lines');
} else {
  console.log('SKIP - patterns not found');
}
