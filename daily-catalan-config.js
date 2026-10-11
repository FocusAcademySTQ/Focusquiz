(function(root,factory){const api=factory(root.FocusDayCore);if(typeof module==='object'&&module.exports)module.exports=api;root.FocusDayCatalan=api;})(typeof window!=='undefined'?window:globalThis,function(Core){
  'use strict';
  if(!Core&&typeof require==='function')Core=require('./daily-subject-core');
  const AREAS=['orthography','morphology','syntax','reading','writing','vocabulary'];
  const skill=(id,area,title,levels,formats,prerequisites=[])=>({id,area,title,description:title,prerequisites,generator:{module:'catalan',activity:id},coverage:'available',exerciseModel:{levels,formats,masteryMinFormats:formats.length>1?2:1}});
  const CATALOG={
    'ca.orthography.accentuation':skill('ca.orthography.accentuation','orthography','Accentuació',[1,2,3],['classify','apply','sentence-error']),
    'ca.orthography.apostrophe':skill('ca.orthography.apostrophe','orthography','Apostrofació',[1,2],['choose','sentence-error']),
    'ca.morphology.categories':skill('ca.morphology.categories','morphology','Categories gramaticals',[1,2],['identify','context']),
    'ca.morphology.agreement':skill('ca.morphology.agreement','morphology','Concordança nominal i verbal',[1,2],['choose','repair'],['ca.morphology.categories']),
    'ca.syntax.subject':skill('ca.syntax.subject','syntax','Subjecte, verb i predicat',[1,2,3],['identify','implicit','error'],['ca.morphology.categories']),
    'ca.reading.comprehension':skill('ca.reading.comprehension','reading','Comprensió lectora',[1,2,3,4],['literal','reference','inference','supported-conclusion']),
    'ca.writing.cohesion':skill('ca.writing.cohesion','writing','Coherència i cohesió',[1,2,3],['connector','sentence-order','irrelevant-sentence']),
    'ca.vocabulary.context':skill('ca.vocabulary.context','vocabulary','Vocabulari en context',[1,2,3],['meaning','synonym','register'])
  };
  const rows=[
    ['ca.orthography.accentuation','identify-stress-type',1,'classify','word','ca-accentuation'],['ca.orthography.accentuation','apply-accentuation',2,'apply','word','ca-accentuation'],['ca.orthography.accentuation','repair-accentuation',3,'sentence-error','sentence','ca-accentuation'],
    ['ca.orthography.apostrophe','apply-apostrophe',1,'choose','phrase','ca-apostrophe'],['ca.orthography.apostrophe','repair-apostrophe',2,'sentence-error','sentence','ca-apostrophe'],
    ['ca.morphology.categories','identify-word-class',1,'identify','sentence','ca-word-classes'],['ca.morphology.categories','interpret-word-class',2,'context','sentence','ca-word-classes'],
    ['ca.morphology.agreement','apply-agreement',1,'choose','sentence','ca-agreement'],['ca.morphology.agreement','repair-agreement',2,'repair','worked-error','ca-agreement'],
    ['ca.syntax.subject','identify-subject',1,'identify','sentence','ca-subject'],['ca.syntax.subject','identify-implicit-subject',2,'implicit','sentence','ca-subject'],['ca.syntax.subject','diagnose-subject-verb-agreement',3,'error','worked-error','ca-subject'],
    ['ca.reading.comprehension','locate-explicit-information',1,'literal','short-text','ca-reading-literal'],['ca.reading.comprehension','resolve-reference',2,'reference','short-text','ca-reading-reference'],['ca.reading.comprehension','make-direct-inference',3,'inference','short-text','ca-reading-inference'],['ca.reading.comprehension','evaluate-supported-conclusion',4,'supported-conclusion','short-text','ca-reading-inference'],
    ['ca.writing.cohesion','select-connector',1,'connector','sentence-pair','ca-cohesion'],['ca.writing.cohesion','order-sentences',2,'sentence-order','sequence','ca-cohesion'],['ca.writing.cohesion','remove-irrelevant-sentence',3,'irrelevant-sentence','paragraph','ca-cohesion'],
    ['ca.vocabulary.context','infer-word-meaning',1,'meaning','sentence','ca-vocabulary'],['ca.vocabulary.context','select-contextual-synonym',2,'synonym','sentence','ca-vocabulary'],['ca.vocabulary.context','select-register',3,'register','dialogue','ca-vocabulary']
  ];
  const TARGETS=rows.map(([skillId,procedure,level,formatFamily,representation,lessonId])=>Object.freeze({skillId,procedure,level,formatFamily,representation,lessonId,estimatedMinutes:/reading|order|paragraph/.test(formatFamily)?2:1,cognitiveFormat:`${procedure}|${representation}|targeted|${level}|choice`}));
  const FORMAT_TAXONOMY=Object.fromEntries(TARGETS.map(t=>[`${t.skillId}:${t.formatFamily}`,[t.procedure,t.representation,/error|repair/.test(t.formatFamily)?'diagnose':/inference|conclusion/.test(t.formatFamily)?'infer':'apply',t.estimatedMinutes>1?2:1,'choice']]));
  const PREREQUISITES=Object.freeze({
    'apply-accentuation':[{skillId:'ca.orthography.accentuation',formatFamily:'classify',reason:'Aplicar l’accent requereix identificar abans la síl·laba tònica i el tipus de paraula.'}],
    'repair-agreement':[{skillId:'ca.morphology.agreement',formatFamily:'choose',reason:'Corregir la concordança requereix reconèixer primer gènere, nombre i persona.'}],
    'identify-implicit-subject':[{skillId:'ca.morphology.categories',formatFamily:'context',reason:'El subjecte el·líptic es dedueix a partir de la persona i el nombre del verb.'}],
    'make-direct-inference':[{skillId:'ca.reading.comprehension',formatFamily:'literal',reason:'Una inferència fiable parteix d’informació explícita ben localitzada.'}],
    'evaluate-supported-conclusion':[{skillId:'ca.reading.comprehension',formatFamily:'inference',reason:'Avaluar conclusions requereix diferenciar les pistes del text de la informació inventada.'}]
  });
  const engine=Core.createSubjectEngine({id:'catalan',areas:AREAS,catalog:CATALOG,targets:TARGETS});
  function describeFormat(question){const tuple=FORMAT_TAXONOMY[`${question.skill}:${question.formatFamily}`]||[question.procedure||'unspecified',question.representation||'unspecified',question.reasoningType||'apply',question.stepCount||1,question.answerType||question.type||'choice'];return {procedure:tuple[0],representation:tuple[1],reasoning:tuple[2],steps:tuple[3],responseType:tuple[4],formatKey:tuple.join('|')};}
  return {...engine,FORMAT_TAXONOMY,PREREQUISITES,describeFormat};
});
