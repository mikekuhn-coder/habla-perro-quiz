import { useState, useEffect } from 'react';

const NAVY  = '#0F2451';
const GREEN = '#2AC400';
const WARM  = '#F5F5F4';
const DGREY = '#4A5568';

const WA_NUM = atob('NTI3Nzc2MTAxNjQ3');
const buildWAUrl = (ownerName: string, dogName: string) => {
  const msg = `Hola Mike, soy ${ownerName}. Acabo de hacer el quiz con ${dogName} y me gustaría saber más. 🐾`;
  return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
};

const LOGO_WHITE = '/02-HP-Logo-Main-White.png';
const CCPDT_LOGO = '/cpdt-ka-color-med.png';
const APDT_LOGO  = '/APDT%20logo.png';

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwOYII3A9PnS8XOhkmgqlkzg8GsAZW_XGQkSA1Zj106QV9yq4PqkL2hyAdXOtzXSJo/exec';

const TRAITS       = ['activacion','impulsos','sensibilidad','social','conexion','auto_ref'];
const TRAIT_LABELS = ['Activación','Impulsos','Sensibilidad','Control Social','Conexión','Auto-ref.'];
const VALID_CATS   = ['red_bull','alcalde_amiguero','protector_preocupado','dramatico','independiente','sombra','genio_selectivo','oportunista'];

// ── PRE-CTA DATA — from developer handover doc ────────────────────────────────
const PROFILE_DATA: Record<string, { intensity: 'high'|'medium'|'low'; objetivos: string[]; resultados: string[] }> = {
  red_bull:             { intensity: 'medium', objetivos: ['calma','autocontrol','concentración'],                             resultados: ['bajar revoluciones','pensar antes de actuar','responder mejor en entornos estimulantes'] },
  alcalde_amiguero:     { intensity: 'medium', objetivos: ['autocontrol social','modales','atención'],                         resultados: ['saludar sin desbordarse','respetar espacio','mantener control en presencia de otros'] },
  protector_preocupado: { intensity: 'high',   objetivos: ['seguridad','regulación emocional','manejo de disparadores'],       resultados: ['reducir reactividad','sentirse más seguro','responder con más calma'] },
  dramatico:            { intensity: 'high',   objetivos: ['tolerancia a la frustración','calma','control emocional'],         resultados: ['manejar mejor la frustración','esperar sin explotar','responder con más estabilidad'] },
  independiente:        { intensity: 'low',    objetivos: ['conexión','motivación','atención al guía'],                        resultados: ['elegir más al dueño','responder mejor fuera de casa','mantener enfoque con distracciones'] },
  sombra:               { intensity: 'medium', objetivos: ['independencia','seguridad emocional','calma'],                    resultados: ['estar tranquilo sin el dueño','ganar confianza','regularse sin dependencia'] },
  genio_selectivo:      { intensity: 'low',    objetivos: ['consistencia','respuesta confiable','obediencia real'],            resultados: ['responder también fuera de casa','escuchar con distracciones','ser más predecible'] },
  oportunista:          { intensity: 'medium', objetivos: ['hábitos','autocontrol','alternativas claras'],                    resultados: ['dejar de reforzar conductas no deseadas','tomar mejores decisiones','tener rutinas más estables'] },
};

// Combination key = sorted cat keys joined with '+'
const COMBINATIONS: Record<string, { objetivos: string[]; resultados: string[] }> = {
  'dramatico+red_bull':                 { objetivos: ['calma','tolerancia a la frustración','control emocional'],              resultados: ['bajar activación','manejar mejor la frustración','responder sin explotar'] },
  'protector_preocupado+sombra':        { objetivos: ['seguridad emocional','independencia','confianza'],                      resultados: ['sentirse más seguro','depender menos del dueño','reaccionar menos'] },
  'independiente+oportunista':          { objetivos: ['conexión','hábitos','autocontrol'],                                     resultados: ['elegir más al dueño','dejar de autorefuerzo','responder mejor en el día a día'] },
  'genio_selectivo+oportunista':        { objetivos: ['consistencia','hábitos','límites claros'],                              resultados: ['responder en todos los contextos','reducir conductas oportunistas','mejorar control con distracciones'] },
  'alcalde_amiguero+red_bull':          { objetivos: ['calma','autocontrol social','atención'],                                resultados: ['bajar revoluciones','convivir sin desbordarse','responder mejor cerca de perros y personas'] },
  'alcalde_amiguero+genio_selectivo':   { objetivos: ['modales','atención','respuesta confiable'],                             resultados: ['saludar con más control','escuchar mejor con distracciones','responder de forma más consistente'] },
  'dramatico+protector_preocupado':     { objetivos: ['seguridad','regulación emocional','tolerancia a la frustración'],       resultados: ['reaccionar menos','manejar mejor la incomodidad','recuperar la calma más rápido'] },
  'independiente+protector_preocupado': { objetivos: ['seguridad','conexión','respuestas funcionales'],                        resultados: ['sentirse más seguro','reconectar más con el dueño','responder mejor al entorno'] },
  'alcalde_amiguero+dramatico':         { objetivos: ['autocontrol social','calma','control emocional'],                       resultados: ['convivir mejor','reducir explosiones por emoción','mantener más estabilidad en grupo'] },
  'dramatico+genio_selectivo':          { objetivos: ['control emocional','consistencia','respuesta confiable'],               resultados: ['pensar antes de reaccionar','responder mejor con distracciones','ser más estable'] },
  'red_bull+sombra':                    { objetivos: ['independencia','calma','seguridad emocional'],                          resultados: ['estar más tranquilo','depender menos del dueño','regularse mejor en el día a día'] },
  'oportunista+red_bull':               { objetivos: ['calma','estructura','autocontrol'],                                     resultados: ['bajar activación','dejar de improvisar conductas problemáticas','tomar mejores decisiones'] },
};

const CTA_GRUPO = [
  'Este suele ser el mejor siguiente paso — aunque dependiendo de la intensidad del caso, a veces empezar con sesiones individuales puede ser más adecuado. Eso lo vemos juntos en una breve llamada.',
  'Para muchos perros este es el siguiente paso ideal. Aunque en algunos casos conviene empezar uno a uno — eso lo vemos rápido en una llamada.',
];

