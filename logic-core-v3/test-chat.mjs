import fetch from 'node-fetch';

async function test(content, sessionId) {
  try {
    const res = await fetch('http://localhost:3000/api/chatbot/develop/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        messages: [{ role: 'user', content }]
      })
    });
    const text = await res.text();
    console.log(`\n\n=== RESPONSE FOR: ${content} ===\n${text}\n=================\n`);
  } catch(e) {
    console.error('Error:', e);
  }
}

async function run() {
  await test('Hola, ¿cuánto cuesta una web?', 'session-1');
  await test('Necesito esto para esta semana, es urgente', 'session-2');
  await test('¿Por qué ustedes y no Wix?', 'session-3');
}

run();
