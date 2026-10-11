#!/usr/bin/env node
global.FocusDayCore=require('../daily-subject-core');
const report=require('../daily-catalan-audit').audit();
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else {console.log(`FocusDay Català: ${report.procedures} procediments, ${report.independentContents} continguts independents`);for(const row of report.rows)console.log(`${row.area}\t${row.procedure}\t${row.independentContents} continguts\t${row.issues.join(', ')||'cobertura mínima correcta'}`);}
process.exitCode=report.issues.length?1:0;
