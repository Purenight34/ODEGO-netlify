export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '메시지가 없습니다.' })
      };
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
    if (!OPENAI_KEY) {
      console.error('OPENAI_API_KEY missing');
      return { statusCode: 500, body: JSON.stringify({ error: 'OpenAI API key not configured' }) };
    }

    // model selection via env (OPENAI_MODEL). To use gpt-5-1-mini set OPENAI_MODEL=gpt-5-1-mini
    const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

    const fetchFn = globalThis.fetch || (await import('node-fetch')).default;

    const response = await fetchFn('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: '당신은 부산 여행 전문 AI입니다. 친절하고 간결하게 답변하세요.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const dataText = await response.text();
    let data = null;
    try { data = JSON.parse(dataText); } catch (e) { data = null; }

    if (!response.ok) {
      console.error('OpenAI upstream error:', response.status, dataText);
      return { statusCode: response.status, body: JSON.stringify(data || { error: dataText }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '' })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: '서버 오류' }) };
  }
}