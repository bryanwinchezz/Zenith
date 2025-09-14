// ADICIONADO: Importa o 'tradutor' para o formato do Netlify
import serverless from 'serverless-http';

// SUAS IMPORTAÇÕES ORIGINAIS (mantidas)
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
// REMOVIDO: A porta é gerenciada pelo Netlify, não precisamos mais dela aqui.
// const port = process.env.PORT || 3000;

// MODIFICADO: Lógica de caminhos para funcionar dentro da Function
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Este é o caminho para a raiz do seu projeto a partir da function
const projectRoot = path.join(__dirname, '..', '..');

app.use(express.json());

// ADICIONADO: Um router para organizar as rotas da API
const router = express.Router();

// ADICIONADO: Servir TODOS os arquivos estáticos da raiz do projeto (para o client.js, css, etc.)
app.use(express.static(projectRoot));

// MODIFICADO: Sua rota de chat agora usa o 'router'
router.post('/chat', async (req, res) => {
  console.log('--- Requisição /chat recebida ---');
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("ERRO: GEMINI_API_KEY não foi encontrada no arquivo .env.");
      return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
    }

    const { history } = req.body;
    if (!history || !Array.isArray(history) || history.length === 0) {
      console.warn("AVISO: Requisição recebida sem um histórico de conversa válido.");
      return res.status(400).json({ error: 'O histórico da conversa é obrigatório.' });
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }))
    };

    const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Erro retornado pela API do Google:", errorData?.error?.message || errorData);
        throw new Error(`A API retornou um erro. Verifique a validade da sua chave de API.`);
    }

    const data = await apiResponse.json();
    
    if (!data.candidates || data.candidates.length === 0 || data.candidates[0].finishReason === 'SAFETY') {
        const blockReason = data?.promptFeedback?.blockReason || 'desconhecido';
        const blockMessage = `Sua pergunta foi bloqueada por motivo de segurança (${blockReason}). Por favor, reformule.`;
        console.warn(`Conteúdo bloqueado: ${blockReason}`);
        return res.status(400).json({ error: blockMessage });
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    console.log('Resposta da IA enviada ao cliente.');
    res.json({ response: text });

  } catch (error) {
    console.error('!!! ERRO GERAL NA ROTA /CHAT !!!');
    console.error('Mensagem de Erro:', error.message || error);
    res.status(500).json({ error: 'Falha ao comunicar com a API do Gemini. Verifique sua chave de API e consulte o log do servidor.' });
  }
});

// ADICIONADO: Monta o router no caminho que o Netlify usa para as functions
app.use('/.netlify/functions/server', router);

// ADICIONADO: Uma rota "catch-all" para servir o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

// REMOVIDO: O app.listen() não é usado no ambiente serverless
/*
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
*/

// ADICIONADO: Exporta o handler para o Netlify usar
export const handler = serverless(app);