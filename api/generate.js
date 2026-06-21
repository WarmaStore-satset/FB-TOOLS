export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan, bre!' });
  }

  // Mengambil API Key OpenRouter dari Vercel
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'API Key OpenRouter belum disetting di Vercel.' });
  }

  try {
    const { promptText } = req.body;

    // Tembak ke OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Kita pake Llama 3.3 70B (Versi raksasa yang pinter, panjang, dan kreatif!)
        model: "meta-llama/llama-3.3-70b-instruct", 
        messages: [
          { 
            role: "system", 
            content: "You are a professional JSON writer. You must ONLY output a valid JSON array of strings, starting with [ and ending with ]. Never include markdown backticks or any conversational text. Follow the length instructions strictly and write rich, engaging, emoji-filled content." 
          },
          { 
            role: "user", 
            content: promptText 
          }
        ],
        temperature: 0.7 // Dinaikin dikit biar kosa katanya kaya dan gak kaku
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData?.error?.message || 'Server OpenRouter bermasalah.');
    }

    const aiText = responseData.choices[0].message.content;

    return res.status(200).json({ text: aiText });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
