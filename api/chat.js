export default async function handler(req, res) {
  const { prompt, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Check if Vercel even sees the key
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API Key in Vercel settings. Did you redeploy?" });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: context || "You are an expert Data Structures tutor." }] }
      })
    });

    const data = await response.json();

    // 2. If Google rejects the key, pass the exact error back to the website
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // 3. Success!
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to Google servers" });
  }
}