exports.handler = async function(event, context) {
  // 1. Safety check to prevent the JSON crash
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: "No message received." }) };
  }

  try {
    const body = JSON.parse(event.body);
    const prompt = body.prompt;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing API Key in Netlify." }) };
    }

    // 2. Call Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `System: ${body.context || "You are an expert Data Structures tutor."}\n\nUser: ${prompt}` }] 
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};