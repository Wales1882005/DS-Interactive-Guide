// api/chat.js
export default async function handler(req, res) {
  // 1. Get the user's message from the request
  const { prompt, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // Securely pulled from Vercel settings

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: "You are an expert Data Structures tutor. " + context }] }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to Gemini" });
  }
}