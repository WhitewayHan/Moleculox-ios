import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../www/js/game-r160.js',import.meta.url),'utf8');
const match=source.match(/function mxEnsureIOSAuthChoices\(c,member\)\{[\s\S]*?\n\}\n\nfunction openAccountModal/);
assert(match, 'native iOS guest-account render repair must exist');
const method=match[0].replace(/\n\nfunction openAccountModal$/,'');
function createContext(native,initial=[]){
  const controls=new Map();
  const actions={classList:{add:c=>{actions.flag=c;}},querySelector:sel=>{
    if(sel==='.accountUtilityRow')return {utility:true};
    if(sel==='.accountDivider')return controls.get('divider');
    return controls.get(sel.slice(1));
  },insertBefore:(el,before)=>{controls.set(el.id||'divider',el);},appendChild:el=>controls.set(el.id||'divider',el)};
  for(const id of initial)controls.set(id,{id,hidden:false,style:{removeProperty(){}}});
  const root={querySelector:sel=>sel==='.accountActions'?actions:null};
  const ctx={MX_IOS_NATIVE:native,$:sel=>sel==='#modalBox'?root:null,document:{createElement:tag=>({tagName:tag,style:{removeProperty(){}},className:'',textContent:''})}};
  vm.runInNewContext(method+';globalThis.run=mxEnsureIOSAuthChoices;',ctx);
  return {run:ctx.run,controls,actions};
}
const copy={google:'Continue with Google',emailLogin:'Sign in with email',emailCreate:'Create email account',or:'OR'};
test('native iOS guest gets Google + both email choices even if modal HTML omitted them',()=>{
  const {run,controls,actions}=createContext(true);
  run(copy,false);
  for(const id of ['accGoogle','accEmailLogin','accEmailCreate']){
    const btn=controls.get(id);
    assert(btn, `${id} absent`);
    assert.equal(btn.hidden,false);
    assert.equal(btn.tagName,'button');
  }
  assert.equal(actions.flag,'mxIOSAllAuthChoices');
});
test('native iOS guest does not replace existing controls (retains original handlers)',()=>{
  const {run,controls}=createContext(true,['accGoogle','accEmailLogin','accEmailCreate']);
  const old=controls.get('accGoogle');run(copy,false);
  assert.equal(controls.get('accGoogle'),old);
});
test('native member does not get unintended login switch; Android/web unchanged',()=>{
  const member=createContext(true);member.run(copy,true);assert.equal(member.controls.size,0);
  const web=createContext(false);web.run(copy,false);assert.equal(web.controls.size,0);
});
test('account modal has all auth listeners and release identifier',()=>{
  const modal=source.slice(source.indexOf('function openAccountModal(message,good){'),source.indexOf('function authFormShell('));
  for(const s of ["id=\"accApple\"","id=\"accGoogle\"","id=\"accEmailLogin\"","id=\"accEmailCreate\"","nativeGoogleSignIn(google)","openEmailLogin()","openEmailCreate()","mxEnsureIOSAuthChoices(c,member);"]){
    assert(modal.includes(s),`missing ${s}`);
  }
  assert(modal.includes('v8.7.238 · R392 · Apple / Google / Email'));
});
