import fs from 'node:fs';

// Load .env.local if present
if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const sarvamKey = process.env.SARVAM_API_KEY;
const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

console.log('Testing provider connectivity...');
console.log('Sarvam API Key configured:', Boolean(sarvamKey));
console.log('Gemini API Key configured:', Boolean(geminiKey));

async function testGemini() {
  if (!geminiKey) {
    console.log('[Gemini] Key not found');
    return;
  }
  const testModel = process.env.GEMINI_INTENT_MODEL || 'gemini-2.5-flash';
  console.log(`[Gemini] Testing intent model: ${testModel}`);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${geminiKey}`;
    const start = Date.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Extract intent from user speech: "Bhaiya kal subah 500ml extra doodh de dena". Output JSON with keys: intent, extraMl, targetDate.' }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
    const latency = Date.now() - start;
    console.log(`[Gemini] Status: ${res.status} ${res.statusText} (${latency}ms)`);
    const data = await res.json();
    if (res.ok) {
      console.log('[Gemini] Output:', data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
    } else {
      console.log('[Gemini] Error:', JSON.stringify(data).slice(0, 200));
    }
  } catch (err: any) {
    console.error('[Gemini] Fetch failed:', err.message);
  }
}

async function testSarvam() {
  if (!sarvamKey) {
    console.log('[Sarvam] Key not found');
    return;
  }
  try {
    // Test Sarvam STT endpoint with a small WAV buffer
    const url = 'https://api.sarvam.ai/speech-to-text';
    const start = Date.now();
    // 1-second silent 16kHz 16-bit mono PCM WAV
    const sampleRate = 16000;
    const numSamples = sampleRate * 1;
    const buffer = Buffer.alloc(44 + numSamples * 2);
    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'audio/wav' });
    formData.append('file', blob, 'test.wav');
    formData.append('model', 'saaras:v4');
    formData.append('mode', 'codemix');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'api-subscription-key': sarvamKey
      },
      body: formData
    });
    const latency = Date.now() - start;
    console.log(`[Sarvam] Status: ${res.status} ${res.statusText} (${latency}ms)`);
    const data = await res.json();
    console.log('[Sarvam] Response:', JSON.stringify(data).slice(0, 200));
  } catch (err: any) {
    console.error('[Sarvam] Fetch failed:', err.message);
  }
}

async function testGeminiAudio() {
  if (!geminiKey) return;
  // Test Gemini multimodal audio transcription
  const audioModel = process.env.GEMINI_STT_MODEL || 'gemini-2.5-flash';
  console.log(`[Gemini Audio STT] Testing audio model: ${audioModel}`);
  try {
    // 1-second silent WAV
    const sampleRate = 16000;
    const numSamples = sampleRate * 1;
    const buffer = Buffer.alloc(44 + numSamples * 2);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    const base64Audio = buffer.toString('base64');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${audioModel}:generateContent?key=${geminiKey}`;
    const start = Date.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Transcribe this audio verbatim in Indic/English language. Output only the transcript text, or empty string if silence.' },
            {
              inlineData: {
                mimeType: 'audio/wav',
                data: base64Audio
              }
            }
          ]
        }]
      })
    });
    const latency = Date.now() - start;
    console.log(`[Gemini Audio STT] Status: ${res.status} ${res.statusText} (${latency}ms)`);
    const data = await res.json();
    if (res.ok) {
      console.log('[Gemini Audio STT] Output:', data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '(silent)');
    } else {
      console.log('[Gemini Audio STT] Error:', JSON.stringify(data).slice(0, 200));
    }
  } catch (err: any) {
    console.error('[Gemini Audio STT] Failed:', err.message);
  }
}

async function main() {
  await testGemini();
  await testGeminiAudio();
  await testSarvam();
}

main();
