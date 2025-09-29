(function(){
  const elements = [
    { num:1, sym:"H", name:"Hidrogen", group:"no metall" },
    { num:2, sym:"He", name:"Heli", group:"gas noble" },
    { num:6, sym:"C", name:"Carboni", group:"no metall" },
    { num:7, sym:"N", name:"Nitrogen", group:"no metall" },
    { num:8, sym:"O", name:"Oxigen", group:"no metall" },
    { num:11, sym:"Na", name:"Sodi", group:"metall alcalí" },
    { num:12, sym:"Mg", name:"Magnesi", group:"metall alcalinoterri" },
    { num:17, sym:"Cl", name:"Clor", group:"halogen" },
    { num:26, sym:"Fe", name:"Ferro", group:"metall de transició" },
    { num:29, sym:"Cu", name:"Coure", group:"metall de transició" },
    { num:79, sym:"Au", name:"Or", group:"metall de transició" },
  ];

  const compounds = [
    { symbols:["Na","Cl"], name:"Clorur de sodi (NaCl)" },
    { symbols:["H","O"],  name:"Aigua (H2O)" },
    { symbols:["C","O"],  name:"Diòxid de carboni (CO2)" },
    { symbols:["Fe","O"], name:"Òxid de ferro (Fe2O3)" },
  ];

  // 🔹 Generador de preguntes de química
  function genChem(level, opts={}) {
    const mode = opts.sub || "mixed";

    // ---- 1) Qui sóc jo ----
    if(mode==="whoami"){
      const el = choice(elements);
      let options = shuffle(elements.map(e=>e.name)).slice(0,3);
      if(!options.includes(el.name)) options[0] = el.name;
      options = shuffle(options);
      return {
        type:"chem-whoami",
        text:`Sóc un ${el.group}, tinc Z=${el.num}. Qui sóc?`,
        options,
        answer: el.name
      };
    }

    // ---- 2) Compostos ----
    if(mode==="compounds"){
      const c = choice(compounds);
      let options = shuffle(compounds.map(x=>x.name)).slice(0,3);
      if(!options.includes(c.name)) options[0] = c.name;
      options = shuffle(options);
      return {
        type:"chem-compound",
        text:`Quin compost formen ${c.symbols.join(" + ")} ?`,
        options,
        answer: c.name
      };
    }

    // ---- 3) Grups de la taula periòdica ----
    if(mode==="table"){
      const el = choice(elements);
      const groups = ["metall alcalí","metall alcalinoterri","halogen","gas noble","no metall","metall de transició"];
      let options = shuffle(groups).slice(0,3);
      if(!options.includes(el.group)) options[0] = el.group;
      options = shuffle(options);
      return {
        type:"chem-table",
        text:`A quin grup de la taula periòdica pertany <b>${el.name}</b>?`,
        options,
        answer: el.group
      };
    }

    // ---- 4) Modes bàsics ----
    const el = choice(elements);
    if(mode==="sym"){ 
      return { type:"chem", text:`Quin element té com a símbol <b>${el.sym}</b>?`, answer: el.name };
    }
    if(mode==="name"){
      return { type:"chem", text:`Quin és el símbol de <b>${el.name}</b>?`, answer: el.sym };
    }

    // ---- 5) Mixed ----
    if(Math.random()<0.5){
      return { type:"chem", text:`Quin element té com a símbol <b>${el.sym}</b>?`, answer: el.name };
    } else {
      return { type:"chem", text:`Quin és el símbol de <b>${el.name}</b>?`, answer: el.sym };
    }
  }

  // 🔹 Configuració del mòdul
  const chemConfig = {
    render: () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="section-title">Opcions de química</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Tipus de preguntes">
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="sym" checked> De símbol a nom</label>
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="name"> De nom a símbol</label>
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="whoami"> Qui sóc jo?</label>
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="compounds"> Compostos</label>
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="table"> Grups de la taula</label>
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
      desc:'Elements, compostos i grups.', 
      badge:'⚗️', 
      gen: genChem, 
      category:'sci',
      config: chemConfig
    }
  ]);
})();
