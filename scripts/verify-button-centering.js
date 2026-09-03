const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'www/css/app.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'www/index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const must = (condition, message) => { if (!condition) throw new Error(message); };

const platform = pkg.name.includes('google-play') ? 'android' : 'ios';
const buildId = `8.7.59-r163-codemagic-final-${platform}`;
const marker = 'R46 WEB · COMPLETE SHORT-ACTION CENTERING PASS';
const markerAt = css.lastIndexOf(marker);
must(markerAt >= 0, 'final short-action centering pass is missing');
const finalPass = css.slice(markerAt);

for (const needle of [
  '#modalBox .mrow',
  'justify-items:center!important',
  '#modalBox .mrow:has(>.btn:only-child)>.btn',
  '#modalBox.accountModal .accountActions',
  'align-items:center!important',
  '#modalBox.accountModal .accountActions>.btn',
  '#modalBox.accountModal.cloudStatusModal .accountActions>#cloudSyncNow',
  'width:calc(100% - 24px)!important',
  '.mxFirstUseActions,.mxDeleteActions,.aboutActions,.nobelShareActions',
  '#profileScr #profileBack',
  'margin-left:auto!important',
  'margin-right:auto!important',
]) must(finalPass.includes(needle), `missing centering contract: ${needle}`);

must(markerAt > css.lastIndexOf('#modalBox.accountModal .accountActions .btn{'), 'centering pass must follow legacy account margin resets');
must(index.includes(`window.__MX_BUILD_ID__='${buildId}'`), 'centered platform build id missing');

for (const selector of [
  '#modalBox.winResultModal #mNext',
  '#modalBox.winResultModal #mBonusNow',
  '#modalBox:has(#newNameInput) #newNameCancel',
  '#modalBox.deleteProfileModal .mxDeleteActions',
  '#modalBox #mMechanicTry',
  '#profileScr #profileBack',
]) must(css.includes(selector), `known short-button family missing: ${selector}`);

console.log(`Full-game short-button centering checks passed for ${platform}.`);
