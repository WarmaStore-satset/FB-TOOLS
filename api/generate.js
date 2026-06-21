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
            content: `You are a professional social media copywriter. You must ONLY output a valid JSON array of strings, starting with [ and ending with ]. 
Never include markdown backticks like \`\`\`json.
If the user wants a LONG caption, you MUST write it in a storytelling format with multiple short paragraphs. Use '\\n\\n' inside the JSON string to create line breaks/enters between paragraphs so it doesn't look like a single block of text. Make it rich, engaging, emotional, and filled with emojis.` 
          },
          {
            role: "user",
            content: 'Contoh topik: "Tips Olahraga"'
          },
          {
            role: "assistant",
            content: '["Halo bre! 🏃‍♂️\\n\\nBanyak yang nanya ke gw gimana konsisten olahraga. Dulu gw juga males banget, tapi pas coba trik ini semua berubah.\\n\\nPertama, mulai dari 10 menit aja sehari, jangan langsung berat. Kedua, cari temen bareng.\\n\\nKalau lu gimana, udah olahraga belum hari ini? 🤔", "Opsi dua dst..."]'
          },
          { 
            role: "user", 
            content: promptText 
          }
        ],
        temperature: 0.85 // Dinaikin dikit lagi biar makin kreatif nulis panjang
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
