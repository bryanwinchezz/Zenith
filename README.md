# 🤖 Zenith

Um assistente pessoal simples e inteligente, criado com **IA**, desenvolvido em HTML/JavaScript e hospedado via **Netlify Functions** para comunicação segura com a API de inteligência artificial.

## 📋 Sobre o Projeto

O **Zenith** é um assistente pessoal baseado em IA que permite ao usuário fazer perguntas e receber respostas inteligentes diretamente pelo navegador. A comunicação com a API de IA é feita através de funções serverless no Netlify, mantendo as chaves de API seguras no servidor.

## 🖥️ Tecnologias Utilizadas

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

- **HTML5 + JavaScript** — interface do assistente (97.5% HTML / 2.5% JS)
- **Netlify Functions** — serverless backend para chamadas à API de IA
- **Netlify** — hospedagem e deploy contínuo

## 📁 Estrutura do Projeto

```
Zenith/
├── index.html              # Interface do assistente
├── netlify.toml            # Configuração do Netlify
├── package.json            # Dependências do projeto
├── package-lock.json       # Lock de dependências
├── .gitignore              # Arquivos ignorados
├── zenith.png              # Logo do projeto
├── README.md               # Documentação
└── netlify/
    └── functions/          # Funções serverless (API de IA)
```

## ✨ Funcionalidades

- Interface de chat com assistente de IA
- Processamento de perguntas em linguagem natural
- Backend serverless via Netlify Functions (sem expor chaves de API)
- Deploy automático e hospedagem na Netlify
- Design minimalista e focado na usabilidade

## 🚀 Como Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) instalado
- Chave de API da IA configurada

### Instalação

```bash
# Clone o repositório
git clone https://github.com/bryanwinchezz/Zenith.git

# Acesse a pasta
cd Zenith

# Instale as dependências
npm install

# Instale o Netlify CLI (se necessário)
npm install -g netlify-cli

# Inicie o servidor de desenvolvimento com Netlify
netlify dev
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
API_KEY=sua_chave_de_api_aqui
```

> ⚠️ Nunca suba sua chave de API para o repositório. O `.gitignore` já está configurado para protegê-la.

## 🌐 Deploy

O projeto é configurado para deploy automático no **Netlify**. Configure as variáveis de ambiente diretamente no painel do Netlify em **Site Settings → Environment Variables**.

```toml
# netlify.toml (configuração de funções)
[functions]
  directory = "netlify/functions"
```

## 👨‍💻 Autor

**bryanwinchezz (Kauan Bryan)**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/bryanwinchezz)
[![LinkedIn](https://img.shields.io/static/v1?message=LinkedIn&logo=linkedin&label=&color=0077B5&logoColor=white&labelColor=&style=for-the-badge)](https://www.linkedin.com/in/kauan-bryan-silveira-silva-416102350)
[![YouTube](https://img.shields.io/static/v1?message=YouTube&logo=youtube&label=&color=FF0000&logoColor=white&labelColor=&style=for-the-badge)](https://www.youtube.com/@bryanwinchez)

---

> Projeto desenvolvido como exploração de IA aplicada ao desenvolvimento web, integrando assistentes inteligentes com frontend moderno.
