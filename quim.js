(function(){
  const elements = [
    { num:1, sym:"H", name:"Hidrogen" },
    { num:2, sym:"He", name:"Heli" },
    { num:6, sym:"C", name:"Carboni" },
    { num:7, sym:"N", name:"Nitrogen" },
    { num:8, sym:"O", name:"Oxigen" },
    { num:11, sym:"Na", name:"Sodi" },
    { num:12, sym:"Mg", name:"Magnesi" },
    { num:17, sym:"Cl", name:"Clor" },
    { num:26, sym:"Fe", name:"Ferro" },
    { num:29, sym:"Cu", name:"Coure" },
    { num:79, sym:"Au", name:"Or" },
  ];

  // 🔹 Generador de preguntes
  function genChem(level, opts={}) {
    const el = choice(elements);
    const mode = opts.sub || "mixed"; // "sym", "name", o "mixed"

    if(mode === "sym"){ 
      return { type:"chem", text:`Quin element té com a símbol <b>${el.sym}</b>?`, answer: el.name };
    }
    if(mode === "name"){
      return { type:"chem", text:`Quin és el símbol de <b>${el.name}</b>?`, answer: el.sym };
    }
    // 🔹 Mode "mixed"
    if(Math.random()<0.5){
      return { type:"chem", text:`Quin element té com a símbol <b>${el.sym}</b>?`, answer: el.name };
    } else {
      return { type:"chem", text:`Quin és el símbol de <b>${el.name}</b>?`, answer: el.sym };
    }
  }

  // 🔹 Configuració del mòdul (igual que aritmètica/fraccions)
  const chemConfig = {
    render: () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="section-title">Opcions de química</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Tipus de preguntes">
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="sym" checked> De símbol a nom</label>
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="name"> De nom a símbol</label>
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="mixed"> Barrejades</label>
          </div>
        </div>
      `;
      return div;
    },
    collect: () => {
      const sub = document.querySelector('input[name="chem-sub"]:checked')?.value || "mixed";
      return { sub };
    }
  };

  // 🔹 Registre del mòdul
  window.addModules([
    { 
      id:'chem', 
      name:'Química – Taula periòdica', 
      desc:'Relaciona símbols i noms dels elements.', 
      badge:'⚗️', 
      gen: genChem, 
      category:'sci',
      config: chemConfig
    }
  ]);
})();
