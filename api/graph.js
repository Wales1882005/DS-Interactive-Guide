module.exports = async function(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key is missing." });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text }] }],
        systemInstruction: { parts: [{ text: "Extract graph nodes and directed edges." }] },
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ text: resultText });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};