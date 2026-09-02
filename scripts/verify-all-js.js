const fs=require('fs');const path=require('path');const cp=require('child_process');
const root=path.resolve(__dirname,'..','www');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});}
const files=walk(root).filter(p=>p.endsWith('.js'));
for(const file of files){const r=cp.spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){process.stderr.write(r.stderr||r.stdout);process.exit(r.status||1);}}
console.log(`JavaScript syntax OK: ${files.length} files.`);
