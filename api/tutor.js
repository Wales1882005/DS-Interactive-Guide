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

    // Your prioritized list of models
    const MODEL_PRIORITY = ["gemini-3-flash-preview", "gemini-2.0-flash", "gemini-2.5-flash-lite"];
    let lastError = "Unknown Error";

    // Loop through the models one by one
    for (const model of MODEL_PRIORITY) {
      console.log(`\n--- Trying model: ${model} ---`);
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
           contents: [{ 
          parts: [{ text: `System: ${body.context || "You are an expert tutor."} Do NOT use LaTeX math formatting symbols like $ or \\to. Use standard plain text and ASCII arrows (->).\n\nUser: ${body.prompt}` }] 
        }]
          })
        });

        const data = await response.json();

        // If it worked, send the data and STOP the loop!
        if (response.ok) {
          console.log(`Success! ${model} generated the response.`);
          return res.status(200).json(data);
        } 
        
        // If Google threw an error, save it
        console.error(`Error from ${model} (Status ${response.status}):`, data);
        lastError = data.error?.message || "Google API Error";

        // If the model is overloaded (503) or not found (404), skip to the next model
        if (response.status === 503 || response.status === 404) {
          console.log(`Triggering fallback. Moving to next model in list...`);
          continue; 
        } else {
          // If it's a different error (like a bad API key), stop trying and return the error
          return res.status(response.status).json({ error: lastError });
        }

      } catch (fetchError) {
        console.error(`Network fetch failed for ${model}:`, fetchError);
        lastError = fetchError.message;
        continue;
      }
    }

    // If the loop finishes and EVERY model failed:
    console.error("CRITICAL: All fallback models failed.");
    return res.status(503).json({ error: `All models are currently overloaded. Last error: ${lastError}` });

  } catch (error) {
    console.error("FATAL SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};