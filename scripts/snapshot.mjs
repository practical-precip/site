import {updateSnapshot,readSnapshot} from "./published-content.mjs";
try {
  if(process.argv.includes("--update")) await updateSnapshot();
  else readSnapshot();
  console.log("Published content snapshot matches the selected metadata commits.");
} catch(error) { console.error(error.message); process.exitCode = 1; }
