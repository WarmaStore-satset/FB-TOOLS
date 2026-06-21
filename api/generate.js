export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan!' });
  }

  // Mengambil API Key Groq yang disimpan aman di Environment Variables Vercel
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'API Key Groq belum disetting di Environment Variables Vercel.' });
  }

  try {
    const { promptText } = req.body;

    // Menembak langsung ke Server Groq (Menggunakan model Llama 3 8B)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Model super cepat milik Meta
        messages: [{ role: "user", content: promptText }],
        temperature: 0.7
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData?.error?.message || 'Server Groq bermasalah.');
    }

    // Ambil output teks AI dari struktur data Groq
    const aiText = responseData.choices[0].message.content;

    // Kirim hasilnya kembali ke index.html
    return res.status(200).json({ text: aiText });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