const CTA_FLEXIBLE = [
  'En muchos casos este tipo de trabajo es clave — aunque cuando la situación es más intensa, suele ser mejor empezar de forma individual. Eso lo evaluamos juntos en una breve llamada.',
  'Este suele ser el mejor siguiente paso. Aun así, según el caso, puede ser mejor empezar en grupo o individual — lo definimos contigo después de una breve valoración.',
];

function buildPreCTA(cat: string, cat2: string | null, mixed: boolean): string {
  // Determine which objetivos/resultados to use
  let obj: string[], res: string[];

  if (mixed && cat2) {
    const comboKey = [cat, cat2].sort().join('+');
    if (COMBINATIONS[comboKey]) {
      obj = COMBINATIONS[comboKey].objetivos;
      res = COMBINATIONS[comboKey].resultados;
    } else {
      obj = PROFILE_DATA[cat]?.objetivos ?? [];
      res = PROFILE_DATA[cat]?.resultados ?? [];
    }
  } else {
    obj = PROFILE_DATA[cat]?.objetivos ?? [];
    res = PROFILE_DATA[cat]?.resultados ?? [];
  }

  const preCTA = `Para este perfil, el mejor siguiente paso suele ser un grupo de trabajo enfocado en ${obj[0]}, ${obj[1]} y ${obj[2]}. En nuestras clases en Cuernavaca trabajamos ejercicios prácticos para ayudar a tu perro a ${res[0]}, ${res[1]} y ${res[2]} en situaciones reales.`;

  // CTA variant based on primary intensity
  const intensity = PROFILE_DATA[cat]?.intensity ?? 'medium';
  const ctaVariants = intensity === 'high' ? CTA_FLEXIBLE : CTA_GRUPO;
  const cta = ctaVariants[Math.floor(Math.random() * ctaVariants.length)];

  return `${preCTA}\n\n${cta}`;
}

// ── VECTORS ───────────────────────────────────────────────────────────────────
const VECTORS: Record<string, Record<string, number>> = {
  red_bull:             { activacion:5, impulsos:1, sensibilidad:2, social:2, conexion:3, auto_ref:3 },
  alcalde_amiguero:     { activacion:4, impulsos:2, sensibilidad:2, social:1, conexion:3, auto_ref:2 },
  protector_preocupado: { activacion:3, impulsos:2, sensibilidad:5, social:1, conexion:3, auto_ref:2 },
  dramatico:            { activacion:5, impulsos:1, sensibilidad:5, social:2, conexion:3, auto_ref:3 },
  independiente:        { activacion:3, impulsos:3, sensibilidad:2, social:3, conexion:1, auto_ref:4 },
  sombra:               { activacion:2, impulsos:3, sensibilidad:4, social:3, conexion:5, auto_ref:2 },
  genio_selectivo:      { activacion:3, impulsos:2, sensibilidad:2, social:3, conexion:2, auto_ref:4 },
  oportunista:          { activacion:3, impulsos:2, sensibilidad:1, social:3, conexion:2, auto_ref:5 },
};

// ── QUESTIONS — all verified ──────────────────────────────────────────────────
const QUESTIONS = [
  {
    q: (n: string) => `Cuando sales a caminar con ${n}...`,
    answers: [
      { t: 'Jala todo el tiempo y no para de moverse.',                   s: { activacion:5, impulsos:1 },  ts: 'global' },
      { t: 'Quiere saludar a cada perro y persona que ve.',               s: { activacion:4, social:1 },    ts: 'social' },
      { t: 'Se pone tenso o ladra cuando algo le preocupa.',              s: { sensibilidad:4, social:2 } },
      { t: 'Va a su ritmo, sin mucho interés en ti.',                     s: { conexion:1, auto_ref:4 } },
      { t: 'Camina a tu lado, tranquilo y sin problemas.',                s: { activacion:2, conexion:4 } },
    ],
  },
  {
    q: (_n: string) => 'Cuando ve a otro perro o a una persona desconocida...',
    answers: [
      { t: 'Pierde completamente el control.',                            s: { impulsos:1, activacion:5 } },
      { t: 'Se emociona mucho y quiere llegar a como de lugar.',          s: { impulsos:2, social:1 } },
      { t: 'Se pone alerta, inseguro o reactivo.',                        s: { sensibilidad:5, impulsos:2 } },
      { t: 'Decide si le interesa o no.',                                 s: { impulsos:3, auto_ref:4 } },
      { t: 'Se emociona un poco, pero se calma rápido.',                  s: { impulsos:3, sensibilidad:2 } },
    ],
  },
  {
    // Q3 — Answer E updated: separation distress → Sombra scoring
    q: (n: string) => `En casa, ${n} generalmente...`,
    answers: [
      { t: 'Nunca para — siempre está en movimiento.',                    s: { activacion:5, auto_ref:3 } },
      { t: 'Te sigue a todos lados y busca tu atención.',                 s: { conexion:5, activacion:3 } },
      { t: 'Se altera fácil con ruidos o cambios en la rutina.',          s: { sensibilidad:4, activacion:3 } },
      { t: 'Es tranquilo e independiente.',                               s: { conexion:1, activacion:2 } },
      // NEW E: separation distress → Sombra (high sensibilidad + high conexion need)
      { t: 'Cuando se queda solo, le cuesta mucho calmarse o puede romper cosas.', s: { sensibilidad:4, conexion:5 } },
    ],
  },
  {
    q: (n: string) => `Cuando le pides algo a ${n}`,
    qHighlight: 'fuera de casa',
    qSuffix: '...',
    answers: [
      { t: 'No puede concentrarse — está muy activado.',                  s: { impulsos:1, activacion:5 } },
      { t: 'Quiere hacerlo, pero algo lo distrae.',                       s: { conexion:3, auto_ref:3 }, pat: 'ctx' },
      { t: 'Duda, se bloquea o no reacciona.',                           s: { sensibilidad:4, conexion:3 } },
      { t: 'Solo responde si le conviene en ese momento.',               s: { auto_ref:4, conexion:2 }, pat: 'con' },
      { t: 'Responde bien, aunque a veces tarda un poco.',               s: { impulsos:3, conexion:4 } },
    ],
  },
  {
    q: (n: string) => `Con otros perros o personas desconocidas, ${n}...`,
    answers: [
      { t: 'Es intenso en cualquier situación, no importa el contexto.', s: { social:1, activacion:5 }, ts: 'global' },
      { t: 'Se lanza a saludar sin medir el espacio de los demás.',      s: { social:1, activacion:3 }, ts: 'social' },
      { t: 'Se pone reactivo, inseguro o a la defensiva.',               s: { sensibilidad:5, social:2 } },
      { t: 'Es selectivo — depende del día y del momento.',              s: { social:3, conexion:2 } },
      { t: 'Saluda con calma y sigue adelante sin drama.',               s: { social:4, impulsos:3 } },
    ],
  },
  {
    q: (n: string) => `Cuando ${n} encuentra comida, un olor o algo interesante en el suelo...`,
    answers: [
      { t: 'Se obsesiona — no hay nada que lo pare.',                    s: { auto_ref:5, impulsos:1 } },
      { t: 'Lo olfatea un momento y sigue solo — sin buscarte.',         s: { auto_ref:3, conexion:1 } },
      { t: 'Lo ignora — no le llama mucho la atención.',                 s: { auto_ref:1, conexion:3 } },
      { t: 'Se encierra en eso completamente y te ignora por completo.', s: { auto_ref:5, conexion:1 } },
      { t: 'Lo nota, lo investiga un momento y vuelve contigo.',         s: { auto_ref:2, conexion:4 } },
    ],
  },
];

