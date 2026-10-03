(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.FocusDailyAnswer=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const fraction=value=>{const match=String(value).trim().replace(',','.').match(/^(-?\d+)\s*\/\s*(-?\d+)$/);if(!match||Number(match[2])===0)return null;return Number(match[1])/Number(match[2]);};
  const numeric=value=>{const cleaned=String(value).trim().replace(',','.').replace(/\s*(cm²|m²|km²|mm²|cm|mm|km|m|kg|g|mg|l|ml|€|%|min|h)$/i,'');const result=Number(cleaned);return Number.isFinite(result)?result:null;};
  function validate(value,exercise){
    const expected=String(exercise.answer),spec=exercise.answerSpec||{};
    if(spec.kind==='fraction'||expected.includes('/')){const a=fraction(value),b=fraction(expected);return {correct:a!==null&&b!==null&&Math.abs(a-b)<=1e-10,normalized:a};}
    if(spec.kind==='number'||typeof exercise.answer==='number'||exercise.numeric!==undefined){const a=numeric(value),b=numeric(expected),tolerance=Number.isFinite(spec.tolerance)?spec.tolerance:0;return {correct:a!==null&&b!==null&&Math.abs(a-b)<=tolerance,normalized:a,tolerance};}
    return {correct:String(value).trim().toLocaleLowerCase('ca')===expected.trim().toLocaleLowerCase('ca'),normalized:String(value).trim()};
  }
  return {validate,fraction,numeric};
});
