import express from 'express';
import serverless from 'serverless-http';
import fetch from 'node-fetch'; //

const app = express();
const router = express.Router();

app.use(express.json());

// --- Rota /api/chat ---
router.post('/chat', async (req, res) => {
  console.log('--- Requisição /chat recebida ---');

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
    }

    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'O histórico da conversa é obrigatório.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: history })
    });

    const responseText = await apiResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("A API do Google retornou uma resposta inválida.");
    }

    if (!apiResponse.ok) {
      const errorMsg = data?.error?.message || 'Erro desconhecido da API do Google.';
      throw new Error(errorMsg);
    }

    if (!data.candidates || data.candidates.length === 0 || data.candidates[0].finishReason === 'SAFETY') {
      const blockReason = data?.promptFeedback?.blockReason || 'desconhecido';
      return res.status(400).json({ error: `Pergunta bloqueada por segurança (${blockReason}).` });
    }

    const text = data.candidates[0].content.parts[0].text;
    res.json({ response: text });

  } catch (error) {
    console.error('ERRO /chat:', error.message);
    res.status(500).json({ error: 'Falha ao comunicar com a API do Gemini.' });
  }
});

// --- Configuração do Router ---
app.use('/api', router);

// --- Servidor local (opcional) ---
if (!process.env.NETLIFY) {
  const port = 3000;
  app.listen(port, () => console.log(`Servidor local rodando em http://localhost:${port}`));
}

// --- Exporta handler para Netlify ---
export const handler = serverless(app);