// ── COPY ──────────────────────────────────────────────────────────────────────
const COPY: Record<string, any> = {
  red_bull: {
    name: 'Red Bull Dog', emoji: '🔴', energy: 'Explosivo',
    rec: (n: string) => `${n} vive a mil por hora: jala en la correa, ignora todo cuando se emociona y parece que nunca tiene apagador. No es que no te quiera escuchar — es que cuando está así, literalmente no puede.`,
    myth: 'Muchos piensan que un perro así necesita más ejercicio o mano más firme. Ninguna de las dos cosas resuelve esto.',
    body: 'Lo que está pasando es que tiene un nivel de activación muy alto que se retroalimenta solo. Cuando esa activación sube demasiado, el cerebro deja de tener acceso a lo que sabe hacer. No es desobediencia — es que su sistema nervioso todavía no aprendió a bajar las revoluciones, y eso sí tiene solución.',
    needs: ['Aprender la calma como habilidad entrenada, no como consecuencia del cansancio','Control de impulsos con distracciones graduales y manejables','Rutinas que bajen su activación antes de pedirle concentración'],
    bridge: (n: string) => `Con un plan claro, ${n} puede aprender a regularse — y ese cambio transforma cada salida, cada visita y cada momento en casa.`,
    cta1: (n: string) => `¿Por dónde empiezas con un perro como ${n}?`,
    sub1: 'Cuéntame qué está pasando y te digo qué haría yo primero.',
    cta2: (n: string) => `Mike ya sabe cómo ayudar a ${n}.`,
  },
  alcalde_amiguero: {
    name: 'Alcalde Amiguero', emoji: '🟡', energy: 'Intenso',
    rec: (n: string) => `${n} ama a todo el mundo — y ese amor no tiene filtro ni freno. Salta, jala, invade el espacio... y tú terminas disculpándote con todos en el parque.`,
    myth: "'Es que es muy amistoso' — todos lo dicen. Pero amistoso y sin control no es lo mismo.",
    body: 'Lo que está pasando es que aprendió que lanzarse y empujar funciona — porque históricamente le ha dado acceso a lo que más quiere: contacto social. No tiene freno porque nunca aprendió que esperar también tiene recompensa. No es mal carácter. Es una historia de aprendizaje que se puede reescribir.',
    needs: ['Aprender a esperar antes de tener acceso a lo que quiere','Control de impulsos específicamente en contextos sociales','Saludos controlados como comportamiento que vale la pena'],
    bridge: (n: string) => `Cuando ${n} entienda que la calma abre puertas — literalmente — todo cambia para él y para ti.`,
    cta1: (n: string) => `¿Quieres que ${n} aprenda a saludar sin drama?`,
    sub1: 'Escríbeme y hablamos de qué está pasando exactamente.',
    cta2: (n: string) => `Mike ya sabe cómo ayudar a ${n}.`,
  },
  protector_preocupado: {
    name: 'Protector Preocupado', emoji: '🟠', energy: 'Defensivo',
    rec: (n: string) => `${n} ladra, se tensa o reacciona cuando algo le preocupa — y tú ya aprendiste qué situaciones lo van a disparar. Caminar con él a veces se siente como anticipar una crisis que no puedes evitar.`,
    myth: "Es fácil pensar que es agresivo, dominante o simplemente 'así es'. Ninguna de esas cosas es lo que está pasando.",
    body: 'Lo que está mostrando es miedo o inseguridad — no agresión. Aprendió que cuando ladra o se lanza, las cosas que lo asustan se van, y eso refuerza exactamente la conducta que más te preocupa. No está siendo malo. Está haciendo lo único que sabe hacer cuando se siente inseguro.',
    needs: ['Construir seguridad emocional primero — antes de trabajar la reactividad','Exposición gradual con respuestas alternativas al ladrido y al jalón','Un perro que se siente seguro no necesita ponerse a la defensiva'],
    bridge: (n: string) => `Este proceso requiere paciencia y un plan claro — pero cuando ${n} empiece a sentirse seguro, los cambios son profundos y duraderos.`,
    cta1: (_n: string) => 'Esto tiene solución — y no requiere corrección ni castigo.',
    sub1: 'Cuéntame qué situaciones lo disparan y por dónde vamos.',
    cta2: (n: string) => `Mike ya sabe cómo ayudar a ${n}.`,
  },
  dramatico: {
    name: 'Dramático', emoji: '🟣', energy: 'Volátil',
    rec: (n: string) => `${n} puede estar tranquilo un momento y al siguiente estar en modo volcán — ladrando, jalando o haciendo drama total. No hay punto medio: o está bien o está completamente desbordado.`,
    myth: 'Muchos lo ven como agresividad o mal temperamento. Pero lo que está pasando no es agresión — es frustración.',
    body: 'Cuando quiere algo y no puede tenerlo, su tolerancia se agota muy rápido. Y en algún punto aprendió que escalar el drama a veces funciona. No es peligroso ni roto. Su sistema emocional simplemente no aprendió aún a manejar la espera.',
    needs: ['Tolerancia a la frustración — aprender que esperar también tiene recompensa','Bajar la intensidad emocional antes de pedir comportamientos específicos','Que la calma abra lo que el drama no puede abrir'],
    bridge: (n: string) => `Con el entrenamiento correcto, ${n} puede aprender que no necesita explotar para conseguir lo que quiere.`,
    cta1: (n: string) => `¿Quieres entender qué dispara a ${n} y cómo manejarlo?`,
    sub1: 'Escríbeme y hablamos de qué está pasando exactamente.',
    cta2: (n: string) => `Mike ya sabe cómo ayudar a ${n}.`,
  },
  independiente: {
    name: 'Independiente', emoji: '🔵', energy: 'Desconectado',
    rec: (n: string) => `Le hablas y no voltea. Lo llamas y sigue olfateando. En casa te hace caso — afuera es como si no existieras. ${n} tiene su propio mundo, y tú no siempre estás incluida.`,
    myth: 'Esto se interpreta casi siempre como terquedad o dominancia. Ninguna de las dos cosas es lo que está pasando.',
    body: 'Lo que está pasando es más simple: el mundo afuera le ofrece más recompensa que tú en este momento. No es personal. Es que todavía no descubrió que trabajar contigo vale más la pena que seguir ese olor.',
    needs: ['Construir valor de reforzamiento contigo — tú necesitas competir con el entorno','Conexión y engagement como base, antes de exigir obediencia','Recall confiable como primer objetivo medible y real'],
    bridge: (n: string) => `Cuando ${n} descubra que orientarse hacia ti predice cosas buenas, todo lo demás se vuelve mucho más fácil.`,
    cta1: (n: string) => `El recall confiable de ${n} empieza aquí — y es más rápido de lo que crees.`,
    sub1: 'Cuéntame cómo es afuera y por dónde empezamos.',
    cta2: (n: string) => `Mike ya sabe cómo ayudar a ${n}.`,
  },
  sombra: {
    name: 'Sombra', emoji: '⚫', energy: 'Dependiente',
    rec: (n: string) => `${n} te sigue a todos lados, se angustia cuando no te ve y no puede quedarse solo sin que algo pase. Lo que muchos ven como amor total, tú sabes que a veces se siente agotador — para los dos.`,
    myth: "'Es que te quiere mucho' — todos lo dicen. Pero lo que muestra no es solo amor. Es dependencia emocional.",
    body: 'No tiene todavía las habilidades para regularse solo. Tú te convertiste en su única fuente de calma — y eso es mucho peso para los dos. No está mal apegado ni es un perro dañado. Simplemente nunca aprendió que también puede estar bien cuando está solo.',
    needs: ['Desarrollar autonomía — la calma independiente como habilidad entrenada','Tolerancia gradual a la separación, sin ansiedad en el proceso','Momentos y espacios propios que aprenda a disfrutar'],
    bridge: (n: string) => `Un perro con autonomía es más equilibrado, más feliz — y tú puedes moverte por tu casa sin escolta permanente.`,
    cta1: (n: string) => `La independencia de ${n} se entrena — con calma y sin drama.`,
    sub1: 'Escríbeme y hablamos de cómo está siendo esto en casa.',
    cta2: (n: string) => `Mike ya sabe cómo ayudar a ${n}.`,
  },
  genio_selectivo: {
    name: 'Genio Selectivo', emoji: '🟢', energy: 'Condicional',
    rec: (n: string) => `En casa te hace caso perfecto. Afuera es como si nunca hubiera aprendido nada. ${n} sabe exactamente lo que le pides — solo que decide cuándo vale la pena hacerlo.`,
    myth: "Esto se lee casi siempre como manipulación o que 'el perro te está probando'. No es ninguna de las dos cosas.",
    body: 'Lo que está pasando es que aprendió los comportamientos en un contexto — y nadie le enseñó que aplican en todos los demás. Afuera, el entorno compite con tus instrucciones y gana. Por ahora. No está eligiendo ignorarte. Está respondiendo exactamente como su historia de entrenamiento le enseñó a responder.',
    needs: ['Generalizar lo que ya sabe a diferentes entornos y niveles de distracción','Consistencia en el reforzamiento — que responder siempre valga la pena','Entrenamiento en contextos reales, no solo dentro de casa'],
    bridge: (n: string) => `Cuando las reglas sean las mismas en todos lados, ${n} va a dejar de "elegir" — porque la respuesta correcta siempre va a tener valor.`,
    cta1: (n: string) => `Lo que ${n} ya sabe puede funcionar en cualquier lugar.`,
    sub1: 'Cuéntame en qué situaciones te falla y por dónde empezamos.',
    cta2: (n: string) => `Mike ya sabe cómo ayudar a ${n}.`,
  },
  oportunista: {
    name: 'Oportunista', emoji: '🟤', energy: 'Oportunista',
    rec: (n: string) => `${n} roba comida, destruye cosas, se lanza hacia lo que le interesa — y lo hace con una eficiencia que casi da risa. Sabe exactamente lo que quiere y siempre encuentra la manera de conseguirlo.`,
    myth: "Es tentador pensar que lo hace con intención, que es 'malicioso' o que actúa por despecho. No es ninguna de esas cosas.",
    body: 'Lo que está pasando es más simple: esas conductas le funcionan y le funcionan bien. El mundo le paga mejor que tú en este momento. No es un perro malo. Es un perro muy bueno encontrando recompensas donde las hay.',
    needs: ['Manejo del entorno — evitar que las conductas indeseadas sigan siendo rentables','Alternativas que también valgan la pena y que pueda elegir en su lugar','Construir contigo una historia de reforzamiento que compita con el entorno'],
    bridge: (n: string) => `Cuando tú seas la fuente más predecible de cosas buenas, ${n} va a preferir trabajar contigo — porque eso también tiene sentido para él.`,
    cta1: (n: string) => `Cambiar la ecuación de ${n} es más directo de lo que parece.`,
    sub1: 'Cuéntame qué conductas te están volviendo loca y empezamos ahí.',
    cta2: (n: string) => `Mike ya sabe cómo ayudar a ${n}.`,
  },
};

