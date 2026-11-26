ï»¿# ê°Å¸Â¤â AgentKit WhatsApp Bot

Bot do WhatsApp com IA da OpenAI usando a biblioteca [whatsapp-web.js](https://wwebjs.dev/).

## ê¢ÅÂ¨ Funcionalidades

- ê°Å¸Â¤â **Respostas automêÂ¡ticas** usando inteligêÂªncia artificial da OpenAI
- ê°Å¸âÂ± **Interface WhatsApp** nativa atravêÂ©s do WhatsApp Web
- ê°Å¸ââ **HistêÂ³rico de conversas** mantido por chat
- ê°Å¸Å½Â¯ **Comandos especiais** para controle do bot
- ê°Å¸âÂ **AutenticaêÂ§êÂ£o segura** com QR Code
- ê°Å¸âÅ  **Logs detalhados** para monitoramento
- ê°Å¸âºÂ¡ê¯Â¸Â **Tratamento de erros** robusto

## ê°Å¸Å¡â¬ InstalaêÂ§êÂ£o

### PrêÂ©-requisitos

- Node.js 18+ 
- NPM ou Yarn
- Conta OpenAI com API Key

### Passos

1. **Clone o repositêÂ³rio:**
```bash
git clone https://github.com/linnoff88-dev/whatsapp-agentkit
cd whatsapp-agentkit
```

2. **Instale as dependêÂªncias:**
```bash
npm install
```

3. **Configure a API Key da OpenAI:**
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione sua chave da OpenAI:
```env
OPENAI_API_KEY=sua_chave_da_openai_aqui
WORFLOW_ID=seu_workflow_aqui
```

4. **Compile o TypeScript:**
```bash
npm run build
```

## ê°Å¸Å½Â¯ Como Usar

### Iniciar o Bot

#### ê°Å¸ÂªÅ¸ Windows - Usando arquivos .bat (Recomendado)

Basta dar duplo clique nos arquivos:

- **`start_dev.bat`** - Inicia em modo desenvolvimento
- **`start_prod.bat`** - Compila e inicia em modo produêÂ§êÂ£o

#### ê°Å¸âÂ» Via linha de comando

```bash
# Modo desenvolvimento (TypeScript)
npm run dev

# Modo produêÂ§êÂ£o (JavaScript compilado)
npm start
```

### Primeira ExecuêÂ§êÂ£o

1. **Execute o bot:**
```bash
npm run dev
```

2. **Escaneie o QR Code:**
   - O bot exibirêÂ¡ um QR Code no terminal
   - Abra o WhatsApp no seu celular
   - VêÂ¡ em ConfiguraêÂ§êÂµes > Dispositivos conectados
   - Toque em "Conectar um dispositivo"
   - Escaneie o QR Code

3. **Pronto!** O bot estarêÂ¡ funcionando e responderêÂ¡ êÂ s mensagens

## ê°Å¸âÂ± Comandos DisponêÂ­veis

| Comando | DescriêÂ§êÂ£o |
|---------|-----------|
| `!help` ou `!ajuda` | Mostra a lista de comandos |
| `!clear` ou `!limpar` | Limpa o histêÂ³rico da conversa |
| `!status` | Mostra o status do bot |
| `!ping` | Testa se o bot estêÂ¡ funcionando |

## ê°Å¸âÂ§ ConfiguraêÂ§êÂ£o

### VariêÂ¡veis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# ConfiguraêÂ§êÂ£o da OpenAI
OPENAI_API_KEY=sua_chave_da_openai_aqui

# ConfiguraêÂ§êÂ£o do Bot
BOT_NAME=AgentKit WhatsApp Bot
BOT_DESCRIPTION=Bot do WhatsApp com IA da OpenAI

# ConfiguraêÂ§êÂ£o do Ambiente
NODE_ENV=development
```

### PersonalizaêÂ§êÂ£o

Edite o arquivo `config.ts` para personalizar:

- **Modelo da OpenAI**: Altere o modelo usado
- **Temperatura**: Controle a criatividade das respostas
- **MêÂ¡ximo de tokens**: Limite o tamanho das respostas
- **HistêÂ³rico**: Quantas mensagens manter na memêÂ³ria

## ê°Å¸âÂ Estrutura do Projeto

```
whatsapp-agentkit/
ê¢âÅê¢ââ¬ê¢ââ¬ src/
ê¢ââ   ê¢âÅê¢ââ¬ê¢ââ¬ bot.ts              # Bot principal do WhatsApp
ê¢ââ   ê¢âÅê¢ââ¬ê¢ââ¬ openai-simple.ts    # IntegraêÂ§êÂ£o com a API da OpenAI
ê¢ââ   ê¢ââê¢ââ¬ê¢ââ¬ index.ts            # Arquivo de entrada
ê¢âÅê¢ââ¬ê¢ââ¬ dist/                   # Arquivos compilados (gerado automaticamente)
ê¢âÅê¢ââ¬ê¢ââ¬ session/                # SessêÂ£o do WhatsApp (gerado automaticamente)
ê¢âÅê¢ââ¬ê¢ââ¬ start_dev.bat           # ê°Å¸ÂªÅ¸ Iniciar em modo desenvolvimento
ê¢âÅê¢ââ¬ê¢ââ¬ start_prod.bat          # ê°Å¸ÂªÅ¸ Iniciar em modo produêÂ§êÂ£o
ê¢âÅê¢ââ¬ê¢ââ¬ package.json            # DependêÂªncias e scripts
ê¢âÅê¢ââ¬ê¢ââ¬ tsconfig.json           # ConfiguraêÂ§êÂ£o do TypeScript
ê¢âÅê¢ââ¬ê¢ââ¬ .env.example            # Exemplo de variêÂ¡veis de ambiente
ê¢âÅê¢ââ¬ê¢ââ¬ README.md               # Este arquivo
ê¢ââê¢ââ¬ê¢ââ¬ RELATORIO_SISTEMA.md    # DocumentaêÂ§êÂ£o têÂ©cnica completa
```

## ê°Å¸âºÂ ê¯Â¸Â Scripts DisponêÂ­veis

```bash
# Desenvolvimento
npm run dev          # Executa em modo desenvolvimento

# ProduêÂ§êÂ£o
npm run build        # Compila TypeScript para JavaScript
npm start           # Executa versêÂ£o compilada

# Testes
npm test            # Executa testes (quando implementados)
```

## ê°Å¸ââ SeguranêÂ§a

- ê¢Åâ¦ **SessêÂ£o local**: Dados de autenticaêÂ§êÂ£o armazenados localmente
- ê¢Åâ¦ **API Key segura**: Chave da OpenAI em variêÂ¡veis de ambiente
- ê¢Åâ¦ **Logs controlados**: InformaêÂ§êÂµes sensêÂ­veis nêÂ£o sêÂ£o logadas
- ê¢Åâ¦ **Tratamento de erros**: Falhas nêÂ£o expêÂµem dados internos

## ê°Å¸Ââº SoluêÂ§êÂ£o de Problemas

### Bot nêÂ£o conecta
- Verifique se o Node.js estêÂ¡ na versêÂ£o 18+
- Confirme se a API Key da OpenAI estêÂ¡ correta
- Tente deletar a pasta `session/` e reconectar

### QR Code nêÂ£o aparece
- Verifique se o `qrcode-terminal` estêÂ¡ instalado
- Execute `npm install` novamente

### Respostas nêÂ£o funcionam
- Confirme se a API Key da OpenAI tem crêÂ©ditos
- Verifique os logs para erros especêÂ­ficos
- Teste com `!ping` para verificar se o bot estêÂ¡ ativo

### Erro de compilaêÂ§êÂ£o
- Execute `npm run build` para ver erros detalhados
- Verifique se todas as dependêÂªncias estêÂ£o instaladas

## ê°Å¸âÅ  Logs

O bot gera logs detalhados para monitoramento:

```
ê°Å¸Å¡â¬ Iniciando bot AgentKit WhatsApp...
ê°Å¸âÂ± QR Code recebido! Escaneie com seu WhatsApp:
ê¢Åâ¦ Cliente WhatsApp estêÂ¡ pronto!
ê°Å¸Â¤â Bot AgentKit iniciado com sucesso!
ê°Å¸âÂ± Aguardando mensagens...
ê°Å¸âÂ± Mensagem recebida de JoêÂ£o: OlêÂ¡!
ê°Å¸Â¤â Resposta enviada: OlêÂ¡! Como posso ajudêÂ¡-lo hoje?
```

## ê°Å¸Â¤â Desenvolvimento com IA

Este projeto foi desenvolvido com assistêÂªncia de IA e pode ser facilmente melhorado usando:

### Claude Code
Ferramenta oficial da Anthropic para desenvolvimento assistido por IA.

```bash
# Instale o Claude Code
npm install -g @anthropic/claude-code

# Ou use via VS Code Extension
# https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-code
```

**Comandos êÂºteis com Claude Code:**
- `/help` - Ajuda sobre comandos disponêÂ­veis
- `/review` - Revisar cêÂ³digo
- `/optimize` - Otimizar performance
- `/test` - Gerar testes automatizados
- `/docs` - Gerar documentaêÂ§êÂ£o

### GitHub Copilot
Alternativa para desenvolvimento assistido por IA.

```bash
# Use via VS Code Extension
# https://marketplace.visualstudio.com/items?itemName=GitHub.copilot
```

### ê°Å¸âÂ¡ Dicas para usar IA no projeto:

1. **Adicionar novas funcionalidades**
   ```
   "Adicione suporte para mensagens de êÂ¡udio"
   "Implemente rate limiting por usuêÂ¡rio"
   ```

2. **Melhorar cêÂ³digo existente**
   ```
   "Otimize o gerenciamento de histêÂ³rico"
   "Adicione testes unitêÂ¡rios para bot.ts"
   ```

3. **Debugar problemas**
   ```
   "Por que o bot nêÂ£o estêÂ¡ respondendo em grupos?"
   "Como posso reduzir o uso de tokens da OpenAI?"
   ```

4. **DocumentaêÂ§êÂ£o**
   ```
   "Gere documentaêÂ§êÂ£o JSDoc para todas as funêÂ§êÂµes"
   "Crie um guia de contribuiêÂ§êÂ£o"
   ```

## ê°Å¸Â¤Â ContribuiêÂ§êÂ£o

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanêÂ§as (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Dica:** Use Claude Code ou GitHub Copilot para acelerar o desenvolvimento!

## ê°Å¸ââ LicenêÂ§a

Este projeto estêÂ¡ sob a licenêÂ§a MIT. Veja o arquivo `LICENSE` para mais detalhes.

## ê°Å¸â¢Â Agradecimentos

- [whatsapp-web.js](https://wwebjs.dev/) - Biblioteca para integraêÂ§êÂ£o com WhatsApp
- [OpenAI](https://openai.com/) - API de inteligêÂªncia artificial
- [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal) - GeraêÂ§êÂ£o de QR Code no terminal

## ê°Å¸âÅ¾ Suporte

Para suporte, abra uma issue no GitHub ou entre em contato:

- **GitHub Issues**: [Link para issues]
- **Email**: suporte@agentkit.com.br
- **Discord**: [Link do servidor]

---

**Desenvolvido com ê¢ÂÂ¤ê¯Â¸Â pela equipe AgentKit**

---

Projeto  - ARCKHÉe