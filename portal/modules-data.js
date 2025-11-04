export const CATEGORY_LABELS = {
  math: 'Matemàtiques',
  cat: 'Llengua catalana',
  ang: 'Llengua anglesa',
  geo: 'Geografia',
  sci: 'Ciències',
  rep: 'Repàs',
};

export const MODULES = [
  { id: 'arith', name: 'Aritmètica', desc: 'Sumes, restes, multiplicacions i divisions.', category: 'math' },
  { id: 'frac', name: 'Fraccions', desc: 'Identificar (imatge), aritmètica i simplificar.', category: 'math' },
  { id: 'perc', name: 'Percentatges', desc: 'Calcula percentatges i descomptes.', category: 'math' },
  { id: 'geom', name: 'Àrees, perímetres i volums', desc: 'Figures 2D i cossos 3D.', category: 'math' },
  { id: 'coord', name: 'Coordenades cartesianes', desc: 'Col·loca punts als quadrants i llegeix coordenades.', category: 'math' },
  { id: 'stats', name: 'Estadística bàsica', desc: 'Mitjana/mediana/moda, rang/desviació i gràfics.', category: 'math' },
  { id: 'units', name: 'Unitats i conversions', desc: 'Longitud, massa, volum, superfície i temps.', category: 'math' },
  { id: 'eq', name: 'Equacions', desc: '1r grau, 2n grau, sistemes, fraccions i parèntesis.', category: 'math' },
  { id: 'func', name: 'Estudi de funcions', desc: 'Tipus, domini, punts de tall, simetria, límits, extrems i monotonia.', category: 'math' },
  { id: 'cat-ort', name: 'Ortografia', desc: 'b/v, j/g, s/c/ç/z/x, corregir, r/rr, l/l·l.', category: 'cat' },
  { id: 'cat-morf', name: 'Morfologia', desc: 'Subjecte, temps verbals, categories, concordança, funcions sintàctiques.', category: 'cat' },
  { id: 'cat-lect', name: 'Comprensió lectora bàsica', desc: 'Textos curts amb preguntes sobre instruccions, horaris i avisos.', category: 'cat' },
  { id: 'geo-europe', name: "Països d'Europa", desc: 'Descobreix països, capitals, banderes i fronteres europees.', category: 'geo' },
  { id: 'geo-america', name: "Països d'Amèrica", desc: 'Recorre el continent americà amb capitals, banderes i pistes culturals.', category: 'geo' },
  { id: 'geo-africa', name: "Països d'Àfrica", desc: 'Coneix les regions africanes, les seves capitals i la seva diversitat.', category: 'geo' },
  { id: 'geo-asia', name: "Països d'Àsia", desc: "Explora Àsia de l'Orient Mitjà a l'Extrem Orient amb preguntes variades.", category: 'geo' },
  { id: 'chem', name: 'Taula periòdica', desc: 'Quiz ràpid, compostos, mapa interactiu i classificació.', category: 'sci' },
  { id: 'chem-compounds', name: 'Fórmules i compostos', desc: 'Valències, fórmules bàsiques i compostos moleculars.', category: 'sci' },
];

export function findModuleById(id) {
  return MODULES.find((module) => module.id === id) || null;
}