// ── SCORING ───────────────────────────────────────────────────────────────────
function calcScore(answers: any[]) {
  const tot: Record<string,number> = {};
  const cnt: Record<string,number> = {};
  TRAITS.forEach(t => { tot[t] = 0; cnt[t] = 0; });
  answers.forEach(a => {
    Object.entries(a.s).forEach(([t, v]) => { tot[t] += v as number; cnt[t]++; });
  });
  const avg: Record<string,number> = {};
  TRAITS.forEach(t => { avg[t] = cnt[t] > 0 ? tot[t] / cnt[t] : 3; });

  const dists: Record<string,number> = {};
  Object.entries(VECTORS).forEach(([cat, vec]) => {
    dists[cat] = Math.sqrt(TRAITS.reduce((s, t) => s + Math.pow(avg[t] - vec[t], 2), 0));
  });

  const sorted = Object.entries(dists).sort((a, b) => a[1] - b[1]);
  let primary = sorted[0][0];
  let second  = sorted[1][0];
  const gap   = sorted[1][1] - sorted[0][1];

  const ts = (answers[0]?.ts === 'global' && answers[4]?.ts === 'global') ? 'global'
    : (answers[0]?.ts === 'social' || answers[4]?.ts === 'social') ? 'social' : '?';
  const pat = answers[3]?.pat === 'con' ? 'con' : answers[3]?.pat === 'ctx' ? 'ctx' : '?';

  if (gap < 1.5) {
    const pair = [primary, second].sort().join('|');
    if (pair === 'dramatico|red_bull')
      primary = avg.sensibilidad >= 4 ? 'dramatico' : 'red_bull';
    if (pair === 'alcalde_amiguero|red_bull')
      primary = avg.social <= 1 && ts === 'social' ? 'alcalde_amiguero' : 'red_bull';
    if (pair === 'genio_selectivo|oportunista')
      primary = avg.conexion <= 2 && pat === 'con' ? 'oportunista' : 'genio_selectivo';
  }

  if (sorted[0][1] > 2.5) primary = 'genio_selectivo';
  if (!VALID_CATS.includes(primary)) primary = 'genio_selectivo';
  if (second === primary) second = sorted.find(([cat]) => cat !== primary)?.[0] ?? 'oportunista';
  if (!VALID_CATS.includes(second)) second = 'oportunista';

  return { cat: primary, cat2: second, mixed: gap < 0.5, avg };
}

