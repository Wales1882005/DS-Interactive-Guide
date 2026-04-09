exports.handler = async function(event, context) {
  // Netlify receives the data as a raw string, so we have to parse it
  const body = JSON.parse(event.body);
  const prompt = body.prompt;
  const chatContext = body.context;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Missing API Key in Netlify settings." }) 
    };
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: chatContext || "You are an expert Data Structures tutor." }] }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify(data) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Failed to connect to Google servers" }) 
    };
  }
};