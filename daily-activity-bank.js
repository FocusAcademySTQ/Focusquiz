(function(root){
  'use strict';
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const int=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  const choiceQuestion=(formatId,text,answer,distractors,explanation,html='')=>({type:'choice',formatId,text,html,answer:String(answer),choices:shuffle([String(answer),...distractors.map(String)].filter((v,i,a)=>a.indexOf(v)===i)).slice(0,4),explanation});
  const barChart=(labels,values,label)=>{const max=Math.max(...values),bars=values.map((v,i)=>{const h=120*v/max,x=45+i*65;return `<g><rect x="${x}" y="${155-h}" width="38" height="${h}" rx="4"/><text x="${x+19}" y="175" text-anchor="middle">${labels[i]}</text><text x="${x+19}" y="${145-h}" text-anchor="middle">${v}</text></g>`}).join('');return `<svg class="daily-visual" viewBox="0 0 320 195" role="img" aria-label="Gràfic de barres de ${label}: ${labels.map((l,i)=>`${l}, ${values[i]}`).join('; ')}"><line x1="32" y1="155" x2="300" y2="155"/>${bars}</svg>`;};
  const numberLine=(values)=>{const min=0,max=1,w=300;return `<svg class="daily-visual" viewBox="0 0 340 100" role="img" aria-label="Recta numèrica de zero a u"><line x1="20" y1="50" x2="320" y2="50"/><text x="20" y="78">0</text><text x="315" y="78">1</text>${values.map(v=>`<circle cx="${20+(v-min)/(max-min)*w}" cy="50" r="6"/><text x="${20+v*w}" y="30" text-anchor="middle">${v}</text>`).join('')}</svg>`;};

  function decimals(level,opts={}){
    const format=opts.formatFamily||pick(['compare','order','representation','application']);
    if(format==='order'){
      const pool=new Set();while(pool.size<3)pool.add(+(int(12,89)/100).toFixed(2));const vals=shuffle([...pool]);const sorted=[...vals].sort((a,b)=>a-b).join(' < ');
      return choiceQuestion('decimal-order','Quin ordre és correcte, de menor a major?',sorted,[[...vals].sort((a,b)=>b-a).join(' < '),`${vals[0]} < ${vals[2]} < ${vals[1]}`,`${vals[1]} < ${vals[0]} < ${vals[2]}`],'Compara primer les dècimes i després les centèsimes.',numberLine([...vals].sort((a,b)=>a-b)));
    }
    if(format==='representation'){
      const p=pick([10,20,25,40,50,75]);const d=p/100;return choiceQuestion('decimal-fraction-percent',`Quina expressió equival a ${d}?`,`${p}%`,[`${p/10}%`,`${100-p}%`,`${p}0%`],'Per passar un decimal a percentatge, multiplica per 100.');
    }
    if(format==='application'){
      const price=pick([20,40,60,80]),off=pick([10,25,50]),answer=price*(1-off/100);return choiceQuestion('percent-discount-context',`Una motxilla val ${price} € i té un ${off}% de descompte. Quin és el preu final?`,answer,[price-off,price*(off/100),price+price*off/100],'Calcula el descompte i resta’l del preu inicial.');
    }
    const a=+(int(11,89)/100).toFixed(2),b=+(int(11,89)/100).toFixed(2),answer=a===b?'=':a>b?'>':'<';return choiceQuestion('decimal-compare',`Completa: ${a} __ ${b}`,answer,['<','>','='].filter(x=>x!==answer),'Alinea les comes i compara les xifres d’esquerra a dreta.');
  }

  function equations(level,opts={}){
    const format=opts.formatFamily||pick(['calculation','complete','error-detection','reasoning']);const x=int(2,12),a=int(2,6),b=int(1,10),c=a*x+b;
    if(format==='error-detection')return choiceQuestion('equation-error-detection',`La Júlia resol ${a}x + ${b} = ${c}. Quin és el primer pas incorrecte?`,'Pas 2',["Pas 1","Pas 3","Cap pas"],`Al pas 2 cal dividir ${c-b} entre ${a}.`,`<ol class="math-steps"><li>${a}x = ${c} − ${b}</li><li>x = ${c-b} − ${a}</li><li>x = ${x}</li></ol>`);
    if(format==='complete')return {type:'numeric',formatId:'equation-complete-step',text:`Completa el pas: ${a}x + ${b} = ${c} → ${a}x = ?`,answer:String(c-b),explanation:`Restem ${b} als dos membres.`};
    if(format==='reasoning')return choiceQuestion('equation-justify',`Per començar a resoldre ${a}x + ${b} = ${c}, què cal fer?`,`Restar ${b} als dos membres`,[`Dividir primer entre ${b}`,`Sumar ${b} només a la dreta`,`Restar ${a} als dos membres`],'Cal conservar la igualtat fent la mateixa operació als dos membres.');
    return {type:'numeric',formatId:'equation-linear',text:`Resol: ${a}x + ${b} = ${c}`,answer:String(x),explanation:`Resta ${b} i divideix el resultat entre ${a}.`};
  }

  function data(level,opts={}){
    const labels=['Dl','Dt','Dc','Dj'],values=shuffle([int(3,7),int(8,12),int(13,18),int(19,24)]),format=opts.formatFamily||pick(['visual','compare','reasoning']);const max=Math.max(...values),min=Math.min(...values),maxLabel=labels[values.indexOf(max)],html=barChart(labels,values,'llibres llegits');
    if(format==='compare')return choiceQuestion('graph-compare','Quina diferència hi ha entre el valor més alt i el més baix?',max-min,[max,min,max+min],'Resta el valor més baix del més alt.',html);
    if(format==='reasoning')return {type:'compound-choice',formatId:'graph-read-justify',text:'Quin dia té el valor més alt i com ho saps?',answer:maxLabel,choices:labels,justificationAnswer:`La seva barra arriba a ${max}`,justificationChoices:shuffle([`La seva barra arriba a ${max}`,`És la primera barra`,`Totes les barres són iguals`,`La seva barra arriba a ${min}`]),explanation:'L’altura i l’etiqueta numèrica de la barra indiquen el valor.' ,html};
    return choiceQuestion('graph-read-value','Quin dia mostra el valor més alt?',maxLabel,labels.filter(x=>x!==maxLabel),'Busca la barra més alta i comprova’n l’etiqueta.',html);
  }

  function units(level,opts={}){
    const format=opts.formatFamily||pick(['calculation','application','estimate']);
    if(format==='estimate')return choiceQuestion('units-estimate','Quina longitud és més raonable per a una aula?','8 m',['8 mm','8 cm','8 km'],'Una aula mesura diversos metres, no mil·límetres ni quilòmetres.');
    const metres=int(2,12),cm=metres*100;
    if(format==='application')return choiceQuestion('units-scale-context',`En un plànol, 1 cm representa 2 m. Una paret hi mesura ${metres} cm. Quant mesura en realitat?`,`${metres*2} m`,[`${metres/2} m`,`${metres*100} m`,`${metres+2} m`],'Multiplica la mesura del plànol per 2 m per cada centímetre.');
    if(root.FocusMathGenerators){const q=root.FocusMathGenerators.units(level,{sub:'length',round:2});return {...q,formatId:'units-length-conversion',explanation:'Escriu la relació entre les unitats i aplica el factor de conversió.'};}
    return {type:'numeric',formatId:'units-length-conversion',text:`Converteix ${metres} m a centímetres.`,answer:String(cm),explanation:'Cada metre té 100 centímetres.'};
  }

  function geometry(level,opts={}){
    const format=opts.formatFamily||pick(['visual','application','error-detection','estimate']),b=int(4,12),h=int(3,9),area=b*h,per=2*(b+h);
    const html=`<svg class="daily-visual" viewBox="0 0 340 210" role="img" aria-label="Rectangle de ${b} centímetres per ${h} centímetres"><rect x="65" y="40" width="220" height="120" rx="4"/><text x="175" y="190" text-anchor="middle">${b} cm</text><text x="35" y="105" text-anchor="middle">${h} cm</text></svg>`;
    if(format==='error-detection')return choiceQuestion('geometry-error-detection',`Per calcular el perímetre d’aquest rectangle, quin procediment és incorrecte?`,`${b} × ${h}`,[`${b}+${h}+${b}+${h}`,`2 × (${b}+${h})`,`${2*b}+${2*h}`],'Multiplicar base per altura calcula l’àrea, no el perímetre.',html);
    if(format==='estimate')return choiceQuestion('geometry-estimate',`Sense calcular exactament, quina és una estimació raonable de l’àrea?`,`${area} cm²`,[`${b+h} cm²`,`${per*10} cm²`,`${Math.max(1,area-40)} cm²`],'L’àrea és base per altura; descarta valors d’un altre ordre de magnitud.',html);
    if(format==='application')return choiceQuestion('geometry-context',`Una fotografia de ${b} cm per ${h} cm necessita un marc. Quants centímetres de marc calen?`,`${per} cm`,[`${area} cm`,`${b+h} cm`,`${2*b+h} cm`],'El marc recorre els quatre costats: cal el perímetre.',html);
    if(root.FocusMathGenerators){const q=root.FocusMathGenerators.geometry(level,{scope:'both',units:'cm',requireUnits:false,round:0,fig:{rect:true}});return {...q,formatId:'geometry-visual-measure',explanation:'Identifica si es demana àrea o perímetre i aplica la fórmula corresponent.'};}
    return {type:'numeric',formatId:'geometry-visual-area',text:'Calcula l’àrea del rectangle en cm².',answer:String(area),explanation:'Àrea = base × altura.',html};
  }
  root.FocusDailyActivities=Object.freeze({decimals,equations,data,units,geometry});
})(typeof window!=='undefined'?window:globalThis);