async function submitToSheets(payload: Record<string, any>) {
  if (!SHEETS_URL || SHEETS_URL.includes('PASTE_YOUR')) return;
  try {
    await fetch(SHEETS_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (_) { /* silent fail */ }
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .app { max-width: 440px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: white; }
  .btn-green { background: #2AC400; color: #0F2451; border: none; border-radius: 8px; padding: 14px 24px; font-size: 16px; font-weight: 700; cursor: pointer; width: 100%; }
  .btn-green:hover { background: #22A000; }
  .btn-green:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-wa { background: #25D366; color: white; border: none; border-radius: 8px; padding: 16px 24px; font-size: 15px; font-weight: 700; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; text-decoration: none; }
  .btn-wa:hover { background: #1FB855; }
  .btn-navy { background: #0F2451; color: white; border: none; border-radius: 8px; padding: 16px 24px; font-size: 15px; font-weight: 700; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; text-decoration: none; }
  .ans-card { background: white; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; cursor: pointer; font-size: 14px; color: #2D3748; text-align: left; width: 100%; transition: all 0.15s; line-height: 1.5; }
  .ans-card:hover { border-color: #0F2451; background: #F7F9FF; }
  .ans-card.sel { background: #0F2451; color: white; border-color: #0F2451; }
  /* FIX: explicit background + color on all inputs — prevents dark mode browser overrides */
  .input-field { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; font-size: 16px; outline: none; color: #2D3748; background: white; }
  .input-field:focus { border-color: #0F2451; }
  /* DARK MODE: white text on dark background */
  @media (prefers-color-scheme: dark) {
    .input-field { background: #1a2a4a; color: white; border-color: #2d4a7a; }
    .input-field::placeholder { color: rgba(255,255,255,0.45); }
    select.input-field option { background: #1a2a4a; color: white; }
  }
  .myth-box { background: #FFF7ED; border-left: 4px solid #2AC400; border-radius: 0 8px 8px 0; padding: 14px 16px; font-style: italic; color: #2D3748; font-size: 14px; line-height: 1.6; }
  .need-item { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #4A5568; line-height: 1.5; }
  .need-item:last-child { border-bottom: none; }
  .sec-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #2AC400; margin-bottom: 8px; }
  .ghost-btn { background: none; border: none; color: #718096; font-size: 13px; cursor: pointer; padding: 8px 0; }
  .siguiente-wrap { overflow: hidden; transition: max-height 0.25s ease, opacity 0.25s ease; }
  .siguiente-wrap.visible { max-height: 80px; opacity: 1; }
  .siguiente-wrap.hidden { max-height: 0; opacity: 0; }
  .hint-text { font-size: 12px; color: #718096; font-style: italic; margin-bottom: 14px; padding: 8px 12px; background: #F5F5F4; border-radius: 6px; }
  .pre-cta-block { background: #F0F7FF; border-left: 4px solid #0F2451; border-radius: 0 8px 8px 0; padding: 16px 18px; margin-bottom: 16px; font-size: 14px; color: #2D3748; line-height: 1.7; }
`;

function ProgBar({ n, total }: { n: number; total: number }) {
  return (
    <div style={{ background: '#E2E8F0', borderRadius: 4, height: 5, width: '100%', overflow: 'hidden' }}>
      <div style={{ background: GREEN, height: '100%', width: `${(n / total) * 100}%`, borderRadius: 4, transition: 'width 0.3s ease' }} />
    </div>
  );
}

function MiniRadar({ avg }: { avg: Record<string, number> }) {
  const cx = 110, cy = 110, r = 78, n = TRAITS.length;
  const pts = TRAITS.map((t, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    const v = (avg[t] - 1) / 4;
    return { x: cx + r * v * Math.cos(a), y: cy + r * v * Math.sin(a) };
  });
  return (
    <svg viewBox="0 0 220 220" width="100%" style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}>
      {[0.25,0.5,0.75,1].map((f, fi) => {
        const gp = TRAITS.map((_, i) => { const a=(i/n)*2*Math.PI-Math.PI/2; return `${cx+r*f*Math.cos(a)},${cy+r*f*Math.sin(a)}`; }).join(' ');
        return <polygon key={fi} points={gp} fill="none" stroke="#E2E8F0" strokeWidth={1} />;
      })}
      {TRAITS.map((_, i) => { const a=(i/n)*2*Math.PI-Math.PI/2; return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#E2E8F0" strokeWidth={1} />; })}
      <polygon points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="#0F2451" fillOpacity={0.35} stroke="#0F2451" strokeWidth={2} />
      {TRAITS.map((_, i) => {
        const a=(i/n)*2*Math.PI-Math.PI/2;
        return <text key={i} x={cx+(r+24)*Math.cos(a)} y={cy+(r+24)*Math.sin(a)} textAnchor="middle" dominantBaseline="central" fontSize={9} fill="#4A5568">{TRAIT_LABELS[i]}</text>;
      })}
    </svg>
  );
}

function CredentialLogos() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
      {[
        { src: CCPDT_LOGO, alt: 'CCPDT', label: 'Certificado por el consejo internacional de entrenadores profesionales' },
        { src: APDT_LOGO,  alt: 'APDT',  label: 'Miembro de la asociación internacional de entrenadores profesionales' },
      ].map((item, i) => (
        <div key={i} style={{ padding: '14px 10px', background: 'white', borderRadius: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <img src={item.src} alt={item.alt} style={{ height: 44, objectFit: 'contain' }} />
          <div style={{ fontSize: 11, color: DGREY, lineHeight: 1.4 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function Testimonial() {
  return (
    <div style={{ background: 'white', borderRadius: 8, padding: '14px' }}>
      <p style={{ fontSize: 13, color: DGREY, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 6 }}>
        "Pensé que mi perro simplemente era difícil. Mike me explicó qué estaba pasando realmente — y en tres semanas vi la diferencia."
      </p>
      <p style={{ fontSize: 11, color: '#718096' }}>— Cliente Habla Perro, Cuernavaca</p>
    </div>
  );
}

// ── RESULT BODY ───────────────────────────────────────────────────────────────
function ResultBody({ c, c2, dogName, avg, showRadar, isMixed, restart, waUrl, preCTAText }: {
  c: any; c2?: any; dogName: string; avg: Record<string,number>;
  showRadar: boolean; isMixed: boolean; restart: () => void;
  waUrl: string; preCTAText: string;
}) {
  const combinedNeeds: string[] = isMixed && c2
    ? [...c.needs, ...c2.needs.filter((n: string) => !c.needs.includes(n))]
    : c.needs;

  // Split pre-CTA text into two paragraphs
  const [preCTAPara, ctaPara] = preCTAText.split('\n\n');

  return (
    <>
      {showRadar && (
        <div style={{ background: WARM, padding: '20px 24px' }}>
          <p className="sec-label">Perfil de {dogName}</p>
          <MiniRadar avg={avg} />
          <p style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginTop: 6 }}>⚠ Impulsos y Control Social: menor puntaje = menos regulación</p>
        </div>
      )}

      <div style={{ padding: '20px 24px 0' }}>
        <p className="sec-label">Lo que está pasando en realidad</p>
        <div className="myth-box" style={{ marginBottom: 14 }}>«{c.myth}»</div>
        <p style={{ color: DGREY, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{c.body}</p>

        {isMixed && c2 && (
          <>
            <div className="myth-box" style={{ marginBottom: 14, borderLeftColor: '#92BBE3' }}>«{c2.myth}»</div>
            <p style={{ color: DGREY, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{c2.body}</p>
          </>
        )}

        <p className="sec-label">Lo que necesita {dogName}</p>
        <div style={{ marginBottom: 8 }}>
          {combinedNeeds.map((nd: string, i: number) => (
            <div key={i} className="need-item">
              <span style={{ color: GREEN, fontSize: 15, flexShrink: 0 }}>✓</span>
              <span>{nd}</span>
            </div>
          ))}
        </div>
        <p style={{ color: DGREY, fontSize: 14, lineHeight: 1.7, marginTop: 10, marginBottom: 20 }}>{c.bridge(dogName)}</p>
      </div>

      {/* PRE-CTA BLOCK — replaces phone capture, transfers to WhatsApp CTA */}
      <div style={{ padding: '0 24px 4px' }}>
        <div className="pre-cta-block">
          <p style={{ marginBottom: 10 }}>{preCTAPara}</p>
          <p style={{ fontStyle: 'italic', color: '#4A5568' }}>{ctaPara}</p>
        </div>
      </div>

      {/* First CTA */}
      <div style={{ background: NAVY, padding: '24px' }}>
        <h3 style={{ color: 'white', fontSize: 17, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>{c.cta1(dogName)}</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16 }}>{c.sub1}</p>
        <a href={waUrl} target="_blank" rel="noreferrer" className="btn-wa">💬 Escribirle a Mike por WhatsApp</a>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>Sin compromiso · Solo una conversación</p>
      </div>

      {/* Credentials + testimonial */}
      <div style={{ padding: '20px 24px', background: WARM }}>
        <CredentialLogos />
        <Testimonial />
      </div>

      {/* Restart only */}
      <div style={{ padding: '16px 24px 24px', textAlign: 'center' }}>
        <button className="ghost-btn" onClick={restart}>Empezar de nuevo</button>
      </div>
    </>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]             = useState('intro');
  const [ownerName, setOwnerName]       = useState('');
  const [dogName, setDogName]           = useState('');
  const [dogBreed, setDogBreed]         = useState('');
  const [dogAge, setDogAge]             = useState('');
  const [qIndex, setQIndex]             = useState(0);
  const [answers, setAnswers]           = useState<any[]>([]);
  const [sel, setSel]                   = useState<number | null>(null);
  const [pendingAnswer, setPendingAnswer] = useState<any>(null);
  const [progress, setProgress]         = useState(0);
  const [result, setResult]             = useState<any>(null);
  const [preCTAText, setPreCTAText]     = useState('');

  const restart = () => {
    setScreen('intro'); setOwnerName(''); setDogName(''); setDogBreed(''); setDogAge('');
    setQIndex(0); setAnswers([]); setSel(null); setPendingAnswer(null);
    setProgress(0); setResult(null); setPreCTAText('');
  };

  const canStart = ownerName.trim() && dogName.trim();
  const waUrl    = buildWAUrl(ownerName, dogName);

  // After result renders: auto-capture as PDF → send to Drive
  useEffect(() => {
    if (screen !== 'result' || !result) return;
    if (!SHEETS_URL || SHEETS_URL.includes('PASTE_YOUR')) return;

    const captureAndSendPDF = async () => {
      try {
        // Load html2canvas from CDN if not already loaded
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).html2canvas) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            s.onload = () => resolve(); s.onerror = () => reject();
            document.head.appendChild(s);
          });
        }
        // Load jspdf from CDN if not already loaded
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).jspdf) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            s.onload = () => resolve(); s.onerror = () => reject();
            document.head.appendChild(s);
          });
        }

        const appDiv = document.querySelector('.app') as HTMLElement;
        if (!appDiv) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const h2c = (window as any).html2canvas;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { jsPDF } = (window as any).jspdf;

        // Capture full scrollable height
        const canvas = await h2c(appDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          scrollY: 0,
          width: appDiv.scrollWidth,
          height: appDiv.scrollHeight,
          windowWidth: appDiv.scrollWidth,
          windowHeight: appDiv.scrollHeight,
        });


        const pageW    = 210; // A4 mm
        const pageH    = 297;
        const imgW     = pageW;
        const imgH     = (canvas.height * imgW) / canvas.width;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        if (imgH <= pageH) {
          pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);
        } else {
          // Multi-page: slice into A4-height segments
          let yOffset = 0;
          while (yOffset < imgH) {
            if (yOffset > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, -yOffset, imgW, imgH);
            yOffset += pageH;
          }
        }

        const base64pdf = pdf.output('datauristring').split(',')[1];

        // Send to Apps Script → saved to Drive automatically
        fetch(SHEETS_URL, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'pdf_snapshot',
            owner_name: ownerName,
            dog_name: dogName,
            pdf_base64: base64pdf,
          }),
        });
      } catch (_) { /* silent — PDF capture is best-effort */ }
    };

    // Wait 2s for full render, then capture
    const timer = setTimeout(captureAndSendPDF, 2000);
    return () => clearTimeout(timer);
  }, [screen, result]);

  useEffect(() => {
    if (screen !== 'loading') return;
    let p = 0;
    const iv = setInterval(() => {
      p += 2; setProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        const res = calcScore(answers);
        setResult(res);
        const preText = buildPreCTA(res.cat, res.mixed ? res.cat2 : null, res.mixed);
        setPreCTAText(preText);
        submitToSheets({
          timestamp: new Date().toISOString(),
          owner_name: ownerName, dog_name: dogName,
          dog_breed: dogBreed || '—', dog_age: dogAge || '—',
          phone: '—',
          category: res.cat, category2: res.mixed ? res.cat2 : '—', mixed: res.mixed,
          activacion: +res.avg.activacion.toFixed(2), impulsos: +res.avg.impulsos.toFixed(2),
          sensibilidad: +res.avg.sensibilidad.toFixed(2), social: +res.avg.social.toFixed(2),
          conexion: +res.avg.conexion.toFixed(2), auto_ref: +res.avg.auto_ref.toFixed(2),
        });
        setTimeout(() => setScreen('result'), 300);
      }
    }, 30);
    return () => clearInterval(iv);
  }, [screen]);

  const handleSelect = (a: any, idx: number) => {
    setSel(idx);
    setPendingAnswer(a);
  };

  const handleSiguiente = () => {
    if (pendingAnswer === null) return;
    const na = [...answers, pendingAnswer];
    setAnswers(na);
    setSel(null);
    setPendingAnswer(null);
    if (qIndex < QUESTIONS.length - 1) { setQIndex(qIndex + 1); }
    else { setScreen('loading'); }
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <>
      <style>{css}</style>
      <div className="app" style={{ paddingBottom: 40 }}>
        <div style={{ background: NAVY, padding: '48px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img src={LOGO_WHITE} alt="Habla Perro" style={{ height: 80, objectFit: 'contain', marginBottom: 32 }} />
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 14 }}>¿Qué tipo de perro<br />tienes?</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
            Responde 6 preguntas y descubre qué está pasando realmente con su comportamiento — y por dónde empezar.
          </p>
        </div>
        <div style={{ padding: '28px 24px' }}>
          {/* Owner name */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>Tu nombre</label>
            <input className="input-field" type="text" placeholder="¿Cómo te llamas?" value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canStart && setScreen('quiz')} />
          </div>
          {/* Dog name */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>¿Cómo se llama tu perro?</label>
            <input className="input-field" type="text" placeholder="Escribe su nombre..." value={dogName}
              onChange={e => setDogName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canStart && setScreen('quiz')} />
          </div>
          {/* Dog breed — new */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>Raza</label>
            <input className="input-field" type="text" placeholder="Ej: Labrador, Mestizo, Chihuahua..." value={dogBreed}
              onChange={e => setDogBreed(e.target.value)} />
          </div>
          {/* Dog age — new */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>Edad del perro</label>
            <select className="input-field" value={dogAge} onChange={e => setDogAge(e.target.value)}
              style={{ appearance: 'auto' }}>
              <option value="">Selecciona...</option>
              {Array.from({length: 15}, (_, i) => i + 1).map(n => (
                <option key={n} value={String(n)}>{n} {n === 1 ? 'año' : 'años'}</option>
              ))}
            </select>
          </div>
          <button className="btn-green" onClick={() => canStart && setScreen('quiz')} disabled={!canStart}>
            Empezar ahora →
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#718096', marginTop: 12 }}>6 preguntas · 2 minutos · resultado inmediato</p>
          <div style={{ marginTop: 24, padding: '14px 16px', background: WARM, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={CCPDT_LOGO} alt="CCPDT" style={{ height: 36, objectFit: 'contain', flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: DGREY, lineHeight: 1.5 }}>Certificado por el consejo internacional<br />de entrenadores profesionales</p>
          </div>
        </div>
      </div>
    </>
  );

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (screen === 'quiz') {
    const q = QUESTIONS[qIndex];
    return (
      <>
        <style>{css}</style>
        <div className="app" style={{ paddingBottom: 32 }}>
          <div style={{ background: NAVY, padding: '18px 24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, minHeight: 28 }}>
              {/* Anterior always visible — on page 1 goes back to intro */}
              <button className="ghost-btn" style={{ color: 'rgba(255,255,255,0.6)' }} onClick={() => {
                if (qIndex === 0) {
                  setScreen('intro');
                } else {
                  setQIndex(qIndex - 1);
                  setAnswers(answers.slice(0, -1));
                  setSel(null);
                  setPendingAnswer(null);
                }
              }}>← Anterior</button>
              <img src={LOGO_WHITE} alt="Habla Perro" style={{ height: 26, objectFit: 'contain' }} />
            </div>
            <ProgBar n={qIndex} total={QUESTIONS.length} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 5, textAlign: 'right' }}>{qIndex+1} de {QUESTIONS.length}</div>
          </div>
          <div style={{ padding: '20px 24px 24px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: NAVY, lineHeight: 1.5, marginBottom: 14 }}>
              {(q as any).qHighlight
                ? <>{q.q(dogName)} <span style={{ textDecoration: 'underline', fontWeight: 700 }}>{(q as any).qHighlight}</span>{(q as any).qSuffix}</>
                : q.q(dogName)}
            </div>
            {/* Hint text on every question */}
            <div className="hint-text">Elige la opción que más se acerque a lo que hace {dogName}.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.answers.map((a, i) => (
                <button key={i} className={`ans-card${sel===i?' sel':''}`} onClick={() => handleSelect(a, i)}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: sel===i?'rgba(255,255,255,0.6)':GREEN, marginRight: 8 }}>
                    {['A','B','C','D','E'][i]}
                  </span>
                  {a.t}
                </button>
              ))}
            </div>
            <div className={`siguiente-wrap ${sel !== null ? 'visible' : 'hidden'}`} style={{ marginTop: 16 }}>
              <button className="btn-green" onClick={handleSiguiente} disabled={sel === null}>
                {qIndex < QUESTIONS.length - 1 ? 'Siguiente →' : 'Ver resultado →'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (screen === 'loading') return (
    <>
      <style>{css}</style>
      <div className="app" style={{ background: NAVY, justifyContent: 'center', alignItems: 'center', padding: '40px 24px', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <img src={LOGO_WHITE} alt="Habla Perro" style={{ height: 52, objectFit: 'contain', marginBottom: 28 }} />
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>Analizando el perfil<br />de {dogName}...</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, maxWidth: 260, margin: '0 auto 28px' }}>
            Cada perro tiene su propio patrón. Estamos encontrando el de {dogName}.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, height: 4, width: 260, overflow: 'hidden' }}>
            <div style={{ background: GREEN, height: '100%', width: `${progress}%`, transition: 'width 0.03s linear' }} />
          </div>
        </div>
      </div>
    </>
  );

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (screen === 'result' && result) {
    const { cat, cat2, mixed, avg } = result;
    const c  = COPY[cat];
    const c2 = mixed ? COPY[cat2] : null;
    if (!c) { restart(); return null; }

    return (
      <>
        <style>{css}</style>
        <div className="app" style={{ paddingBottom: 48 }}>
          <div style={{ background: NAVY, padding: '28px 24px', textAlign: 'center' }}>
            <img src={LOGO_WHITE} alt="Habla Perro" style={{ height: 40, objectFit: 'contain', display: 'block', margin: '0 auto 16px' }} />
            <div style={{ display: 'inline-block', background: 'rgba(42,196,0,0.2)', border: '1px solid rgba(42,196,0,0.4)', borderRadius: 20, padding: '3px 14px', fontSize: 11, color: GREEN, fontWeight: 700, marginBottom: 12 }}>
              {mixed ? 'Perfil combinado' : `El perfil de ${dogName}`}
            </div>
            {mixed ? (
              <>
                <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{dogName} tiene un perfil combinado</h1>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
                  Algunos perros no encajan en una sola categoría. {dogName} muestra características de dos patrones — su entrenamiento necesita atender más de una cosa al mismo tiempo.
                </p>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 32 }}>{c.emoji}</span>
                  <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{c.name}</h1>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6 }}>{c.rec(dogName)}</p>
              </>
            )}
          </div>

          {mixed && c2 && (
            <div style={{ padding: '20px 24px 0' }}>
              <p className="sec-label">Los dos perfiles de {dogName}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
                {[c, c2].map((cc: any, i: number) => (
                  <div key={i} style={{ background: WARM, borderRadius: 10, padding: '16px 12px', textAlign: 'center', border: `2px solid ${i===0?NAVY:'#E2E8F0'}` }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{cc.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{cc.name}</div>
                    <div style={{ fontSize: 11, color: DGREY, marginTop: 4 }}>{cc.energy}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: WARM, padding: '20px 24px', marginTop: mixed ? 16 : 0 }}>
            <p className="sec-label">Perfil de {dogName}</p>
            <MiniRadar avg={avg} />
            <p style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginTop: 6 }}>⚠ Impulsos y Control Social: menor puntaje = menos regulación</p>
          </div>

          <ResultBody
            c={c} c2={c2 ?? undefined} dogName={dogName} avg={avg}
            showRadar={false} isMixed={mixed}
            restart={restart} waUrl={waUrl} preCTAText={preCTAText}
          />
        </div>
      </>
    );
  }

  return null;
}
