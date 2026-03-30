import { useState, useEffect } from 'react';

const NAVY = '#0F2451';
const GREEN = '#2AC400';
const WARM = '#F5F5F4';
const DGREY = '#4A5568';
const WA_URL = 'https://wa.me/527776101647?text=CUERNAVACA';

const TRAITS = [
  'activacion',
  'impulsos',
  'sensibilidad',
  'social',
  'conexion',
  'auto_ref',
];
const TRAIT_LABELS = [
  'Activación',
  'Control\nImpulsos',
  'Sensibilidad',
  'Control\nSocial',
  'Conexión',
  'Auto-ref.',
];

const VECTORS = {
  red_bull: {
    activacion: 5,
    impulsos: 1,
    sensibilidad: 2,
    social: 2,
    conexion: 3,
    auto_ref: 3,
  },
  alcalde_amiguero: {
    activacion: 4,
    impulsos: 2,
    sensibilidad: 2,
    social: 1,
    conexion: 3,
    auto_ref: 2,
  },
  protector_preocupado: {
    activacion: 3,
    impulsos: 2,
    sensibilidad: 5,
    social: 1,
    conexion: 3,
    auto_ref: 2,
  },
  dramatico: {
    activacion: 5,
    impulsos: 1,
    sensibilidad: 5,
    social: 2,
    conexion: 3,
    auto_ref: 3,
  },
  independiente: {
    activacion: 3,
    impulsos: 3,
    sensibilidad: 2,
    social: 3,
    conexion: 1,
    auto_ref: 4,
  },
  sombra: {
    activacion: 2,
    impulsos: 3,
    sensibilidad: 4,
    social: 3,
    conexion: 5,
    auto_ref: 2,
  },
  genio_selectivo: {
    activacion: 3,
    impulsos: 2,
    sensibilidad: 2,
    social: 3,
    conexion: 2,
    auto_ref: 4,
  },
  oportunista: {
    activacion: 3,
    impulsos: 2,
    sensibilidad: 1,
    social: 3,
    conexion: 2,
    auto_ref: 5,
  },
};

const QUESTIONS = [
  {
    q: (n) => `Cuando sales a caminar con ${n}...`,
    answers: [
      {
        t: 'Jala todo el tiempo y no para de moverse',
        s: { activacion: 5, impulsos: 1 },
        ts: 'global',
      },
      {
        t: 'Quiere saludar a cada perro y persona que ve',
        s: { activacion: 4, social: 1 },
        ts: 'social',
      },
      {
        t: 'Se pone tenso o ladra cuando algo le preocupa',
        s: { sensibilidad: 4, social: 2 },
      },
      {
        t: 'Va a su ritmo, sin mucho interés en ti',
        s: { conexion: 1, auto_ref: 4 },
      },
    ],
  },
  {
    q: () => 'Cuando ve a otro perro o a una persona desconocida...',
    answers: [
      {
        t: 'Pierde completamente el control',
        s: { impulsos: 1, activacion: 5 },
      },
      {
        t: 'Se emociona mucho y quiere llegar a como dé lugar',
        s: { impulsos: 2, social: 1 },
      },
      {
        t: 'Se pone alerta, inseguro o reactivo',
        s: { sensibilidad: 5, impulsos: 2 },
      },
      { t: 'Decide si le interesa o no', s: { impulsos: 3, auto_ref: 4 } },
    ],
  },
  {
    q: (n) => `En casa, ${n} generalmente...`,
    answers: [
      {
        t: 'Nunca para — siempre está en movimiento',
        s: { activacion: 5, auto_ref: 3 },
      },
      {
        t: 'Te sigue a todos lados y busca tu atención',
        s: { conexion: 5, activacion: 3 },
      },
      {
        t: 'Se altera fácil con ruidos o cambios en la rutina',
        s: { sensibilidad: 4, activacion: 3 },
      },
      { t: 'Es tranquilo e independiente', s: { conexion: 1, activacion: 2 } },
    ],
  },
  {
    q: (n) => `Cuando le pides algo a ${n}`,
    qHighlight: 'fuera de casa',
    qSuffix: '...',
    answers: [
      {
        t: 'No puede concentrarse — está muy activado',
        s: { impulsos: 1, activacion: 5 },
      },
      {
        t: 'Quiere hacerlo pero algo lo distrae',
        s: { conexion: 3, auto_ref: 3 },
        pat: 'ctx',
      },
      {
        t: 'Duda, se bloquea o no reacciona',
        s: { sensibilidad: 4, conexion: 3 },
      },
      {
        t: 'Solo responde si le conviene en ese momento',
        s: { auto_ref: 4, conexion: 2 },
        pat: 'con',
      },
    ],
  },
  {
    q: (n) => `Con otros perros o personas desconocidas, ${n}...`,
    answers: [
      {
        t: 'Es intenso en cualquier situación, no importa el contexto',
        s: { social: 1, activacion: 5 },
        ts: 'global',
      },
      {
        t: 'Se lanza a saludar sin medir el espacio de los demás',
        s: { social: 1, activacion: 3 },
        ts: 'social',
      },
      {
        t: 'Se pone reactivo, inseguro o a la defensiva',
        s: { sensibilidad: 5, social: 2 },
      },
      {
        t: 'Es selectivo — depende del día y del momento',
        s: { social: 3, conexion: 2 },
      },
    ],
  },
  {
    q: (n) =>
      `Cuando ${n} encuentra comida, un olor o algo interesante en el suelo...`,
    answers: [
      {
        t: 'Se obsesiona — no hay nada que lo pare',
        s: { auto_ref: 5, impulsos: 1 },
      },
      {
        t: 'Lo investiga un momento y sigue caminando',
        s: { auto_ref: 3, conexion: 3 },
      },
      {
        t: 'Se pone nervioso, protector o tenso',
        s: { sensibilidad: 4, social: 2 },
      },
      {
        t: 'Se encierra en eso completamente y te ignora por completo',
        s: { auto_ref: 5, conexion: 1 },
      },
    ],
  },
];

