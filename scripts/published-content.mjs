import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
export const root=fileURLToPath(new URL('../',import.meta.url));
const digest=content=>createHash('sha256').update(JSON.stringify(content)).digest('hex');
function pins(base){const out={};for(const name of ['guidance','datasets']){const entry=execFileSync('git',['ls-files','--stage',`metadata/${name}`],{cwd:base,encoding:'utf8'}).trim().split(/\s+/);if(entry[0]!=='160000')throw Error(`Missing submodule pointer metadata/${name}`);out[name]=entry[1];}return out;}
export function readSnapshot(base=root){
 const snap=JSON.parse(readFileSync(resolve(base,'published-content.json'),'utf8'));
 if(snap.version!==1||digest(snap.content)!==snap.sha256)throw Error('Published snapshot checksum/version is invalid. Regenerate it from metadata.');
 const expected=pins(base);for(const name of Object.keys(expected))if(expected[name]!==snap.revisions[name])throw Error(`Snapshot does not match metadata/${name} commit. Run npm run snapshot:update after staging the selected pointers.`);
 if(!snap.content.products?.length||!snap.content.topics?.length||!snap.content.columns?.length)throw Error('Published snapshot is incomplete.');
 return snap.content;
}
export async function updateSnapshot(base=root){
 if(process.env.SITE_CONTENT_MODE==='snapshot')throw Error('Cannot update a snapshot from another snapshot.');
 const {loadContent}=await import('./content.mjs');
 const revisions=pins(base);for(const name of Object.keys(revisions)){const actual=execFileSync('git',['rev-parse','HEAD'],{cwd:resolve(base,'metadata',name),encoding:'utf8'}).trim();if(actual!==revisions[name])throw Error(`Stage metadata/${name} before publishing its snapshot.`);const dirty=execFileSync('git',['status','--porcelain'],{cwd:resolve(base,'metadata',name),encoding:'utf8'});if(dirty.trim())throw Error(`metadata/${name} has uncommitted changes. Commit them before publishing.`);}
 const content=loadContent(base);writeFileSync(resolve(base,'published-content.json'),JSON.stringify({version:1,revisions,sha256:digest(content),content},null,2)+'\n');
}
