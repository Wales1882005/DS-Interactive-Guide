module.exports = async function(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    console.log("1. Graph Request received by Vercel.");
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
      console.log(`\n--- Trying Graph model: ${model} ---`);
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: body.text }] }],
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

        // If it worked, extract the text, send it, and STOP the loop!
        if (response.ok) {
          console.log(`Success! ${model} generated the graph.`);
          const resultText = data.candidates[0].content.parts[0].text;
          return res.status(200).json({ text: resultText });
        } 
        
        // If Google threw an error, save it
        console.error(`Error from ${model} (Status ${response.status}):`, data);
        lastError = data.error?.message || "Google API Error";

        // If the model is overloaded (503) or not found (404), skip to the next model
        if (response.status === 503 || response.status === 404) {
          console.log(`Triggering fallback. Moving to next model in list...`);
          continue; 
        } else {
          return res.status(response.status).json({ error: lastError });
        }

      } catch (fetchError) {
        console.error(`Network fetch failed for ${model}:`, fetchError);
        lastError = fetchError.message;
        continue;
      }
    }

    // If the loop finishes and EVERY model failed:
    console.error("CRITICAL: All graph fallback models failed.");
    return res.status(503).json({ error: `All models are currently overloaded. Last error: ${lastError}` });

  } catch (error) {
    console.error("FATAL SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};