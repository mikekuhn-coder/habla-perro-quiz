import { useState, useEffect } from 'react';

const NAVY  = '#0F2451';
const GREEN = '#2AC400';
const WARM  = '#F5F5F4';
const DGREY = '#4A5568';

// WhatsApp number encoded to avoid plain-text scraping
const WA_NUM = atob('NTI3Nzc2MTAxNjQ3');

// Dynamic WA URL — personalized with owner and dog name
const buildWAUrl = (ownerName: string, dogName: string) => {
  const msg = `Hola Mike, soy ${ownerName}. Acabo de hacer el quiz con ${dogName} y me gustaría saber más. 🐾`;
  return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
};

const LOGO_WHITE = '/02-HP-Logo-Main-White.png';
const CCPDT_LOGO = '/cpdt-ka-color-med.png';
const APDT_LOGO  = '/APDT%20logo.png';

// Google Apps Script endpoint
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwOYII3A9PnS8XOhkmgqlkzg8GsAZW_XGQkSA1Zj106QV9yq4PqkL2hyAdXOtzXSJo/exec';

const TRAITS       = ['activacion','impulsos','sensibilidad','social','conexion','auto_ref'];
const TRAIT_LABELS = ['Activación','Impulsos','Sensibilidad','Control Social','Conexión','Auto-ref.'];
const VALID_CATS   = ['red_bull','alcalde_amiguero','protector_preocupado','dramatico','independiente','sombra','genio_selectivo','oportunista'];

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

// ── QUESTIONS — all spelling and punctuation verified ─────────────────────────
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
    q: (n: string) => `En casa, ${n} generalmente...`,
    answers: [
      { t: 'Nunca para — siempre está en movimiento.',                    s: { activacion:5, auto_ref:3 } },
      { t: 'Te sigue a todos lados y busca tu atención.',                 s: { conexion:5, activacion:3 } },
      { t: 'Se altera fácil con ruidos o cambios en la rutina.',          s: { sensibilidad:4, activacion:3 } },
      { t: 'Es tranquilo e independiente.',                               s: { conexion:1, activacion:2 } },
      { t: 'Tiene momentos activos y momentos tranquilos.',               s: { activacion:2, conexion:3 } },
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
      { t: 'Lo investiga un momento y sigue caminando.',                 s: { auto_ref:3, conexion:3 } },
      { t: 'Lo ignora — no le llama mucho la atención.',                 s: { auto_ref:1, conexion:3 } },
      { t: 'Se encierra en eso completamente y te ignora por completo.', s: { auto_ref:5, conexion:1 } },
      { t: 'Lo nota, lo investiga un momento y vuelve contigo.',         s: { auto_ref:2, conexion:4 } },
    ],
  },
];

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
    cta2: 'Cuando estés lista para empezar, aquí estoy.',
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
    cta2: 'Este es exactamente el tipo de caso que trabajo en mis clases grupales.',
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
    cta2: 'Cuando estés lista para ayudar a tu perro a sentirse más seguro.',
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
    cta2: 'Este perfil responde muy bien al entrenamiento correcto.',
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
    cta2: 'Cuando estés lista para que tu perro te elija — incluso afuera.',
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
    cta2: 'Cuando estés lista para que tu perro — y tú — respiren un poco.',
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
    cta2: 'Cuando estés lista para que tu perro te funcione — también afuera.',
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
    cta2: 'Cuando estés lista para que tu perro trabaje contigo, no contra ti.',
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

