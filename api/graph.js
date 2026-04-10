module.exports = async function(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    console.log("1. Graph Request received by Vercel.");
    
    let body = req.body;
    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    const text = body.text;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("ERROR: API Key is missing!");
      return res.status(500).json({ error: "API Key is missing." });
    }

    console.log("2. Sending Graph request to Gemini 1.5 Flash...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    console.log("3. Google responded with status:", response.status);

    if (!response.ok) {
      console.error("ERROR FROM GOOGLE:", data);
      return res.status(500).json({ error: data.error?.message || "Google API Error" });
    }

    console.log("4. Success! Sending Graph JSON to website.");
    const resultText = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ text: resultText });

  } catch (error) {
    console.error("FATAL SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};