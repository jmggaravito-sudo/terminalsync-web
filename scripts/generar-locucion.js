// Genera la locución del video corporativo con ElevenLabs (ES + EN).
// Uso:
//   export ELEVENLABS_API_KEY="..."
//   node scripts/generar-locucion.js           # ES + EN
//   node scripts/generar-locucion.js es        # solo ES
//   node scripts/generar-locucion.js en        # solo EN
// Output: ./locucion/{es,en}/NN-nombre.mp3 (12 archivos por idioma).
// Idempotente: skip-if-exists + retry con backoff exponencial.

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) { console.error('Falta ELEVENLABS_API_KEY'); process.exit(1); }

// Voces elegidas tras prueba A/B con JM (2026-06-20):
//   ES → Catalina "Sunny and Engaging" (colombiana, joven, social_media)
//   EN → Kristen  "Upbeat social media" (american, young, social_media)
// Ambas se eligieron por energía/animación, no por narración solemne.
const VOICES = {
  es: 'k7v2xzj8pZoayBVu9pvq', // Catalina - Sunny and Engaging (colombian)
  en: 'XZUXLIpE3dqJ9aCZUj2R', // Kristen - Upbeat social media (american)
};

// Tuneados para más expresividad (más animado, menos plano).
// Si querés voz aún más actuada: subí style hacia 0.5 y bajá stability a 0.3.
const SETTINGS = { stability: 0.4, similarity_boost: 0.75, style: 0.30, use_speaker_boost: true };
const MODEL = 'eleven_multilingual_v2';

// Frases del guion del video corporativo (deben coincidir con guion-video.html).
const LINES = {
  es: [
    ['01-hero-escena',    'Estabas trabajando pero la IA llegó a su límite. Entonces tu trabajo se detuvo! TerminalSync te envía un mensaje en tu chat: ¿Seguimos con otra IA? Respondes sí. Y tu trabajo continúa.'],
    ['02-hero-categoria', 'Las IAs se detienen. Pero tu negocio no.'],
    ['03-hero-resultado', 'Pides un trabajo a la IA y lo ves avanzar. La IA te escribe la propuesta, construye la solución y se revisan los detalles. Terminal Sync no es solo un chat. Es trabajo terminado.'],
    ['04-hero-cierre',    'TerminalSync. Las IAs se detienen. Tu negocio no.'],
    ['05-full-dolor',     'Cuando tu IA tradicional se detiene, muchas veces el trabajo también. Se acaban los tokens, pierdes el contexto, y vuelves a empezar.'],
    ['06-full-recuerda',  'TerminalSync recuerda en qué estabas trabajando, cambias de IA en el mimo chat, sin perder nada y te permite continuar desde cualquier lugar. Sin aprender comandos raros y Sin configuraciones complejas.'],
    ['07-full-resultado', 'Propuesta enviada. Campaña publicada. Reporte entregado. Listo.'],
    ['08-full-cambio',    'Si una IA se detiene, simplemente continúas con otra. Sin copiar. Sin pegar. Sin perder nada.'],
    ['09-full-movilidad', 'Empiezas en la oficina. Sigues en el portátil o Sigues en tu Whatsaap o telegram. Tu trabajo va contigo, y tu diriges a tus agentes 24/7!.'],
    ['10-full-whatsapp',  'Incluso cuando no estás frente al computador. Una IA llega a su límite, te llega un Email o un Telegrama, respondes sí, continúa, y el trabajo sigue. Tu trabajo te sigue hasta el chat.'],
    ['11-full-facilidad', 'Conecta Gmail, Notion, Drive y miles de conectores mas, solo con  arrastrarlos. Y en tu chat con la IA, Si no sabes cómo pedir algo, tu asistente personal de IA lo redacta por ti.'],
    ['12-full-cierre',    'TerminalSync. Las IAs se detienen. Tu negocio no.'],
  ],
  en: [
    ['01-hero-scene',     'You were working, suddenly the AI hit its limit. And your work stopped. A message from TerminalSync arrives: Continue with another AI? You reply yes. And your work keeps going.'],
    ['02-hero-category',  "AIs stop. Your business doesn't."],
    ['03-hero-result',    "You ask for a job and watch it move forward. The proposal is written. The solution is built. The details are reviewed. Terminalsync It's not any chat. It's your work finished."],
    ['04-hero-close',     "TerminalSync. AIs stop. Your business doesn't."],
    ['05-full-pain',      'When an AI stops, the work often stops too. You run out of tokens, you lose the context, and you have to start all over again.'],
    ['06-full-remembers', 'TerminalSync remembers what you were working on, switches AI on the same chat, without losing anything, and lets you continue from anywhere. No prompts or commands to learn. No complex setup.'],
    ['07-full-result',    'Proposal sent. Campaign published. Report delivered. Done.'],
    ['08-full-switch',    'If one AI stops, you simply continue with another. No copying. No pasting. Nothing lost.'],
    ['09-full-mobility',  'Start at the office. Continue on your laptop or Continue on your Telegram and whatsaap. You can direct your work 24/7.'],
    ['10-full-whatsapp',  "Even when you're away from the computer. An AI hits its limit, you get a mail or a telegram notification, you reply yes, keep going, and the work continues. Your work follows you into the chat."],
    ['11-full-ease',      "Connect Gmail, Notion, Drive and thousands more by just dragging them in. Also If you don't know how to ask your AI, your own AI assistant writes it for you."],
    ['12-full-close',     "TerminalSync. AIs stop. Your business doesn't."],
  ],
};

async function tts(text, voiceId, outPath) {
  if (fs.existsSync(outPath)) { console.log('↷ skip (ya existe)', outPath); return 0; }
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: MODEL, voice_settings: SETTINGS }),
      });
      if (res.status === 429 || res.status >= 500) throw new Error(`${res.status} ${await res.text()}`);
      if (!res.ok) throw Object.assign(new Error(`${res.status} ${await res.text()}`), { fatal: true });
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buf);
      console.log('✓', outPath, `(${(buf.length/1024).toFixed(0)} KB, ${text.length} chars)`);
      return text.length;
    } catch (e) {
      if (e.fatal) throw e;
      lastErr = e;
      const wait = 1000 * Math.pow(2, attempt - 1);
      console.log(`  ↻ reintento ${attempt}/4 en ${wait}ms (${e.message.slice(0,60)})`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

(async () => {
  const only = process.argv[2];
  const langs = only ? [only] : ['es', 'en'];
  let totalChars = 0;
  for (const lang of langs) {
    const dir = path.join('locucion', lang);
    fs.mkdirSync(dir, { recursive: true });
    for (const [name, text] of LINES[lang]) {
      totalChars += await tts(text, VOICES[lang], path.join(dir, `${name}.mp3`));
      await new Promise(r => setTimeout(r, 400));
    }
  }
  console.log(`\nListo. Audios en ./locucion/  ·  caracteres consumidos esta corrida: ${totalChars}`);
})();
