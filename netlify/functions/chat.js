export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    console.groupCollapsed('Function invoked');
    console.log('event.path:', event.path);
    console.log('event.headers:', event.headers);
    console.log('event.httpMethod:', event.httpMethod);
    console.log('event.rawBody:', event.body?.slice?.(0,1000));
    console.groupEnd();

    const { message } = JSON.parse(event.body || '{}');
    if (!message || !String(message).trim()) {
      console.error('Bad request: empty message');
      return { statusCode: 400, body: JSON.stringify({ error: '메시지가 없습니다.' }) };
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
    const MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
    const TEMP = Number(process.env.OPENAI_TEMPERATURE ?? 1);
    const MAX_COMP = Number(process.env.OPENAI_MAX_COMPLETION_TOKENS ?? 800);
    const MAX_TOK = Number(process.env.OPENAI_MAX_TOKENS ?? 500);

    console.log('env check', { model: MODEL, hasKey: !!OPENAI_KEY, TEMP, MAX_COMP, MAX_TOK });

    if (!OPENAI_KEY) {
      console.error('OPENAI API key missing in env');
      return { statusCode: 500, body: JSON.stringify({ error: 'OpenAI API key not configured' }) };
    }

    const fetchFn = globalThis.fetch || (await import('node-fetch')).default;

    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: '당신은 부산 여행 전문 AI입니다. 친절하고 간결하게 답변하세요.' },
        { role: 'user', content: String(message) }
      ],
      temperature: TEMP
    };
    if (/^gpt-5|^gpt-4o/i.test(MODEL)) body.max_completion_tokens = MAX_COMP;
    else body.max_tokens = MAX_TOK;

    console.log('Upstream request body (trim):', JSON.stringify(body).slice(0,2000));

    const resp = await fetchFn('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await resp.text().catch(() => '');
    console.log('Upstream raw response (trim):', text?.slice?.(0,4000));
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; console.warn('Upstream response not JSON'); }

    console.log('OpenAI upstream status', resp.status, data ? (data.choices?.length ? 'choices' : Object.keys(data).slice(0,3)) : 'no-json');

    if (!resp.ok) {
      console.error('Upstream error body:', data || text);
      return { statusCode: resp.status, body: JSON.stringify(data || { error: text }) };
    }

    let assistantMessage = (data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '').trim();

    if (!assistantMessage) {
      const dataContext = data?.context || '';
      const relatedData = data?.related || [];
      if (dataContext && String(dataContext).trim()) assistantMessage = `다음 관련 정보를 찾았습니다:\n\n${dataContext}`;
      else if (Array.isArray(relatedData) && relatedData.length) assistantMessage = `다음 장소를 찾았습니다:\n${relatedData.map(d=>`- ${d.title||d.name} (${d.addr1||d.address||'주소 없음'})`).join('\n')}`;
      else assistantMessage = '죄송합니다. 응답을 생성할 수 없습니다. 다시 시도해 주세요.';
      console.log('Fallback assistantMessage used');
    }

    console.log('Returning assistantMessage (trim):', assistantMessage.slice(0,1000));

    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ reply: assistantMessage }) };
  } catch (err) {
    console.error('handler error', err && (err.stack || err));
    return { statusCode: 500, body: JSON.stringify({ error: '서버 오류' }) };
  }
}