const COPY = {
  red_bull: {
    name: 'Red Bull Dog',
    emoji: '🔴',
    energy: 'Explosivo',
    rec: (n) =>
      `${n} vive a mil por hora: jala en la correa, ignora todo cuando se emociona y parece que nunca tiene apagador. No es que no te quiera escuchar — es que cuando está así, literalmente no puede.`,
    myth: 'Muchos piensan que un perro así necesita más ejercicio o mano más firme. Ninguna de las dos cosas resuelve esto.',
    body: `Lo que está pasando es que tiene un nivel de activación muy alto que se retroalimenta solo. Cuando esa activación sube demasiado, el cerebro deja de tener acceso a lo que sabe hacer. No es desobediencia — es que su sistema nervioso todavía no aprendió a bajar las revoluciones, y eso sí tiene solución.`,
    needs: [
      'Aprender la calma como habilidad entrenada, no como consecuencia del cansancio',
      'Control de impulsos con distracciones graduales y manejables',
      'Rutinas que bajen su activación antes de pedirle concentración',
    ],
    bridge: (n) =>
      `Con un plan claro, ${n} puede aprender a regularse — y ese cambio transforma cada salida, cada visita y cada momento en casa.`,
    cta1: (n) => `¿Por dónde empiezas con un perro como ${n}?`,
    sub1: 'Cuéntame qué está pasando y te digo qué haría yo primero.',
    cta2: 'Cuando estés lista para empezar, aquí estoy.',
  },
  alcalde_amiguero: {
    name: 'Alcalde Amiguero',
    emoji: '🟡',
    energy: 'Intenso',
    rec: (n) =>
      `${n} ama a todo el mundo — y ese amor no tiene filtro ni freno. Salta, jala, invade el espacio... y tú terminas disculpándote con todos en el parque.`,
    myth: "'Es que es muy amistoso' — todos lo dicen. Pero amistoso y sin control no es lo mismo.",
    body: `Lo que está pasando es que aprendió que lanzarse y empujar funciona — porque históricamente le ha dado acceso a lo que más quiere: contacto social. No tiene freno porque nunca aprendió que esperar también tiene recompensa. No es mal carácter. Es una historia de aprendizaje que se puede reescribir.`,
    needs: [
      'Aprender a esperar antes de tener acceso a lo que quiere',
      'Control de impulsos específicamente en contextos sociales',
      'Saludos controlados como comportamiento que vale la pena',
    ],
    bridge: (n) =>
      `Cuando ${n} entienda que la calma abre puertas — literalmente — todo cambia para él y para ti.`,
    cta1: (n) => `¿Quieres que ${n} aprenda a saludar sin drama?`,
    sub1: 'Escríbeme y hablamos de qué está pasando exactamente.',
    cta2: 'Este es exactamente el tipo de caso que trabajo en mis clases grupales.',
  },
  protector_preocupado: {
    name: 'Protector Preocupado',
    emoji: '🟠',
    energy: 'Defensivo',
    rec: (n) =>
      `${n} ladra, se tensa o reacciona cuando algo le preocupa — y tú ya aprendiste qué situaciones lo van a disparar. Caminar con él a veces se siente como anticipar una crisis que no puedes evitar.`,
    myth: "Es fácil pensar que es agresivo, dominante o simplemente 'así es'. Ninguna de esas cosas es lo que está pasando.",
    body: `Lo que está mostrando es miedo o inseguridad — no agresión. Aprendió que cuando ladra o se lanza, las cosas que lo asustan se van, y eso refuerza exactamente la conducta que más te preocupa. No está siendo malo. Está haciendo lo único que sabe hacer cuando se siente inseguro.`,
    needs: [
      'Construir seguridad emocional primero — antes de trabajar la reactividad',
      'Exposición gradual con respuestas alternativas al ladrido y al jalón',
      'Un perro que se siente seguro no necesita ponerse a la defensiva',
    ],
    bridge: (n) =>
      `Este proceso requiere paciencia y un plan claro — pero cuando ${n} empiece a sentirse seguro, los cambios son profundos y duraderos.`,
    cta1: () => `Esto tiene solución — y no requiere corrección ni castigo.`,
    sub1: 'Cuéntame qué situaciones lo disparan y por dónde vamos.',
    cta2: 'Cuando estés lista para ayudar a tu perro a sentirse más seguro.',
  },
  dramatico: {
    name: 'Dramático',
    emoji: '🟣',
    energy: 'Volátil',
    rec: (n) =>
      `${n} puede estar tranquilo un momento y al siguiente estar en modo volcán — ladrando, jalando o haciendo drama total. No hay punto medio: o está bien o está completamente desbordado.`,
    myth: 'Muchos lo ven como agresividad o mal temperamento. Pero lo que está pasando no es agresión — es frustración.',
    body: `Cuando quiere algo y no puede tenerlo, su tolerancia se agota muy rápido. Y en algún punto aprendió que escalar el drama a veces funciona. No es peligroso ni roto. Su sistema emocional simplemente no aprendió aún a manejar la espera.`,
    needs: [
      'Tolerancia a la frustración — aprender que esperar también tiene recompensa',
      'Bajar la intensidad emocional antes de pedir comportamientos específicos',
      'Que la calma abra lo que el drama no puede abrir',
    ],
    bridge: (n) =>
      `Con el entrenamiento correcto, ${n} puede aprender que no necesita explotar para conseguir lo que quiere.`,
    cta1: (n) => `¿Quieres entender qué dispara a ${n} y cómo manejarlo?`,
    sub1: 'Escríbeme y hablamos de qué está pasando exactamente.',
    cta2: 'Este perfil responde muy bien al entrenamiento correcto.',
  },
  independiente: {
    name: 'Independiente',
    emoji: '🔵',
    energy: 'Desconectado',
    rec: (n) =>
      `Le hablas y no voltea. Lo llamas y sigue olfateando. En casa te hace caso — afuera es como si no existieras. ${n} tiene su propio mundo, y tú no siempre estás incluida.`,
    myth: 'Esto se interpreta casi siempre como terquedad o dominancia. Ninguna de las dos cosas es lo que está pasando.',
    body: `Lo que está pasando es más simple: el mundo afuera le ofrece más recompensa que tú en este momento. No es personal. Es que todavía no descubrió que trabajar contigo vale más la pena que seguir ese olor.`,
    needs: [
      'Construir valor de reforzamiento contigo — tú necesitas competir con el entorno',
      'Conexión y engagement como base, antes de exigir obediencia',
      'Recall confiable como primer objetivo medible y real',
    ],
    bridge: (n) =>
      `Cuando ${n} descubra que orientarse hacia ti predice cosas buenas, todo lo demás se vuelve mucho más fácil.`,
    cta1: (n) =>
      `El recall confiable de ${n} empieza aquí — y es más rápido de lo que crees.`,
    sub1: 'Cuéntame cómo es afuera y por dónde empezamos.',
    cta2: 'Cuando estés lista para que tu perro te elija — incluso afuera.',
  },
  sombra: {
    name: 'Sombra',
    emoji: '⚫',
    energy: 'Dependiente',
    rec: (n) =>
      `${n} te sigue a todos lados, se angustia cuando no te ve y no puede quedarse solo sin que algo pase. Lo que muchos ven como amor total, tú sabes que a veces se siente agotador — para los dos.`,
    myth: "'Es que te quiere mucho' — todos lo dicen. Pero lo que muestra no es solo amor. Es dependencia emocional.",
    body: `No tiene todavía las habilidades para regularse solo. Tú te convertiste en su única fuente de calma — y eso es mucho peso para los dos. No está mal apegado ni es un perro dañado. Simplemente nunca aprendió que también puede estar bien cuando está solo.`,
    needs: [
      'Desarrollar autonomía — la calma independiente como habilidad entrenada',
      'Tolerancia gradual a la separación, sin ansiedad en el proceso',
      'Momentos y espacios propios que aprenda a disfrutar',
    ],
    bridge: (n) =>
      `Un perro con autonomía es más equilibrado, más feliz — y tú puedes moverte por tu casa sin escolta permanente.`,
    cta1: (n) => `La independencia de ${n} se entrena — con calma y sin drama.`,
    sub1: 'Escríbeme y hablamos de cómo está siendo esto en casa.',
    cta2: 'Cuando estés lista para que tu perro — y tú — respiren un poco.',
  },
  genio_selectivo: {
    name: 'Genio Selectivo',
    emoji: '🟢',
    energy: 'Condicional',
    rec: (n) =>
      `En casa te hace caso perfecto. Afuera es como si nunca hubiera aprendido nada. ${n} sabe exactamente lo que le pides — solo que decide cuándo vale la pena hacerlo.`,
    myth: "Esto se lee casi siempre como manipulación o que 'el perro te está probando'. No es ninguna de las dos cosas.",
    body: `Lo que está pasando es que aprendió los comportamientos en un contexto — y nadie le enseñó que aplican en todos los demás. Afuera, el entorno compite con tus instrucciones y gana. Por ahora. No está eligiendo ignorarte. Está respondiendo exactamente como su historia de entrenamiento le enseñó a responder.`,
    needs: [
      'Generalizar lo que ya sabe a diferentes entornos y niveles de distracción',
      'Consistencia en el reforzamiento — que responder siempre valga la pena',
      'Entrenamiento en contextos reales, no solo dentro de casa',
    ],
    bridge: (n) =>
      `Cuando las reglas sean las mismas en todos lados, ${n} va a dejar de "elegir" — porque la respuesta correcta siempre va a tener valor.`,
    cta1: (n) => `Lo que ${n} ya sabe puede funcionar en cualquier lugar.`,
    sub1: 'Cuéntame en qué situaciones te falla y por dónde empezamos.',
    cta2: 'Cuando estés lista para que tu perro te funcione — también afuera.',
  },
  oportunista: {
    name: 'Oportunista',
    emoji: '🟤',
    energy: 'Oportunista',
    rec: (n) =>
      `${n} roba comida, destruye cosas, se lanza hacia lo que le interesa — y lo hace con una eficiencia que casi da risa. Sabe exactamente lo que quiere y siempre encuentra la manera de conseguirlo.`,
    myth: "Es tentador pensar que lo hace con intención, que es 'malicioso' o que actúa por despecho. No es ninguna de esas cosas.",
    body: `Lo que está pasando es más simple: esas conductas le funcionan y le funcionan bien. El mundo le paga mejor que tú en este momento. No es un perro malo. Es un perro muy bueno encontrando recompensas donde las hay.`,
    needs: [
      'Manejo del entorno — evitar que las conductas indeseadas sigan siendo rentables',
      'Alternativas que también valgan la pena y que pueda elegir en su lugar',
      'Construir contigo una historia de reforzamiento que compita con el entorno',
    ],
    bridge: (n) =>
      `Cuando tú seas la fuente más predecible de cosas buenas, ${n} va a preferir trabajar contigo — porque eso también tiene sentido para él.`,
    cta1: (n) => `Cambiar la ecuación de ${n} es más directo de lo que parece.`,
    sub1: 'Cuéntame qué conductas te están volviendo loca y empezamos ahí.',
    cta2: 'Cuando estés lista para que tu perro trabaje contigo, no contra ti.',
  },
};

