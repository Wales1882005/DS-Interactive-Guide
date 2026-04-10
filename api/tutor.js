module.exports = async function(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    console.log("1. Request received by Vercel.");
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("ERROR: API Key is missing!");
      return res.status(500).json({ error: "API Key is missing." });
    }

    console.log("2. Sending POST request to Gemini Pro...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `System: ${body.context || "You are an expert tutor."}\n\nUser: ${body.prompt}` }] 
        }]
      })
    });

    const data = await response.json();
    console.log("3. Google responded with status:", response.status);

    if (!response.ok) {
      console.error("ERROR FROM GOOGLE:", data);
      return res.status(500).json({ error: data.error?.message || "Google API Error" });
    }

    console.log("4. Success! Sending response to website.");
    return res.status(200).json(data);

  } catch (error) {
    console.error("FATAL SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};