const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),www=path.join(root,'www');
const must=(v,m)=>{if(!v){console.error('R200 WWW FAIL:',m);process.exit(1);}};
const index=fs.readFileSync(path.join(www,'index.html'),'utf8');
const local=[];
for(const re of [/\b(?:src|href)=["']([^"']+)["']/g,/url\(["']?([^"')]+)["']?\)/g]){
  let m; while((m=re.exec(index))){const v=m[1]; if(!v||/^(?:https?:|data:|blob:|#|mailto:|tel:)/i.test(v)) continue; local.push(v.split('?')[0].split('#')[0]);}
}
for(const rel of local){const p=path.resolve(www,rel); must(p.startsWith(www),`path escape: ${rel}`); must(fs.existsSync(p),`missing index asset: ${rel}`);}
const off=fs.readFileSync(path.join(www,'offline-manifest-r193.js'),'utf8');
for(const m of off.matchAll(/["']\.\/([^"']+)["']/g)){const rel=m[1]; must(fs.existsSync(path.join(www,rel)),`missing offline asset: ${rel}`);}
const required=['js/game.js','js/firebase.js','js/smart-hint-worker.js','js/movement-core.js','js/campaign-levels.js','js/campaign-targets-r180.js','css/app.css','assets/images/bg-default.webp'];
for(const rel of required)must(fs.existsSync(path.join(www,rel)),`required file missing: ${rel}`);
const game=fs.readFileSync(path.join(www,'js/game.js'),'utf8');
must(game.includes("new Worker('js/smart-hint-worker.js?v=R199-FREE-FIRST-STRATEGIC-HINT')"),'R199 smart-hint worker identity missing');
must(game.includes('function stoneDoodle('),'R200 stone doodle function missing');
must(game.includes('T*.43'),'R200 doodle scale missing');
console.log(`R200 WWW integrity passed: ${new Set(local).size} shell refs checked.`);
