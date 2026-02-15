const fs = require('fs');
const path = 'D:/Project/LumeIQ/src/components/views/MarketplaceView.tsx';
let c = fs.readFileSync(path, 'utf8');

// Find and remove the Send Modal section
const sendStart = c.indexOf('{/* ═══ SEND MODAL ═══ */}');
if (sendStart === -1) { console.log('SEND MODAL not found'); } else {
  const afterSend = c.indexOf('</AnimatePresence>', sendStart);
  const sendEnd = afterSend + '</AnimatePresence>'.length;
  const beforeTrim = c.lastIndexOf('\n', sendStart - 1);
  const afterTrim = c.indexOf('\n', sendEnd);
  c = c.substring(0, beforeTrim) + c.substring(afterTrim);
  console.log('Removed Send Modal');
}

// Remove unused imports
c = c.replace(', Share2', '');
c = c.replace(', ExternalLink', '');
c = c.replace(', ArrowUpRight', '');
console.log('Cleaned imports');

// Replace pay button with bank-connect-aware version
const simpleOld = 'setCart(new Map()); setShowPayModal(false);';
const idx = c.indexOf(simpleOld);
if (idx !== -1) {
  const btnStart = c.lastIndexOf('<button', idx);
  const btnEnd = c.indexOf('</button>', idx) + '</button>'.length;
  const replacement = `{bankConnected ? (
                        <button onClick={() => { setCart(new Map()); setShowPayModal(false); }} className="w-full py-3.5 rounded-[14px] bg-gradient-to-r from-[#007aff] to-[#0055d4] text-white text-[15px] font-semibold ios-press flex items-center justify-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Pay {String.fromCharCode(8377)}{cartTotal}
                        </button>
                      ) : (
                        <button onClick={() => setShowBankConnect(true)} className="w-full py-3.5 rounded-[14px] bg-gradient-to-r from-[#5856d6] to-[#3634a3] text-white text-[15px] font-semibold ios-press flex items-center justify-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Connect Bank Account to Pay
                        </button>
                      )}`;
  c = c.substring(0, btnStart) + replacement + c.substring(btnEnd);
  console.log('Replaced pay button');
} else {
  console.log('Pay button not found');
}

// Add Bank Connect Modal before BILLS MODAL
const billsMarker = '{/* ═══ BILLS MODAL ═══ */}';
const billsIdx = c.indexOf(billsMarker);
if (billsIdx !== -1) {
  const bankModal = `{/* ═══ BANK CONNECT MODAL ═══ */}
            <AnimatePresence>
              {showBankConnect && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={() => setShowBankConnect(false)}>
                  <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', damping: 25 }} className="w-full max-w-[430px] bg-[var(--ios-card)] rounded-t-[24px] p-6" onClick={e => e.stopPropagation()}>
                    <div className="w-10 h-1 rounded-full bg-[var(--ios-separator)] mx-auto mb-5" />
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-[14px] bg-[#5856d615] flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-[#5856d6]" />
                      </div>
                      <div>
                        <h3 className="text-[18px] font-bold text-[var(--ios-label)]">Connect Bank Account</h3>
                        <p className="text-[13px] text-[var(--ios-tertiary-label)]">Link your bank to make payments</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-5">
                      <div>
                        <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">Bank Name</label>
                        <select value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-4 py-3 rounded-[12px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] outline-none border border-[var(--ios-separator)]">
                          <option value="">Select your bank</option>
                          <option value="SBI">State Bank of India</option>
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="Axis">Axis Bank</option>
                          <option value="Kotak">Kotak Mahindra Bank</option>
                          <option value="PNB">Punjab National Bank</option>
                          <option value="BOB">Bank of Baroda</option>
                          <option value="Canara">Canara Bank</option>
                          <option value="IndusInd">IndusInd Bank</option>
                          <option value="Yes">Yes Bank</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">Account Number</label>
                        <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value.replace(/\\D/g, ''))} placeholder="Enter account number" maxLength={18} className="w-full px-4 py-3 rounded-[12px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] outline-none border border-[var(--ios-separator)]" />
                      </div>
                      <div>
                        <label className="text-[12px] font-medium text-[var(--ios-secondary-label)] mb-1 block">IFSC Code</label>
                        <input type="text" value={bankIfsc} onChange={e => setBankIfsc(e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" maxLength={11} className="w-full px-4 py-3 rounded-[12px] bg-[var(--ios-bg)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] outline-none border border-[var(--ios-separator)] font-mono" />
                      </div>
                    </div>
                    <div className="p-3 rounded-[12px] bg-[#ff9f0a10] border border-[#ff9f0a30] mb-4 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#ff9f0a] mt-0.5 shrink-0" />
                      <p className="text-[11px] text-[#ff9f0a]">Your bank details are encrypted and secured with 256-bit encryption.</p>
                    </div>
                    <button disabled={!bankName || bankAccount.length < 8 || bankIfsc.length < 11 || bankConnecting} onClick={() => { setBankConnecting(true); setTimeout(() => { setBankConnected(true); setBankConnecting(false); setShowBankConnect(false); }, 2000); }} className="w-full py-3.5 rounded-[14px] bg-gradient-to-r from-[#5856d6] to-[#3634a3] text-white text-[15px] font-semibold ios-press flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none">
                      {bankConnecting ? (<><Loader2 className="w-5 h-5 animate-spin" />Verifying...</>) : (<><Lock className="w-5 h-5" />Connect Securely</>)}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            `;
  c = c.substring(0, billsIdx) + bankModal + c.substring(billsIdx);
  console.log('Added Bank Connect Modal');
}

// Add bank connected indicator in pay modal
const payModalTitle = '<p className="text-[13px] text-[var(--ios-tertiary-label)]">{cartCount} items in your cart</p>';
if (c.includes(payModalTitle)) {
  c = c.replace(payModalTitle, payModalTitle + `
                        {bankConnected && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759]" />
                            <span className="text-[11px] font-medium text-[#34c759]">{bankName} Bank Connected</span>
                          </div>
                        )}`);
  console.log('Added bank connected badge');
}

// Update cart bar text
const cartViewText = '<p className="text-[14px] font-bold">View Cart</p>';
if (c.includes(cartViewText)) {
  c = c.replace(cartViewText, '<p className="text-[14px] font-bold">Pay Now</p>');
  console.log('Updated cart bar');
}

fs.writeFileSync(path, c, 'utf8');
console.log('DONE');
