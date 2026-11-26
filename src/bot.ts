import { Client, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { sendMessageToOpenAI, createConversationContext, limitConversationHistory, testOpenAIConnection, clearChatSession, getSessionStats, ConversationMessage } from './openai-simple';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Cria o cliente WhatsApp
const client = new Client({
    authStrategy: new (require('whatsapp-web.js').LocalAuth)({
        dataPath: './session'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-software-rasterizer'
        ],
        timeout: 60000
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
});

// Testa a conexêo com OpenAI na inicializaçêo
let openAIConnected = false;

// Histórico de conversas por chat
const conversationHistory = new Map<string, ConversationMessage[]>();

/**
 * Processa uma mensagem recebida e gera resposta usando OpenAI
 */
async function processMessage(message: Message): Promise<void> {
    try {
        const chatId = message.from;
        const messageText = message.body;
        const contactName = (message as any)._data?.notifyName || message.from;

        console.log(`📱 Mensagem recebida de ${contactName}: ${messageText}`);

        // Ignora mensagens do próprio bot
        if (message.fromMe) {
            return;
        }

        // Ignora mensagens de grupos (opcional - pode ser removido se quiser responder em grupos)
        if (message.from.includes('@g.us')) {
            console.log('📱 Mensagem de grupo ignorada');
            return;
        }

        // Verifica se a OpenAI está conectada
        if (!openAIConnected) {
            console.log('🔄 Testando conexêo com OpenAI...');
            openAIConnected = await testOpenAIConnection();
            if (!openAIConnected) {
                await message.reply('⚠️ Serviço de IA temporariamente indisponível. Tente novamente em alguns instantes.');
                return;
            }
            console.log('✅ OpenAI conectada com sucesso!');
        }

        // Obtém histórico da conversa
        let history = conversationHistory.get(chatId) || [];
        
        // Limita o histórico para evitar tokens excessivos
        history = limitConversationHistory(history, 20);

        // Adiciona a mensagem atual ao histórico
        history.push({ role: "user", content: messageText });

        // Cria contexto para a conversa
        const context = createConversationContext(
            chatId,
            contactName,
            message.type,
            message.from.includes('@g.us')
        );

        // Envia mensagem para a OpenAI usando o workflow
        const response = await sendMessageToOpenAI(messageText, context, history);

        if (response.success) {
            // Adiciona resposta ao histórico
            history.push({ role: "assistant", content: response.text });
            conversationHistory.set(chatId, history);

            // Envia resposta para o WhatsApp
            await message.reply(response.text);
            console.log(`🤖 Resposta enviada: ${response.text}`);
        } else {
            console.error('❌ Erro na OpenAI:', response.error);
            await message.reply('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.');
        }

    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        try {
            await message.reply('Desculpe, ocorreu um erro interno. Tente novamente mais tarde.');
        } catch (replyError) {
            console.error('❌ Erro ao enviar mensagem de erro:', replyError);
        }
    }
}

/**
 * Comandos especiais do bot
 */
async function handleSpecialCommands(message: Message): Promise<boolean> {
    const messageText = message.body.toLowerCase().trim();
    const chatId = message.from;

    switch (messageText) {
        case '!help':
        case '!ajuda':
            const helpText = `🤖 *AgentKit WhatsApp Bot*

*Comandos disponíveis:*
• !help ou !ajuda - Mostra esta mensagem
• !clear ou !limpar - Limpa o histórico da conversa
• !status - Mostra o status do bot
• !sessions - Mostra sessões ativas do ChatKit
• !ping - Testa se o bot está funcionando

*Como usar:*
Simplesmente envie uma mensagem normal e eu responderei usando inteligência artificial conectada ao workflow do Agent Builder!`;

            await message.reply(helpText);
            return true;

        case '!clear':
        case '!limpar':
            conversationHistory.delete(chatId);
            clearChatSession(chatId); // Limpa session do ChatKit
            await message.reply('✅ Histórico da conversa limpo com sucesso!');
            return true;

        case '!status':
            const statusText = `🤖 *Status do Bot*

✅ Bot ativo e funcionando
📊 Conversas ativas: ${conversationHistory.size}
🕐 Última atualizaçêo: ${new Date().toLocaleString('pt-BR')}`;

            await message.reply(statusText);
            return true;

        case '!sessions':
        case '!sessões':
            const sessionStats = getSessionStats();
            const sessionsText = `📊 *Estatísticas do Workflow*

👥 Chats ativos: ${sessionStats.total}
🔄 Total de execuções: ${Array.from(sessionStats.sessions).reduce((acc, s) => acc + parseInt(s.sessionId.split('_')[2] || '0'), 0)}

${sessionStats.total > 0 ? `*Chats com workflow ativo:*\n${sessionStats.sessions.map(s => `• ${s.chatId.substring(0, 25)}...`).join('\n')}` : '_Nenhum chat ativo no momento_'}`;

            await message.reply(sessionsText);
            return true;

        case '!ping':
            await message.reply('🏓 Pong! Bot funcionando perfeitamente!');
            return true;

        default:
            return false;
    }
}

// Evento: Cliente pronto
client.once('ready', () => {
    console.log('✅ Cliente WhatsApp está pronto!');
    console.log('🤖 Bot AgentKit iniciado com sucesso!');
    console.log('📱 Aguardando mensagens...');
});

// Evento: QR Code recebido
client.on('qr', (qr) => {
    console.log('📱 QR Code recebido! Escaneie com seu WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 Abra o WhatsApp no seu celular:');
    console.log('   1. Toque nos três pontos (⋮)');
    console.log('   2. Toque em "Dispositivos conectados"');
    console.log('   3. Toque em "Conectar um dispositivo"');
    console.log('   4. Escaneie o QR Code acima\n');
});

// Evento: Autenticaçêo realizada
client.on('authenticated', () => {
    console.log('✅ Autenticaçêo realizada com sucesso!');
});

// Evento: Falha na autenticaçêo
client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticaçêo:', msg);
});

// Evento: Cliente desconectado
client.on('disconnected', (reason) => {
    console.log('⚠️ Cliente desconectado:', reason);
});

// Evento: Mensagem recebida
client.on('message_create', async (message) => {
    try {
        // Verifica se é um comando especial
        const isSpecialCommand = await handleSpecialCommands(message);

        if (!isSpecialCommand) {
            // Processa mensagem normal com IA
            await processMessage(message);
        }
    } catch (error) {
        console.error('❌ Erro no handler de mensagem:', error);
    }
});

// Evento: Erro
client.on('error', (error) => {
    console.error('❌ Erro no cliente:', error);
});

// Funçêo para encerrar o bot graciosamente
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando bot...');
    
    try {
        // Desconecta o cliente WhatsApp
        await client.destroy();
        
        console.log('✅ Bot encerrado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao encerrar bot:', error);
        process.exit(1);
    }
});

// Inicializa o cliente
console.log('🚀 Iniciando bot AgentKit WhatsApp...');
client.initialize();

export { client };
