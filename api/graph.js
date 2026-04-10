module.exports = async function(req, res) {
  try {
    const text = req.body.text;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API Key in Vercel." });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text }] }],
        systemInstruction: { parts: [{ text: "Extract graph nodes and directed edges." }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              nodes: { type: "ARRAY", items: { type: "STRING" } },
              edges: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    from: { type: "STRING" },
                    to: { type: "STRING" }
                  }
                }
              }
            },
            required: ["nodes", "edges"]
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const resultText = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ text: resultText });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};