// ── SHEETS SUBMISSION ─────────────────────────────────────────────────────────
async function submitToSheets(payload: Record<string, any>) {
  if (!SHEETS_URL || SHEETS_URL.includes('PASTE_YOUR')) return;
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
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
  .ans-card { background: white; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; cursor: pointer; font-size: 14px; color: #2D3748; text-align: left; width: 100%; transition: all 0.12s; line-height: 1.5; }
  .ans-card:hover { border-color: #0F2451; background: #F7F9FF; }
  .ans-card.sel { background: #0F2451; color: white; border-color: #0F2451; }
  .input-field { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; font-size: 16px; outline: none; color: #2D3748; }
  .input-field:focus { border-color: #0F2451; }
  .myth-box { background: #FFF7ED; border-left: 4px solid #2AC400; border-radius: 0 8px 8px 0; padding: 14px 16px; font-style: italic; color: #2D3748; font-size: 14px; line-height: 1.6; }
  .need-item { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #4A5568; line-height: 1.5; }
  .need-item:last-child { border-bottom: none; }
  .sec-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #2AC400; margin-bottom: 8px; }
  .ghost-btn { background: none; border: none; color: #718096; font-size: 13px; cursor: pointer; padding: 8px 0; }
`;

// ── COMPONENTS ────────────────────────────────────────────────────────────────
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
        const gp = TRAITS.map((_, i) => { const a = (i/n)*2*Math.PI-Math.PI/2; return `${cx+r*f*Math.cos(a)},${cy+r*f*Math.sin(a)}`; }).join(' ');
        return <polygon key={fi} points={gp} fill="none" stroke="#E2E8F0" strokeWidth={1} />;
      })}
      {TRAITS.map((_, i) => { const a = (i/n)*2*Math.PI-Math.PI/2; return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#E2E8F0" strokeWidth={1} />; })}
      <polygon points={pts.map(p=>`${p.x},${p.y}`).join(' ')} fill="#0F2451" fillOpacity={0.35} stroke="#0F2451" strokeWidth={2} />
      {TRAITS.map((_, i) => {
        const a = (i/n)*2*Math.PI-Math.PI/2;
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

function PhoneCapture({ phone, setPhone }: { phone: string; setPhone: (v: string) => void }) {
  return (
    <div style={{ background: WARM, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
      <p style={{ fontSize: 13, color: NAVY, fontWeight: 600, marginBottom: 8 }}>
        ¿Quieres que te contacte directamente?
        <span style={{ fontSize: 12, color: DGREY, fontWeight: 400, marginLeft: 4 }}>(opcional)</span>
      </p>
      <input
        type="tel"
        placeholder="Tu número de WhatsApp..."
        value={phone}
        onChange={e => setPhone(e.target.value)}
        style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '12px 14px', fontSize: 15, outline: 'none', color: '#2D3748' }}
      />
    </div>
  );
}

// ── RESULT BODY ───────────────────────────────────────────────────────────────
// Layout order (verified):
// 1. Radar (if showRadar)
// 2. Primary myth + body
// 3. Secondary myth + body (mixed only) ← ABOVE combined needs
// 4. Combined needs list (both profiles merged)
// 5. Bridge text
// 6. Phone capture (optional)
// 7. First CTA (WhatsApp) ← second profile is ABOVE this
// 8. Credentials + testimonial
// 9. Second CTA + restart
function ResultBody({ c, c2, dogName, avg, showRadar, isMixed, restart, phone, setPhone, waUrl }: {
  c: any; c2?: any; dogName: string; avg: Record<string,number>;
  showRadar: boolean; isMixed: boolean; restart: () => void;
  phone: string; setPhone: (v: string) => void; waUrl: string;
}) {
  // Combined needs — deduplicated merge of both profiles
  const combinedNeeds: string[] = isMixed && c2
    ? [...c.needs, ...c2.needs.filter((n: string) => !c.needs.includes(n))]
    : c.needs;

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
        {/* PRIMARY myth + body */}
        <p className="sec-label">Lo que está pasando en realidad</p>
        <div className="myth-box" style={{ marginBottom: 14 }}>«{c.myth}»</div>
        <p style={{ color: DGREY, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{c.body}</p>

        {/* SECONDARY myth + body — ABOVE the needs list and CTA */}
        {isMixed && c2 && (
          <>
            <div className="myth-box" style={{ marginBottom: 14, borderLeftColor: '#92BBE3' }}>«{c2.myth}»</div>
            <p style={{ color: DGREY, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{c2.body}</p>
          </>
        )}

        {/* COMBINED needs list */}
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

      {/* Optional phone capture — before CTA */}
      <div style={{ padding: '0 24px' }}>
        <PhoneCapture phone={phone} setPhone={setPhone} />
      </div>

      {/* FIRST CTA — WhatsApp */}
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

      {/* SECOND CTA */}
      <div style={{ padding: '24px' }}>
        <h3 style={{ color: NAVY, fontSize: 16, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>{c.cta2}</h3>
        <p style={{ color: DGREY, fontSize: 13, marginBottom: 14 }}>Escribe a Mike y cuéntale todo.</p>
        <a href={waUrl} target="_blank" rel="noreferrer" className="btn-navy">💬 Hablar con Mike</a>
        <button className="ghost-btn" onClick={restart} style={{ width: '100%', textAlign: 'center', marginTop: 8 }}>Empezar de nuevo</button>
      </div>
    </>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState('intro');
  const [ownerName, setOwnerName] = useState('');
  const [dogName, setDogName]     = useState('');
  const [qIndex, setQIndex]       = useState(0);
  const [answers, setAnswers]     = useState<any[]>([]);
  const [sel, setSel]             = useState<number | null>(null);
  const [progress, setProgress]   = useState(0);
  const [result, setResult]       = useState<any>(null);
  const [phone, setPhone]         = useState('');

  const restart = () => {
    setScreen('intro'); setOwnerName(''); setDogName(''); setQIndex(0);
    setAnswers([]); setSel(null); setProgress(0); setResult(null); setPhone('');
  };

  const canStart = ownerName.trim() && dogName.trim();

  // Build personalized WA URL from quiz data
  const waUrl = buildWAUrl(ownerName, dogName);

  // Submit phone update when entered on result page
  useEffect(() => {
    if (screen === 'result' && phone && result) {
      submitToSheets({
        timestamp: new Date().toISOString(),
        owner_name: ownerName, dog_name: dogName, phone,
        category: result.cat, category2: result.mixed ? result.cat2 : '—',
        mixed: result.mixed,
        activacion: +result.avg.activacion.toFixed(2),
        impulsos: +result.avg.impulsos.toFixed(2),
        sensibilidad: +result.avg.sensibilidad.toFixed(2),
        social: +result.avg.social.toFixed(2),
        conexion: +result.avg.conexion.toFixed(2),
        auto_ref: +result.avg.auto_ref.toFixed(2),
        update: true,
      });
    }
  }, [phone]);

  // Loading — score and submit
  useEffect(() => {
    if (screen !== 'loading') return;
    let p = 0;
    const iv = setInterval(() => {
      p += 2; setProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        const res = calcScore(answers);
        setResult(res);
        submitToSheets({
          timestamp: new Date().toISOString(),
          owner_name: ownerName, dog_name: dogName, phone: phone || '—',
          category: res.cat, category2: res.mixed ? res.cat2 : '—', mixed: res.mixed,
          activacion: +res.avg.activacion.toFixed(2),
          impulsos: +res.avg.impulsos.toFixed(2),
          sensibilidad: +res.avg.sensibilidad.toFixed(2),
          social: +res.avg.social.toFixed(2),
          conexion: +res.avg.conexion.toFixed(2),
          auto_ref: +res.avg.auto_ref.toFixed(2),
        });
        setTimeout(() => setScreen('result'), 300);
      }
    }, 30);
    return () => clearInterval(iv);
  }, [screen]);

  const handleAnswer = (a: any, idx: number) => {
    setSel(idx);
    setTimeout(() => {
      const na = [...answers, a];
      setAnswers(na);
      setSel(null);
      if (qIndex < QUESTIONS.length - 1) { setQIndex(qIndex + 1); }
      else { setScreen('loading'); }
    }, 200);
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <>
      <style>{css}</style>
      <div className="app" style={{ paddingBottom: 40 }}>
        <div style={{ background: NAVY, padding: '48px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img src={LOGO_WHITE} alt="Habla Perro" style={{ height: 80, objectFit: 'contain', marginBottom: 32 }} />
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 14 }}>¿Qué tipo de perro<br />es el tuyo?</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
            Responde 6 preguntas y descubre qué está pasando realmente con su comportamiento — y por dónde empezar.
          </p>
        </div>
        <div style={{ padding: '28px 24px' }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>Tu nombre</label>
            <input className="input-field" type="text" placeholder="¿Cómo te llamas?" value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canStart && setScreen('quiz')} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>¿Cómo se llama tu perro?</label>
            <input className="input-field" type="text" placeholder="Escribe su nombre..." value={dogName}
              onChange={e => setDogName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canStart && setScreen('quiz')} />
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
              {qIndex > 0
                ? <button className="ghost-btn" style={{ color: 'rgba(255,255,255,0.6)' }} onClick={() => { setQIndex(qIndex-1); setAnswers(answers.slice(0,-1)); }}>← Anterior</button>
                : <div />}
              <img src={LOGO_WHITE} alt="Habla Perro" style={{ height: 26, objectFit: 'contain' }} />
            </div>
            <ProgBar n={qIndex} total={QUESTIONS.length} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 5, textAlign: 'right' }}>{qIndex+1} de {QUESTIONS.length}</div>
          </div>
          <div style={{ padding: '20px 24px 24px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: NAVY, lineHeight: 1.5, marginBottom: 18 }}>
              {(q as any).qHighlight
                ? <>{q.q(dogName)} <span style={{ textDecoration: 'underline', fontWeight: 700 }}>{(q as any).qHighlight}</span>{(q as any).qSuffix}</>
                : q.q(dogName)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.answers.map((a, i) => (
                <button key={i} className={`ans-card${sel===i?' sel':''}`} onClick={() => handleAnswer(a, i)}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: sel===i?'rgba(255,255,255,0.6)':GREEN, marginRight: 8 }}>
                    {['A','B','C','D','E'][i]}
                  </span>
                  {a.t}
                </button>
              ))}
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
          {/* Header — always centered */}
          <div style={{ background: NAVY, padding: '28px 24px', textAlign: 'center' }}>
            <img src={LOGO_WHITE} alt="Habla Perro" style={{ height: 40, objectFit: 'contain', display: 'block', margin: '0 auto 16px' }} />
            <div style={{ display: 'inline-block', background: 'rgba(42,196,0,0.2)', border: '1px solid rgba(42,196,0,0.4)', borderRadius: 20, padding: '3px 14px', fontSize: 11, color: GREEN, fontWeight: 700, marginBottom: 12 }}>
              {mixed ? 'PERFIL COMBINADO' : `RESULTADO DE ${dogName.toUpperCase()}`}
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

          {/* Mixed — profile cards */}
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

          {/* Radar */}
          <div style={{ background: WARM, padding: '20px 24px', marginTop: mixed ? 16 : 0 }}>
            <p className="sec-label">Perfil de {dogName}</p>
            <MiniRadar avg={avg} />
            <p style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginTop: 6 }}>⚠ Impulsos y Control Social: menor puntaje = menos regulación</p>
          </div>

          {/* Result body — second profile ABOVE CTA, combined needs */}
          <ResultBody
            c={c} c2={c2 ?? undefined} dogName={dogName} avg={avg}
            showRadar={false} isMixed={mixed}
            restart={restart} phone={phone} setPhone={setPhone}
            waUrl={waUrl}
          />
        </div>
      </>
    );
  }

  return null;
}
