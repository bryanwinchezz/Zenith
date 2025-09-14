import express from 'express';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.join(path.dirname(__filename), '..', '..');

app.use(express.json());

// --- Rota da API ---
// Esta rota agora será verificada ANTES de servir os arquivos estáticos.
router.post('/chat', async (req, res) => {
  console.log('--- Requisição /chat recebida ---');
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("ERRO: GEMINI_API_KEY não foi encontrada.");
      return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
    }

    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'O histórico da conversa é obrigatório.' });
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const requestBody = { contents: history };

    const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    const responseText = await apiResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Erro ao analisar JSON da API do Google:", responseText);
      throw new Error("A API do Google retornou uma resposta inválida ou vazia.");
    }

    if (!apiResponse.ok) {
        const errorMsg = data?.error?.message || 'Erro desconhecido da API do Google.';
        console.error("Erro retornado pela API do Google:", errorMsg);
        throw new Error(`A API retornou um erro: ${errorMsg}`);
    }
    
    if (!data.candidates || data.candidates.length === 0 || data.candidates[0].finishReason === 'SAFETY') {
      const blockReason = data?.promptFeedback?.blockReason || 'desconhecido';
      const blockMessage = `Sua pergunta foi bloqueada por motivo de segurança (${blockReason}). Por favor, reformule.`;
      console.warn(`Conteúdo bloqueado: ${blockReason}`);
      return res.status(400).json({ error: blockMessage });
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    res.json({ response: text });

  } catch (error) {
    console.error('ERRO GERAL NA ROTA /CHAT:', error.message);
    res.status(500).json({ error: 'Falha ao comunicar com a API do Gemini. Verifique os logs do servidor.' });
  }
});

// --- Configuração do Servidor ---

const basePath = process.env.NETLIFY ? '/.netlify/functions/server' : '/';
// CORREÇÃO CRÍTICA: A rota da API é registrada ANTES dos arquivos estáticos.
app.use(basePath, router);

// Configuração apenas para desenvolvimento local (será ignorada pela Netlify)
if (!process.env.NETLIFY) {
  // Agora, o servidor de arquivos estáticos é registrado DEPOIS da API.
  app.use(express.static(projectRoot));
  
  // Adiciona uma rota "catch-all" para que o app funcione ao recarregar a página
  app.get('*', (req, res) => {
    res.sendFile(path.join(projectRoot, 'index.html'));
  });

  const port = 3000;
  app.listen(port, () => {
    console.log(`Servidor de desenvolvimento iniciado! Acesse o site em http://localhost:${port}`);
  });
}

// Exporta o handler para a Netlify usar em produção
export const handler = serverless(app);