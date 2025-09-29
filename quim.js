(function(){
  // Usa 'choice' del teu main.js
  const elements = [
    { num:1,  sym:"H",  name:"Hidrogen" },
    { num:2,  sym:"He", name:"Heli" },
    { num:3,  sym:"Li", name:"Liti" },
    { num:4,  sym:"Be", name:"Beril·li" },
    { num:5,  sym:"B",  name:"Bor" },
    { num:6,  sym:"C",  name:"Carboni" },
    { num:7,  sym:"N",  name:"Nitrogen" },
    { num:8,  sym:"O",  name:"Oxigen" },
    { num:9,  sym:"F",  name:"Fluor" },
    { num:10, sym:"Ne", name:"Neó" },
    { num:11, sym:"Na", name:"Sodi" },
    { num:12, sym:"Mg", name:"Magnesi" },
    { num:13, sym:"Al", name:"Alumini" },
    { num:14, sym:"Si", name:"Silici" },
    { num:15, sym:"P",  name:"Fòsfor" },
    { num:16, sym:"S",  name:"Sofre" },
    { num:17, sym:"Cl", name:"Clor" },
    { num:18, sym:"Ar", name:"Argó" },
    { num:19, sym:"K",  name:"Potassi" },
    { num:20, sym:"Ca", name:"Calci" },
    { num:21, sym:"Sc", name:"Escandi" },
    { num:22, sym:"Ti", name:"Titani" },
    { num:23, sym:"V",  name:"Vanadi" },
    { num:24, sym:"Cr", name:"Crom" },
    { num:25, sym:"Mn", name:"Manganès" },
    { num:26, sym:"Fe", name:"Ferro" },
    { num:27, sym:"Co", name:"Cobalt" },
    { num:28, sym:"Ni", name:"Níquel" },
    { num:29, sym:"Cu", name:"Coure" },
    { num:30, sym:"Zn", name:"Zinc" },
    { num:31, sym:"Ga", name:"Gal·li" },
    { num:32, sym:"Ge", name:"Germani" },
    { num:33, sym:"As", name:"Arsènic" },
    { num:34, sym:"Se", name:"Seleni" },
    { num:35, sym:"Br", name:"Brom" },
    { num:36, sym:"Kr", name:"Criptó" },
    { num:37, sym:"Rb", name:"Rubidi" },
    { num:38, sym:"Sr", name:"Estronci" },
    { num:39, sym:"Y",  name:"Itri" },
    { num:40, sym:"Zr", name:"Zirconi" },
    { num:41, sym:"Nb", name:"Niobi" },
    { num:42, sym:"Mo", name:"Molibdè" },
    { num:43, sym:"Tc", name:"Tecneci" },
    { num:44, sym:"Ru", name:"Ruteni" },
    { num:45, sym:"Rh", name:"Rodi" },
    { num:46, sym:"Pd", name:"Pal·ladi" },
    { num:47, sym:"Ag", name:"Plata" },
    { num:48, sym:"Cd", name:"Cadmi" },
    { num:49, sym:"In", name:"Indi" },
    { num:50, sym:"Sn", name:"Estany" },
    { num:51, sym:"Sb", name:"Antimoni" },
    { num:52, sym:"Te", name:"Tel·luri" },
    { num:53, sym:"I",  name:"Iode" },
    { num:54, sym:"Xe", name:"Xenó" },
    { num:55, sym:"Cs", name:"Cesi" },
    { num:56, sym:"Ba", name:"Bari" },
    { num:57, sym:"La", name:"Lantani" },
    { num:58, sym:"Ce", name:"Ceri" },
    { num:59, sym:"Pr", name:"Praseodimi" },
    { num:60, sym:"Nd", name:"Neodimi" },
    { num:61, sym:"Pm", name:"Prometi" },
    { num:62, sym:"Sm", name:"Samari" },
    { num:63, sym:"Eu", name:"Europi" },
    { num:64, sym:"Gd", name:"Gadolini" },
    { num:65, sym:"Tb", name:"Terbi" },
    { num:66, sym:"Dy", name:"Disprosi" },
    { num:67, sym:"Ho", name:"Holmi" },
    { num:68, sym:"Er", name:"Erbi" },
    { num:69, sym:"Tm", name:"Tuli" },
    { num:70, sym:"Yb", name:"Itterbi" },
    { num:71, sym:"Lu", name:"Luteci" },
    { num:72, sym:"Hf", name:"Hafni" },
    { num:73, sym:"Ta", name:"Tàntal" },
    { num:74, sym:"W",  name:"Wolframi" },
    { num:75, sym:"Re", name:"Renni" },
    { num:76, sym:"Os", name:"Osmi" },
    { num:77, sym:"Ir", name:"Iridi" },
    { num:78, sym:"Pt", name:"Plató" },  // També s'accepta "Platí" en català
    { num:79, sym:"Au", name:"Or" },
    { num:80, sym:"Hg", name:"Mercuri" },
    { num:81, sym:"Tl", name:"Tal·li" },
    { num:82, sym:"Pb", name:"Plom" },
    { num:83, sym:"Bi", name:"Bismut" },
    { num:84, sym:"Po", name:"Poloni" },
    { num:85, sym:"At", name:"Àstat" },
    { num:86, sym:"Rn", name:"Radó" },
    { num:87, sym:"Fr", name:"Franci" },
    { num:88, sym:"Ra", name:"Radi" },
    { num:89, sym:"Ac", name:"Actini" },
    { num:90, sym:"Th", name:"Tori" },
    { num:91, sym:"Pa", name:"Protactini" },
    { num:92, sym:"U",  name:"Urani" },
    { num:93, sym:"Np", name:"Neptuni" },
    { num:94, sym:"Pu", name:"Plutoni" },
    { num:95, sym:"Am", name:"Americi" },
    { num:96, sym:"Cm", name:"Curi" },
    { num:97, sym:"Bk", name:"Berqueli" },
    { num:98, sym:"Cf", name:"Californi" },
    { num:99, sym:"Es", name:"Einsteini" },
    { num:100,sym:"Fm", name:"Fermi" },
    { num:101,sym:"Md", name:"Mendelevi" },
    { num:102,sym:"No", name:"Nobeli" },
    { num:103,sym:"Lr", name:"Lawrenci" },
    { num:104,sym:"Rf", name:"Rutherfordi" },
    { num:105,sym:"Db", name:"Dubni" },
    { num:106,sym:"Sg", name:"Seaborgi" },
    { num:107,sym:"Bh", name:"Bohri" },
    { num:108,sym:"Hs", name:"Hassi" },
    { num:109,sym:"Mt", name:"Meitneri" },
    { num:110,sym:"Ds", name:"Darmstadi" },
    { num:111,sym:"Rg", name:"Roentgeni" },
    { num:112,sym:"Cn", name:"Copernici" },
    { num:113,sym:"Nh", name:"Nihoni" },
    { num:114,sym:"Fl", name:"Flerovi" },
    { num:115,sym:"Mc", name:"Moscovi" },
    { num:116,sym:"Lv", name:"Livermori" },
    { num:117,sym:"Ts", name:"Tenessi" },
    { num:118,sym:"Og", name:"Oganessó" }
  ];

  function genChem(level, opts = {}) {
    const el = choice(elements);
    const mode = opts.sub || "mixed"; // "sym" | "name" | "mixed"

    if (mode === "sym") {
      return { type:"chem", text:`Quin element té com a símbol <b>${el.sym}</b>?`, answer: el.name };
    }
    if (mode === "name") {
      return { type:"chem", text:`Quin és el símbol de <b>${el.name}</b>?`, answer: el.sym };
    }
    // mixed
    if (Math.random() < 0.5) {
      return { type:"chem", text:`Quin element té com a símbol <b>${el.sym}</b>?`, answer: el.name };
    } else {
      return { type:"chem", text:`Quin és el símbol de <b>${el.name}</b>?`, answer: el.sym };
    }
  }

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
