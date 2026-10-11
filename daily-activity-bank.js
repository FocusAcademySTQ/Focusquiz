(function(root){
  'use strict';
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const int=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  const choiceQuestion=(formatId,text,answer,distractors,explanation,html='')=>({type:'choice',formatId,text,html,answer:String(answer),choices:shuffle([String(answer),...distractors.map(String)].filter((v,i,a)=>a.indexOf(v)===i)).slice(0,4),explanation});
  const annotate=(q,{templateId,difficulty=1,prerequisites=[],hints=[],verification={}})=>({...q,templateId,difficulty,prerequisites,hints,verification});
  const barChart=(labels,values,label)=>{const max=Math.max(...values),bars=values.map((v,i)=>{const h=120*v/max,x=45+i*65;return `<g><rect x="${x}" y="${155-h}" width="38" height="${h}" rx="4"/><text x="${x+19}" y="175" text-anchor="middle">${labels[i]}</text><text x="${x+19}" y="${145-h}" text-anchor="middle">${v}</text></g>`}).join('');return `<svg class="daily-visual" viewBox="0 0 320 195" role="img" aria-label="Gràfic de barres de ${label}: ${labels.map((l,i)=>`${l}, ${values[i]}`).join('; ')}"><line x1="32" y1="155" x2="300" y2="155"/>${bars}</svg>`;};
  const numberLine=(values)=>{const min=0,max=1,w=300;return `<svg class="daily-visual" viewBox="0 0 340 100" role="img" aria-label="Recta numèrica de zero a u"><line x1="20" y1="50" x2="320" y2="50"/><text x="20" y="78">0</text><text x="315" y="78">1</text>${values.map(v=>`<circle cx="${20+(v-min)/(max-min)*w}" cy="50" r="6"/><text x="${20+v*w}" y="30" text-anchor="middle">${v}</text>`).join('')}</svg>`;};

  function decimals(level,opts={}){
    const allowed=level<=1?['compare','representation','place-value','percent-visual']:level===2?['order','application','plausibility','percent-part','percent-rate']:['increase','tax','percent-total'];
    const format=opts.formatFamily||pick(allowed);
    if(format==='order'){
      const pool=new Set();while(pool.size<3)pool.add(+(int(12,89)/100).toFixed(2));const vals=shuffle([...pool]);const sorted=[...vals].sort((a,b)=>a-b).join(' < ');
      return choiceQuestion('decimal-order','Quin ordre és correcte, de menor a major?',sorted,[[...vals].sort((a,b)=>b-a).join(' < '),`${vals[0]} < ${vals[2]} < ${vals[1]}`,`${vals[1]} < ${vals[0]} < ${vals[2]}`],'Compara primer les dècimes i després les centèsimes.',numberLine([...vals].sort((a,b)=>a-b)));
    }
    if(format==='representation'){
      const p=pick([10,20,25,40,50,75]);const d=p/100;return choiceQuestion('decimal-fraction-percent',`Quina expressió equival a ${d}?`,`${p}%`,[`${p/10}%`,`${100-p}%`,`${p}0%`],'Per passar un decimal a percentatge, multiplica per 100.');
    }
    if(format==='place-value'){const tenths=int(1,9),hundredths=int(1,9),value=Number(`0.${tenths}${hundredths}`);return choiceQuestion('decimal-place-value',`Quin valor té la xifra ${hundredths} en ${value.toFixed(2).replace('.',',')}?`,`${hundredths} centèsimes`,[`${hundredths} dècimes`,`${hundredths} unitats`,`${tenths} centèsimes`],'La segona xifra després de la coma ocupa la posició de les centèsimes.');}
    if(format==='plausibility'){const price=pick([19.8,24.5,39.9]),count=pick([2,3]),approx=Math.round(price)*count;return choiceQuestion('decimal-estimate-plausibility',`${count} articles costen ${price.toFixed(2).replace('.',',')} € cadascun. Quin total és raonable sense calcular exactament?`,`${approx} €`,[`${Math.round(price)} €`,`${approx*10} €`,`${Math.max(1,approx-count*10)} €`],'Arrodoneix el preu i comprova l’ordre de magnitud.');}
    if(format==='percent-visual'){const p=pick([25,50,75]);return choiceQuestion('percent-identify-grid',`Una graella de 100 caselles en té ${p} marcades. Quin percentatge està marcat?`,`${p}%`,[`${p/100}%`,`${100-p}%`,`${p}/10%`],'Percentatge vol dir parts de cada 100.');}
    if(format==='percent-part'){const total=pick([40,60,80,120]),p=pick([10,25,50]),answer=total*p/100;return annotate({type:'numeric',formatId:'percent-calculate-part',text:`Calcula el ${p}% de ${total}.`,answer:String(answer),answerSpec:{kind:'number',tolerance:0},explanation:'Converteix el percentatge en factor i multiplica pel total.'},{verification:{total,percent:p,answer}});}
    if(format==='percent-total'){const p=pick([20,25,50]),part=pick([10,20,30]),total=part*100/p;return annotate({type:'numeric',formatId:'percent-find-total',text:`${part} és el ${p}% de quin total?`,answer:String(total),answerSpec:{kind:'number',tolerance:0},explanation:'Divideix la part pel percentatge escrit com a decimal.'},{verification:{part,percent:p,total}});}
    if(format==='percent-rate'){const total=pick([40,80,100]),p=pick([10,25,50]),part=total*p/100;return choiceQuestion('percent-find-rate',`${part} de ${total} correspon a quin percentatge?`,`${p}%`,[`${part}%`,`${100-p}%`,`${p/10}%`],'Compara la part amb el total i expressa la fracció sobre 100.');}
    if(format==='application'){
      const price=pick([20,40,60,80]),off=pick([10,25,50]),answer=price*(1-off/100);return choiceQuestion('percent-discount-context',`Una motxilla val ${price} € i té un ${off}% de descompte. Quin és el preu final?`,answer,[price-off,price*(off/100),price+price*off/100],'Calcula el descompte i resta’l del preu inicial.');
    }
    if(format==='increase'){
      const base=pick([40,50,80,100]),p=pick([10,20,25]),answer=base*(1+p/100);return annotate(choiceQuestion('percent-increase-context',`Una quota de ${base} € augmenta un ${p}%. Quin és el nou import?`,answer,[base*p/100,base-p,base+p],'Calcula l’augment percentual i suma’l al valor inicial.'),{templateId:'percent-price-increase',difficulty:3,prerequisites:['percentages.meaning'],hints:['Calcula primer només l’augment.','Suma l’augment a la quantitat inicial.'],verification:{base,percent:p,answer}});
    }
    if(format==='tax'){
      const base=pick([20,40,50,80]),p=10,answer=base*1.1;return annotate(choiceQuestion('percent-tax-context',`Un servei costa ${base} € abans d’un impost del ${p}%. Quin total es paga?`,answer,[base*.1,base-2,base+10],'L’impost s’afegeix al preu inicial.'),{templateId:'percent-tax-total',difficulty:3,prerequisites:['percentages.meaning'],hints:['Calcula el 10% del preu.','Afegeix aquest import al preu inicial.'],verification:{base,percent:p,answer}});
    }
    const a=+(int(11,89)/100).toFixed(2),b=+(int(11,89)/100).toFixed(2),answer=a===b?'=':a>b?'>':'<';return choiceQuestion('decimal-compare',`Completa: ${a} __ ${b}`,answer,['<','>','='].filter(x=>x!==answer),'Alinea les comes i compara les xifres d’esquerra a dreta.');
  }

  function fractions(level,opts={}){
    const allowed=level<=1?['sharing','compare-context']:level===2?['recipe']:['scale'];
    const format=opts.formatFamily||pick(allowed);
    if(format==='sharing'){
      const people=pick([3,4,5,6]),cakes=pick([2,3]),answer=`${cakes}/${people}`;
      return annotate(choiceQuestion('fraction-sharing',`Es reparteixen ${cakes} coques iguals entre ${people} persones. Quina part de coca rep cadascú?`,answer,[`${people}/${cakes}`,`1/${people}`,`${cakes}/${people+1}`],'Divideix el total de coques entre el nombre de persones.'),{templateId:'fraction-sharing-equal',difficulty:1,prerequisites:['fractions.concept'],hints:['Representa cada coca dividida en parts iguals.','Escriu coques/persones.'],verification:{numerator:cakes,denominator:people}});
    }
    if(format==='recipe'){
      const base=pick([2,4]),target=base*2,n=pick([1,3,5]),d=pick([2,4]),answer=`${n*2}/${d}`;
      return annotate({type:'numeric',formatId:'fraction-recipe',text:`Una recepta per a ${base} persones necessita ${n}/${d} de litre. Quants litres calen per a ${target} persones?`,answer,answerSpec:{kind:'fraction'},explanation:'Com que es dupliquen les persones, es duplica la quantitat.'},{templateId:'fraction-recipe-scale',difficulty:2,prerequisites:['fractions.equivalence'],hints:['Compara el nombre de persones.','Multiplica la fracció pel mateix factor que les persones.'],verification:{factor:2,numerator:n,denominator:d}});
    }
    if(format==='scale'){
      const part=pick([2,3,4]),total=part*pick([2,3,4]),answer=total/part;
      return annotate(choiceQuestion('fraction-scale-context',`${part}/${total} d’un recorregut són 1 km. Quants quilòmetres té tot el recorregut?`,answer,[part,total,answer+1],'Si una fracció del recorregut és 1 km, calcula quantes parts iguals formen el total.'),{templateId:'fraction-route-scale',difficulty:3,prerequisites:['fractions.equivalence'],hints:['Simplifica la fracció si pots.','Divideix el denominador pel numerador.'],verification:{part,total}});
    }
    const d=pick([4,5,8,10]),a=int(1,d-2),b=int(a+1,d-1);
    return annotate(choiceQuestion('fraction-compare-context',`L’Ona ha llegit ${a}/${d} d’un llibre i en Pau ${b}/${d}. Qui n’ha llegit més?`,'Pau',['Ona','Han llegit el mateix','No es pot saber'],'Amb el mateix denominador, és més gran la fracció amb numerador més gran.'),{templateId:'fraction-reading-compare',difficulty:1,prerequisites:['fractions.concept'],hints:['Els denominadors són iguals.','Compara els numeradors.'],verification:{left:a,right:b,denominator:d}});
  }

  function equations(level,opts={}){
    const allowed=level<=1?['calculation']:level===2?['calculation','complete','next-step']:level===3?['reasoning','error-detection']:['calculation','error-detection','parentheses-error'];
    const format=opts.formatFamily||pick(allowed);const x=int(2,12),a=int(2,6),b=int(1,10),c=a*x+b;
    if(level===1&&opts.targetProcedure!=='solve-two-step')return {type:'numeric',formatId:'equation-one-step',text:`Resol: ${a}x = ${a*x}`,answer:String(x),explanation:`Divideix els dos membres entre ${a}.`};
    if((level===3||opts.targetProcedure==='unknown-both-sides')&&format==='reasoning'){const k=int(1,a-1),rhs=(a-k)*x+b;return {type:'numeric',formatId:'equation-both-sides',text:`Resol: ${a}x + ${b} = ${k}x + ${rhs}`,answer:String(x),explanation:'Agrupa els termes amb x en un membre i els nombres a l’altre.'};}
    if((level>=4||opts.targetProcedure==='equation-parentheses')&&format==='calculation'){const m=int(2,level>=4?4:3),rhs=m*(x+b);return {type:'numeric',formatId:'equation-parentheses',text:`Resol: ${m}(x + ${b}) = ${rhs}`,answer:String(x),explanation:'Divideix primer pel factor exterior o desenvolupa el parèntesi.'};}
    if(format==='next-step')return choiceQuestion('equation-next-step',`Quin és el pas següent correcte per a ${a}x + ${b} = ${c}?`,`${a}x = ${c-b}`,[`x = ${c-b}`,`${a}x = ${c+b}`,`x = ${c-a}`],'Resta el mateix terme independent als dos membres.');
    if(format==='parentheses-error'){const m=int(2,5);return choiceQuestion('equation-parentheses-error',`On és l’error en desenvolupar ${m}(x + ${b})?`,`No s’ha multiplicat ${b} per ${m}`,[`No s’ha multiplicat x per ${m}`,`El signe + havia de canviar`,`No hi ha cap error`],`La distributiva multiplica tots els termes del parèntesi.`,`<ol class="math-steps"><li>${m}(x + ${b})</li><li>${m}x + ${b}</li></ol>`);}
    if(format==='error-detection')return choiceQuestion('equation-error-detection',`La Júlia resol ${a}x + ${b} = ${c}. Quin és el primer pas incorrecte?`,'Pas 2',["Pas 1","Pas 3","Cap pas"],`Al pas 2 cal dividir ${c-b} entre ${a}.`,`<ol class="math-steps"><li>${a}x = ${c} − ${b}</li><li>x = ${c-b} − ${a}</li><li>x = ${x}</li></ol>`);
    if(format==='complete')return {type:'numeric',formatId:'equation-complete-step',text:`Completa el pas: ${a}x + ${b} = ${c} → ${a}x = ?`,answer:String(c-b),explanation:`Restem ${b} als dos membres.`};
    if(format==='reasoning')return choiceQuestion('equation-justify',`Per començar a resoldre ${a}x + ${b} = ${c}, què cal fer?`,`Restar ${b} als dos membres`,[`Dividir primer entre ${b}`,`Sumar ${b} només a la dreta`,`Restar ${a} als dos membres`],'Cal conservar la igualtat fent la mateixa operació als dos membres.');
    return {type:'numeric',formatId:'equation-linear',text:`Resol: ${a}x + ${b} = ${c}`,answer:String(x),explanation:`Resta ${b} i divideix el resultat entre ${a}.`};
  }

  function data(level,opts={}){
    const allowed=level<=1?['visual','table','table-reading']:level===2?['compare','trend']:['reasoning','unsupported'];
    const labels=['Dl','Dt','Dc','Dj'],values=shuffle([int(3,7),int(8,12),int(13,18),int(19,24)]),format=opts.formatFamily||pick(allowed);const max=Math.max(...values),min=Math.min(...values),maxLabel=labels[values.indexOf(max)],html=barChart(labels,values,'llibres llegits');
    if(format==='table'){const total=values.reduce((s,v)=>s+v,0),table=`<table class="data-table"><caption>Llibres llegits</caption><tr>${labels.map(x=>`<th>${x}</th>`).join('')}</tr><tr>${values.map(x=>`<td>${x}</td>`).join('')}</tr></table>`;return annotate(choiceQuestion('data-table-total','Quants llibres s’han llegit en total?',total,[max,total-min,total+min],'Suma els quatre valors de la taula.',table),{templateId:'data-table-sum',difficulty:1,hints:['Llegeix una cel·la cada vegada.','Suma els quatre valors.'],verification:{values,total}});}
    if(format==='trend'){const sorted=[4,7,11,16],line=`<svg class="daily-visual" viewBox="0 0 320 190" role="img" aria-label="Gràfic de línies amb valors 4, 7, 11 i 16"><polyline points="45,145 115,120 185,85 255,40" fill="none" stroke="#24448f" stroke-width="4"/>${sorted.map((v,i)=>`<circle cx="${45+i*70}" cy="${145-(v-4)*8.75}" r="6"/><text x="${45+i*70}" y="175" text-anchor="middle">T${i+1}</text>`).join('')}</svg>`;return annotate(choiceQuestion('graph-trend','Quina conclusió descriu el gràfic?','El valor augmenta a cada període',['El valor disminueix','El valor no canvia','Només augmenta al final'],'Compara cada punt amb l’anterior.',line),{templateId:'data-line-trend',difficulty:level,hints:['Segueix la línia d’esquerra a dreta.','Compara cada punt amb el següent.'],verification:{values:sorted,trend:'increasing'}});}
    if(format==='unsupported')return annotate(choiceQuestion('graph-unsupported-conclusion','Quina conclusió NO queda demostrada només amb aquest gràfic?','La causa del valor més alt és el dia de la setmana',[`El valor més alt és ${max}`,`${maxLabel} té la barra més alta`,`Els valors representats no són tots iguals`],'El gràfic descriu valors, però no demostra què els causa.',html),{verification:{values,unsupported:'causal-claim'}});
    if(format==='table-reading'){const table=`<table class="data-table"><caption>Llibres llegits</caption><tr>${labels.map(x=>`<th>${x}</th>`).join('')}</tr><tr>${values.map(x=>`<td>${x}</td>`).join('')}</tr></table>`;return choiceQuestion('graph-table-transfer',`Quin valor correspon a ${maxLabel}?`,max,[min,max-min,max+min],'Localitza la columna i llegeix-ne la cel·la.',table);}
    if(format==='compare')return choiceQuestion('graph-compare','Quina diferència hi ha entre el valor més alt i el més baix?',max-min,[max,min,max+min],'Resta el valor més baix del més alt.',html);
    if(format==='reasoning')return {type:'compound-choice',formatId:'graph-read-justify',text:'Quin dia té el valor més alt i com ho saps?',answer:maxLabel,choices:labels,justificationAnswer:`La seva barra arriba a ${max}`,justificationChoices:shuffle([`La seva barra arriba a ${max}`,`És la primera barra`,`Totes les barres són iguals`,`La seva barra arriba a ${min}`]),explanation:'L’altura i l’etiqueta numèrica de la barra indiquen el valor.' ,html};
    return choiceQuestion('graph-read-value','Quin dia mostra el valor més alt?',maxLabel,labels.filter(x=>x!==maxLabel),'Busca la barra més alta i comprova’n l’etiqueta.',html);
  }

  function units(level,opts={}){
    const allowed=level<=1?['calculation','estimate','choose-unit']:level===2?['application','time','capacity','factor-error']:['application'];
    const format=opts.formatFamily||pick(allowed);
    if(format==='estimate')return choiceQuestion('units-estimate','Quina longitud és més raonable per a una aula?','8 m',['8 mm','8 cm','8 km'],'Una aula mesura diversos metres, no mil·límetres ni quilòmetres.');
    if(format==='choose-unit')return choiceQuestion('units-choose-unit','Quina unitat és més adequada per mesurar la llargada d’un llapis?','cm',['km','L','h'],'Els centímetres tenen una escala adequada per a un objecte petit.');
    if(format==='factor-error')return choiceQuestion('units-factor-error','En convertir 3 m a cm, quin pas és incorrecte?','3 ÷ 100 = 0,03 cm',['1 m = 100 cm','3 × 100 = 300 cm','El resultat és 300 cm'],'De metres a centímetres cal multiplicar per 100, no dividir.');
    const metres=int(2,12),cm=metres*100;
    if(format==='application'&&(level>=3||opts.targetProcedure==='length-multistep')){const pieces=int(2,level>=3?5:3),each=int(2,level>=3?8:4),answer=pieces*each*100;return annotate({type:'numeric',formatId:'units-multistep',text:`Hi ha ${pieces} cordes de ${each} m. Quants centímetres fan en total?`,answer:String(answer),answerSpec:{kind:'number',tolerance:0,unit:'cm'},explanation:'Multiplica les cordes pels metres i converteix el total a centímetres.'},{templateId:'units-multistep-length',difficulty:level,hints:['Calcula primer els metres totals.','Converteix el resultat multiplicant per 100.'],verification:{pieces,each,answer}});}
    if(format==='application')return choiceQuestion('units-scale-context',`En un plànol, 1 cm representa 2 m. Una paret hi mesura ${metres} cm. Quant mesura en realitat?`,`${metres*2} m`,[`${metres/2} m`,`${metres*100} m`,`${metres+2} m`],'Multiplica la mesura del plànol per 2 m per cada centímetre.');
    if(format==='time'){const hours=int(2,5),minutes=hours*60;return annotate({type:'numeric',formatId:'units-time',text:`Quants minuts són ${hours} hores?`,answer:String(minutes),answerSpec:{kind:'number',tolerance:0,unit:'min'},explanation:'Una hora té 60 minuts.'},{templateId:'units-hours-minutes',difficulty:1,hints:['Recorda quants minuts té una hora.','Multiplica les hores per 60.'],verification:{hours,minutes}});}
    if(format==='capacity'){const litres=int(2,8),ml=litres*1000;return annotate({type:'numeric',formatId:'units-capacity',text:`Converteix ${litres} L a mL.`,answer:String(ml),answerSpec:{kind:'number',tolerance:0,unit:'mL'},explanation:'Un litre té 1.000 mil·lilitres.'},{templateId:'units-litres-millilitres',difficulty:1,hints:['Escriu l’equivalència d’un litre.','Multiplica per 1.000.'],verification:{litres,ml}});}
    if(root.FocusMathGenerators){const q=root.FocusMathGenerators.units(level,{sub:'length',round:2});return {...q,formatId:'units-length-conversion',explanation:'Escriu la relació entre les unitats i aplica el factor de conversió.'};}
    return {type:'numeric',formatId:'units-length-conversion',text:`Converteix ${metres} m a centímetres.`,answer:String(cm),explanation:'Cada metre té 100 centímetres.'};
  }

  function geometry(level,opts={}){
    const allowed=level<=1?['visual','estimate','data-sufficiency']:level===2?['application','formula-selection']:['error-detection','visual'];
    const format=opts.formatFamily||pick(allowed),b=int(4,12),h=int(3,9),area=b*h,per=2*(b+h);
    const html=`<svg class="daily-visual" viewBox="0 0 340 210" role="img" aria-label="Rectangle de ${b} centímetres per ${h} centímetres"><rect x="65" y="40" width="220" height="120" rx="4"/><text x="175" y="190" text-anchor="middle">${b} cm</text><text x="35" y="105" text-anchor="middle">${h} cm</text></svg>`;
    if(format==='formula-selection')return choiceQuestion('geometry-formula-select','Quina expressió calcula la quantitat de marc necessària?',`2 × (${b} + ${h})`,[`${b} × ${h}`,`${b} + ${h}`,`${b} × ${h} ÷ 2`],'El marc recorre el contorn, per tant cal el perímetre.',html);
    if(format==='data-sufficiency')return choiceQuestion('geometry-data-sufficiency','Per calcular l’àrea d’un rectangle sabem només que la base és 8 cm. Què falta?','L’altura',['El perímetre','El color','No falta cap dada'],'L’àrea d’un rectangle necessita base i altura.');
    if(format==='error-detection')return choiceQuestion('geometry-error-detection',`Per calcular el perímetre d’aquest rectangle, quin procediment és incorrecte?`,`${b} × ${h}`,[`${b}+${h}+${b}+${h}`,`2 × (${b}+${h})`,`${2*b}+${2*h}`],'Multiplicar base per altura calcula l’àrea, no el perímetre.',html);
    if(format==='estimate')return choiceQuestion('geometry-estimate',`Sense calcular exactament, quina és una estimació raonable de l’àrea?`,`${area} cm²`,[`${b+h} cm²`,`${per*10} cm²`,`${Math.max(1,area-40)} cm²`],'L’àrea és base per altura; descarta valors d’un altre ordre de magnitud.',html);
    if(format==='application')return choiceQuestion('geometry-context',`Una fotografia de ${b} cm per ${h} cm necessita un marc. Quants centímetres de marc calen?`,`${per} cm`,[`${area} cm`,`${b+h} cm`,`${2*b+h} cm`],'El marc recorre els quatre costats: cal el perímetre.',html);
    if(level>=3||opts.targetProcedure==='inverse-area'){const knownArea=b*h;return {type:'numeric',formatId:'geometry-unknown-side',text:`Un rectangle té àrea ${knownArea} cm² i base ${b} cm. Quina altura té?`,answer:String(h),answerSpec:{kind:'number',tolerance:0,unit:'cm'},explanation:'Divideix l’àrea entre la base per trobar l’altura.',html};}
    if(root.FocusMathGenerators){const q=root.FocusMathGenerators.geometry(level,{scope:'both',units:'cm',requireUnits:false,round:0,fig:{rect:true}});return {...q,formatId:'geometry-visual-measure',explanation:'Identifica si es demana àrea o perímetre i aplica la fórmula corresponent.'};}
    return {type:'numeric',formatId:'geometry-visual-area',text:'Calcula l’àrea del rectangle en cm².',answer:String(area),explanation:'Àrea = base × altura.',html};
  }
  const expose=(fn,prerequisites=[],maxLevel=3)=>(level,opts={})=>{const requested=Math.max(1,Number(level)||1),actual=Math.min(maxLevel,requested),q=fn(actual,opts),round=q.meta?.round,answerSpec=q.answerSpec||(q.numeric!==undefined?{kind:'number',tolerance:Number.isInteger(round)?.5*10**(-round):0,unit:q.meta?.units||''}:undefined);const complete={...q,answerSpec,requestedDifficulty:requested,actualDifficulty:q.difficulty||actual,coverageLimited:requested!==actual,templateId:q.templateId||q.formatId,difficulty:q.difficulty||actual,prerequisites:q.prerequisites||prerequisites,hints:q.hints?.length?q.hints:[q.explanation||'Identifica les dades rellevants.',q.explanation||'Comprova el procediment pas a pas.']};return root.FocusDailyBankMetadata?root.FocusDailyBankMetadata.enrich(complete):complete;};
  root.FocusDailyActivities=Object.freeze({
    decimals:expose(decimals,['fractions.equivalence']),fractions:expose(fractions,['fractions.concept']),
    equations:expose(equations,['calculation.muldiv'],4),data:expose(data,[]),
    units:expose(units,['calculation.muldiv']),geometry:expose(geometry,['calculation.muldiv'])
  });
})(typeof window!=='undefined'?window:globalThis);