function score(answers) {
  const tot = {},
    cnt = {};
  TRAITS.forEach((t) => {
    tot[t] = 0;
    cnt[t] = 0;
  });
  answers.forEach((a) => {
    Object.entries(a.s).forEach(([t, v]) => {
      tot[t] += v;
      cnt[t]++;
    });
  });
  const avg = {};
  TRAITS.forEach((t) => {
    avg[t] = cnt[t] > 0 ? tot[t] / cnt[t] : 3;
  });

  const dists = {};
  Object.entries(VECTORS).forEach(([cat, vec]) => {
    dists[cat] = Math.sqrt(
      TRAITS.reduce((s, t) => s + Math.pow(avg[t] - vec[t], 2), 0)
    );
  });
  const sorted = Object.entries(dists).sort((a, b) => a[1] - b[1]);
  let primary = sorted[0][0],
    second = sorted[1][0];
  const gap = sorted[1][1] - sorted[0][1];

  const ts =
    answers[0]?.ts === 'global' && answers[4]?.ts === 'global'
      ? 'global'
      : answers[0]?.ts === 'social' || answers[4]?.ts === 'social'
      ? 'social'
      : '?';
  const pat =
    answers[3]?.pat === 'con' ? 'con' : answers[3]?.pat === 'ctx' ? 'ctx' : '?';

  if (gap < 1.5) {
    const pair = [primary, second].sort().join('|');
    if (pair === 'dramatico|red_bull') {
      primary = avg.sensibilidad >= 4 ? 'dramatico' : 'red_bull';
    }
    if (pair === 'alcalde_amiguero|red_bull') {
      primary =
        avg.social <= 1 && ts === 'social' ? 'alcalde_amiguero' : 'red_bull';
    }
    if (pair === 'genio_selectivo|oportunista') {
      primary =
        avg.conexion <= 2 && pat === 'con' ? 'oportunista' : 'genio_selectivo';
    }
  }

  const mixed = gap < 0.5;
  if (sorted[0][1] > 2.5) primary = 'genio_selectivo';
  return { cat: primary, cat2: second, mixed, avg };
}

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .app { max-width: 440px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
  .btn-green { background: #2AC400; color: #0F2451; border: none; border-radius: 8px; padding: 14px 24px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; }
  .btn-green:hover { background: #22A000; }
  .btn-wa { background: #25D366; color: white; border: none; border-radius: 8px; padding: 16px 24px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; text-decoration: none; }
  .btn-wa:hover { background: #1FB855; }
  .btn-ghost { background: transparent; color: #718096; border: none; font-size: 14px; cursor: pointer; padding: 8px 0; display: flex; align-items: center; gap: 6px; }
  .ans-card { background: white; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; cursor: pointer; font-size: 15px; color: #2D3748; text-align: left; width: 100%; transition: all 0.12s; }
  .ans-card:hover { border-color: #0F2451; background: #F7F9FF; }
  .ans-card.selected { background: #0F2451; color: white; border-color: #0F2451; }
  .input-field { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; font-size: 16px; outline: none; color: #2D3748; }
  .input-field:focus { border-color: #0F2451; }
  .myth-box { background: #FFF7ED; border-left: 4px solid #2AC400; border-radius: 0 8px 8px 0; padding: 14px 16px; font-style: italic; color: #2D3748; font-size: 15px; line-height: 1.6; }
  .need-item { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #E2E8F0; font-size: 14px; color: #4A5568; line-height: 1.5; }
  .need-item:last-child { border-bottom: none; }
  .trust-line { font-size: 12px; color: rgba(255,255,255,0.65); text-align: center; margin-bottom: 12px; }
  .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #2AC400; margin-bottom: 6px; }
`;

function ProgressBar({ current, total }) {
  const pct = (current / total) * 100;
  return (
    <div
      style={{
        background: '#E2E8F0',
        borderRadius: 4,
        height: 4,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: GREEN,
          height: '100%',
          width: `${pct}%`,
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

function IntroScreen({ dogName, setDogName, onStart }) {
  return (
    <div className="app" style={{ background: 'white', padding: '0 0 32px' }}>
      <div
        style={{
          background: NAVY,
          padding: '40px 24px 32px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: GREEN,
            fontWeight: 700,
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}
        >
          HABLA PERRO
        </div>
        <h1
          style={{
            color: 'white',
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1.25,
            marginBottom: 12,
          }}
        >
          ¿Qué tipo de perro
          <br />
          es el tuyo?
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 15,
            lineHeight: 1.6,
            maxWidth: 320,
            margin: '0 auto',
          }}
        >
          Responde 6 preguntas y descubre qué está pasando realmente con su
          comportamiento — y por dónde empezar.
        </p>
      </div>

      <div style={{ padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: NAVY,
              marginBottom: 8,
            }}
          >
            Primero, ¿cómo se llama tu perro?
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="Escribe su nombre..."
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && dogName.trim() && onStart()}
          />
        </div>

        <button
          className="btn-green"
          onClick={onStart}
          disabled={!dogName.trim()}
          style={{ opacity: dogName.trim() ? 1 : 0.4, marginBottom: 16 }}
        >
          Empezar ahora →
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#718096' }}>
          6 preguntas · 2 minutos · resultado inmediato
        </p>

        <div
          style={{
            marginTop: 32,
            padding: '16px',
            background: WARM,
            borderRadius: 10,
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: DGREY,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            El único en México con certificación
            <br />
            reconocida mundialmente en entrenamiento canino.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuizScreen({ qIndex, dogName, onAnswer, onBack, selected }) {
  const q = QUESTIONS[qIndex];
  const questionText = q.q(dogName);

  return (
    <div className="app" style={{ background: 'white', padding: '0 0 32px' }}>
      <div style={{ background: NAVY, padding: '20px 24px 24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 16,
            minHeight: 28,
          }}
        >
          {qIndex > 0 && (
            <button
              className="btn-ghost"
              onClick={onBack}
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                padding: 0,
              }}
            >
              ← Anterior
            </button>
          )}
        </div>
        <ProgressBar current={qIndex} total={QUESTIONS.length} />
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
            marginTop: 6,
            textAlign: 'right',
          }}
        >
          {qIndex + 1} de {QUESTIONS.length}
        </div>
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: NAVY,
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          {q.qHighlight ? (
            <>
              {questionText}{' '}
              <span style={{ textDecoration: 'underline', fontWeight: 700 }}>
                {q.qHighlight}
              </span>
              {q.qSuffix}
            </>
          ) : (
            questionText
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.answers.map((a, i) => (
            <button
              key={i}
              className={`ans-card${selected === i ? ' selected' : ''}`}
              onClick={() => onAnswer(a, i)}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: selected === i ? 'rgba(255,255,255,0.6)' : GREEN,
                  marginRight: 8,
                }}
              >
                {['A', 'B', 'C', 'D'][i]}
              </span>
              {a.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ dogName, progress }) {
  const dots = Math.floor(progress / 33) % 4;
  return (
    <div
      className="app"
      style={{
        background: NAVY,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px',
        minHeight: '100vh',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>🐾</div>
        <h2
          style={{
            color: 'white',
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 8,
            lineHeight: 1.4,
          }}
        >
          Analizando el perfil
          <br />
          de {dogName}
          {'.'.repeat(dots + 1)}
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 14,
            lineHeight: 1.6,
            maxWidth: 280,
            margin: '0 auto 32px',
          }}
        >
          Cada perro tiene su propio patrón de comportamiento. Estamos
          encontrando el de {dogName}.
        </p>
        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 4,
            height: 4,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: GREEN,
              height: '100%',
              width: `${progress}%`,
              borderRadius: 4,
              transition: 'width 0.05s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function CustomRadarLabel({ x, y, cx, cy, index }) {
  const label = TRAIT_LABELS[index];
  const lines = label.split('\n');
  const angle = Math.atan2(y - cy, x - cx);
  const dx = Math.cos(angle) * 8;
  const dy = Math.sin(angle) * 8;
  return (
    <text
      x={x + dx}
      y={y + dy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fill={DGREY}
      fontFamily="sans-serif"
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x + dx} dy={i === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function MiniRadar({ avg }) {
  const cx = 110,
    cy = 110,
    r = 80;
  const n = TRAITS.length;
  const pts = TRAITS.map((t, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const v = (avg[t] - 1) / 4;
    return { x: cx + r * v * Math.cos(angle), y: cy + r * v * Math.sin(angle) };
  });
  const gridPts = TRAITS.map((_, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const polyUser = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const polyGrid = gridPts.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <svg
      viewBox="0 0 220 220"
      width="100%"
      style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
    >
      {[0.25, 0.5, 0.75, 1].map((f, fi) => {
        const gp = TRAITS.map((_, i) => {
          const a = (i / n) * 2 * Math.PI - Math.PI / 2;
          return `${cx + r * f * Math.cos(a)},${cy + r * f * Math.sin(a)}`;
        }).join(' ');
        return (
          <polygon
            key={fi}
            points={gp}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={1}
          />
        );
      })}
      {TRAITS.map((_, i) => {
        const a = (i / n) * 2 * Math.PI - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(a)}
            y2={cy + r * Math.sin(a)}
            stroke="#E2E8F0"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={polyUser}
        fill="#0F2451"
        fillOpacity={0.35}
        stroke="#0F2451"
        strokeWidth={2}
      />
      {TRAITS.map((t, i) => {
        const a = (i / n) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + (r + 22) * Math.cos(a);
        const ly = cy + (r + 22) * Math.sin(a);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fill="#4A5568"
          >
            {TLABELS[i]}
          </text>
        );
      })}
    </svg>
  );
}

function ResultScreen({ result, dogName, onRestart }) {
  const { cat, cat2, mixed, avg } = result;
  const c = COPY[cat];
  const c2 = mixed ? COPY[cat2] : null;

  if (mixed && c2) {
    return (
      <div className="app" style={{ background: 'white', paddingBottom: 48 }}>
        <div style={{ background: NAVY, padding: '32px 24px 28px' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(42,196,0,0.2)',
              border: '1px solid rgba(42,196,0,0.4)',
              borderRadius: 20,
              padding: '4px 14px',
              fontSize: 12,
              color: GREEN,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            PERFIL COMBINADO
          </div>
          <h1
            style={{
              color: 'white',
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            {dogName} tiene un perfil combinado
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>
            Eso no es ambigüedad — es precisión.
          </p>
        </div>
        <div style={{ padding: '24px' }}>
          <p
            style={{
              color: DGREY,
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            Algunos perros no encajan perfectamente en una sola categoría.{' '}
            {dogName} muestra características de dos patrones distintos — lo que
            significa que su entrenamiento necesita atender más de una cosa al
            mismo tiempo.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[c, c2].map((cat_copy, i) => (
              <div
                key={i}
                style={{
                  background: WARM,
                  borderRadius: 10,
                  padding: '16px 14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>
                  {cat_copy.emoji}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: NAVY,
                    lineHeight: 1.3,
                  }}
                >
                  {cat_copy.name}
                </div>
                <div style={{ fontSize: 12, color: DGREY, marginTop: 4 }}>
                  {cat_copy.energy}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              background: WARM,
              borderRadius: 10,
              padding: '20px 20px',
              marginBottom: 24,
            }}
          >
            <p style={{ color: DGREY, fontSize: 14, lineHeight: 1.6 }}>
              Un perfil combinado merece una conversación más que un resultado
              de pantalla.
            </p>
          </div>
          <div
            style={{
              background: NAVY,
              borderRadius: 12,
              padding: '24px',
              marginBottom: 12,
            }}
          >
            <p
              style={{
                color: GREEN,
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              ¿Le cuento a Mike sobre {dogName}?
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              Este es exactamente el tipo de caso para el que estoy aquí.
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-wa"
            >
              <span>💬</span> Escribirle a Mike
            </a>
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 12,
                textAlign: 'center',
                marginTop: 10,
              }}
            >
              Escribe CUERNAVACA · Sin compromiso
            </p>
          </div>
          <button
            onClick={onRestart}
            style={{
              background: 'none',
              border: 'none',
              color: '#718096',
              fontSize: 13,
              cursor: 'pointer',
              width: '100%',
              padding: '8px 0',
            }}
          >
            Empezar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={{ background: 'white', paddingBottom: 48 }}>
      <div style={{ background: NAVY, padding: '32px 24px 28px' }}>
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(42,196,0,0.2)',
            border: '1px solid rgba(42,196,0,0.4)',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 12,
            color: GREEN,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          RESULTADO DE {dogName.toUpperCase()}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 32 }}>{c.emoji}</span>
          <h1
            style={{
              color: 'white',
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {c.name}
          </h1>
        </div>
        <p
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          {c.rec(dogName)}
        </p>
      </div>

      <div style={{ background: WARM, padding: '24px' }}>
        <p className="section-label">Así se ve el perfil de {dogName}</p>
        <RadarViz avg={avg} />
        <p
          style={{
            fontSize: 12,
            color: '#718096',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          ⚠ Control de Impulsos y Control Social: puntaje bajo = menos
          regulación
        </p>
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <p className="section-label">Lo que está pasando en realidad</p>
        <div className="myth-box" style={{ marginBottom: 16 }}>
          «{c.myth}»
        </div>
        <p
          style={{
            color: DGREY,
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          {c.body}
        </p>

        <p className="section-label">Lo que necesita {dogName}</p>
        <div style={{ marginBottom: 8 }}>
          {c.needs.map((n, i) => (
            <div key={i} className="need-item">
              <span
                style={{
                  color: GREEN,
                  fontSize: 16,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ✓
              </span>
              <span>{n}</span>
            </div>
          ))}
        </div>
        <p
          style={{
            color: DGREY,
            fontSize: 15,
            lineHeight: 1.7,
            marginTop: 12,
            marginBottom: 24,
          }}
        >
          {c.bridge(dogName)}
        </p>
      </div>

      <div style={{ background: NAVY, margin: '0 0 0', padding: '28px 24px' }}>
        <h3
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 6,
            lineHeight: 1.4,
          }}
        >
          {c.cta1(dogName)}
        </h3>
        <p
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          {c.sub1}
        </p>
        <p className="trust-line">
          El único en México con certificación reconocida mundialmente en
          entrenamiento canino
        </p>
        <a href={WA_URL} target="_blank" rel="noreferrer" className="btn-wa">
          <span>💬</span> Escribirle a Mike por WhatsApp
        </a>
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 12,
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          Sin compromiso · Solo una conversación
        </p>
      </div>

      <div style={{ padding: '24px', background: WARM }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: '14px',
              background: 'white',
              borderRadius: 10,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: GREEN,
                letterSpacing: '0.06em',
                marginBottom: 4,
              }}
            >
              CERTIFICACIÓN
            </div>
            <div style={{ fontSize: 12, color: DGREY, lineHeight: 1.4 }}>
              Único en México con cert. reconocida mundialmente
            </div>
          </div>
          <div
            style={{
              padding: '14px',
              background: 'white',
              borderRadius: 10,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: GREEN,
                letterSpacing: '0.06em',
                marginBottom: 4,
              }}
            >
              CRUZ ROJA
            </div>
            <div style={{ fontSize: 12, color: DGREY, lineHeight: 1.4 }}>
              Entrenador oficial perros SAR · Cruz Roja Morelos
            </div>
          </div>
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: 10,
            padding: '16px',
            marginBottom: 0,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: DGREY,
              fontStyle: 'italic',
              lineHeight: 1.6,
              marginBottom: 6,
            }}
          >
            "Pensé que mi perro simplemente era difícil. Mike me explicó qué
            estaba pasando realmente — y en tres semanas vi la diferencia."
          </p>
          <p style={{ fontSize: 12, color: '#718096' }}>
            — Cliente Habla Perro, Cuernavaca
          </p>
        </div>
      </div>

      <div style={{ padding: '28px 24px' }}>
        <h3
          style={{
            color: NAVY,
            fontSize: 17,
            fontWeight: 700,
            marginBottom: 6,
            lineHeight: 1.4,
          }}
        >
          {c.cta2}
        </h3>
        <p style={{ color: DGREY, fontSize: 13, marginBottom: 16 }}>
          Escribe CUERNAVACA y te cuento todo.
        </p>
        <a
          href={WA_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-wa"
          style={{ background: NAVY }}
        >
          <span>💬</span> Hablar con Mike
        </a>
        <button
          onClick={onRestart}
          style={{
            background: 'none',
            border: 'none',
            color: '#718096',
            fontSize: 13,
            cursor: 'pointer',
            width: '100%',
            padding: '12px 0 0',
            display: 'block',
            textAlign: 'center',
          }}
        >
          Empezar de nuevo
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('intro');
  const [dogName, setDogName] = useState('');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (screen === 'loading') {
      let p = 0;
      const iv = setInterval(() => {
        p += 1.5;
        setProgress(p);
        if (p >= 100) {
          clearInterval(iv);
          const res = score(answers);
          setResult(res);
          setTimeout(() => setScreen('result'), 200);
        }
      }, 25);
      return () => clearInterval(iv);
    }
  }, [screen, answers]);

  const handleAnswer = (a, idx) => {
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, a];
      setAnswers(newAnswers);
      setSelected(null);
      if (qIndex < QUESTIONS.length - 1) {
        setQIndex(qIndex + 1);
      } else {
        setScreen('loading');
      }
    }, 180);
  };

  const handleBack = () => {
    if (qIndex > 0) {
      setQIndex(qIndex - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const restart = () => {
    setScreen('intro');
    setDogName('');
    setQIndex(0);
    setAnswers([]);
    setSelected(null);
    setProgress(0);
    setResult(null);
  };

  return (
    <>
      <style>{css}</style>
      {screen === 'intro' && (
        <IntroScreen
          dogName={dogName}
          setDogName={setDogName}
          onStart={() => dogName.trim() && setScreen('quiz')}
        />
      )}
      {screen === 'quiz' && (
        <QuizScreen
          qIndex={qIndex}
          dogName={dogName}
          onAnswer={handleAnswer}
          onBack={handleBack}
          selected={selected}
        />
      )}
      {screen === 'loading' && (
        <LoadingScreen dogName={dogName} progress={progress} />
      )}
      {screen === 'result' && result && (
        <ResultScreen result={result} dogName={dogName} onRestart={restart} />
      )}
    </>
  );
}
