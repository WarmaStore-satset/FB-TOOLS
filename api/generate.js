export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan, bre!' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'API Key Groq belum disetting di Environment Variables Vercel.' });
  }

  try {
    const { promptText } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "You are a strict JSON generator. You must ONLY output a raw JSON array of strings, exactly matching the requested format. NEVER wrap the response in markdown code blocks like ```json ... ```. NEVER include any conversational filler, intro, or outro text. Just start with [ and end with ]." 
          },
          { 
            role: "user", 
            content: promptText 
          }
        ],
        temperature: 0.4 // Diturunkan biar AI lebih patuh aturan format dan gak ngaco
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData?.error?.message || 'Server Groq bermasalah.');
    }

    const aiText = responseData.choices[0].message.content;

    return res.status(200).json({ text: aiText });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
