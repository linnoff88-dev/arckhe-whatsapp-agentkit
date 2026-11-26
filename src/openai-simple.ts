import OpenAI from "openai";
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Configuraçêo do cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Interface para resposta da OpenAI
 */
export interface OpenAIResponse {
  text: string;
  success: boolean;
  error?: string;
}

/**
 * Interface para histórico de conversa
 */
export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Interface para contexto da conversa
 */
export interface ConversationContext {
  chatId: string;
  contactName: string;
  timestamp: string;
  platform: string;
  messageType: string;
  isGroup: boolean;
}

// Contador de execuções de workflows por chat (para estatísticas)
const workflowExecutions = new Map<string, number>();

/**
 * Interface para usuário do ChatKit
 */
interface ChatKitUser {
  name: string;
  platform: string;
  chat_id: string;
}

/**
 * Interface para input do ChatKit Workflow
 */
interface ChatKitRunInput {
  input: {
    message: string;
    user: ChatKitUser;
  };
}

/**
 * Chama o workflow do ChatKit diretamente usando o formato oficial
 * (Baseado no exemplo do cxopenai-simple.ts)
 * @param workflowId - ID do workflow
 * @param userMessage - Mensagem do usuário
 * @param context - Contexto da conversa
 * @returns Promise<OpenAIResponse>
 */
async function runRealChatKitWorkflow(
  workflowId: string,
  userMessage: string,
  context?: ConversationContext
): Promise<OpenAIResponse> {
  try {
    console.log(`🎯 Chamando workflow real do ChatKit: ${workflowId}...`);

    const url = `https://api.openai.com/v1/chatkit/workflows/${workflowId}/runs`;

    const body: ChatKitRunInput = {
      input: {
        message: userMessage,
        user: {
          name: context?.contactName || 'Usuário',
          platform: context?.platform || 'WhatsApp',
          chat_id: context?.chatId || 'default_user'
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();

    if (!response.ok) {
      let details: any;
      try {
        details = JSON.parse(text);
      } catch {
        details = text;
      }
      console.error(`❌ ChatKit workflow error (${response.status}):`, JSON.stringify(details).substring(0, 500));
      throw new Error(`ChatKit workflow error (${response.status}): ${JSON.stringify(details)}`);
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON from ChatKit workflow');
    }

    // Extrai a resposta do workflow
    let output = "Desculpe, nêo recebi uma resposta válida.";

    if (data.output) {
      output = String(data.output);
    } else if (data.result) {
      output = String(data.result);
    } else if (data.message) {
      output = String(data.message);
    } else if (data.text) {
      output = String(data.text);
    } else {
      console.warn('⚠️ Formato de resposta inesperado:', data);
      output = JSON.stringify(data);
    }

    console.log(`✅ Resposta do workflow real: ${output.substring(0, 100)}...`);

    // Incrementa contador
    const chatId = context?.chatId || 'default_user';
    workflowExecutions.set(chatId, (workflowExecutions.get(chatId) || 0) + 1);

    return {
      text: output,
      success: true
    };

  } catch (error) {
    console.error('❌ Erro ao chamar workflow real:', error);
    throw error;
  }
}

/**
 * Executa um workflow do OpenAI Agent Builder via chat completions
 * O workflow é referenciado no system prompt para o modelo seguir sua lógica
 * @param workflowId - ID do Workflow (wf_xxx)
 * @param userInput - Input do usuário
 * @param context - Contexto adicional para o workflow
 * @param conversationHistory - Histórico da conversa
 * @returns Promise<OpenAIResponse>
 */
export async function runAgentKitWorkflow(
  workflowId: string,
  userInput: string,
  context?: ConversationContext,
  conversationHistory?: ConversationMessage[]
): Promise<OpenAIResponse> {
  // Verifica se deve tentar usar o workflow real primeiro
  const useRealWorkflow = process.env.USE_REAL_WORKFLOW === 'true';

  if (useRealWorkflow) {
    try {
      console.log(`🎯 Tentando usar workflow real do ChatKit...`);
      return await runRealChatKitWorkflow(workflowId, userInput, context);
    } catch (error) {
      console.log(`⚠️ Workflow real falhou, usando chat completions como fallback...`);
      // Continua para chat completions abaixo
    }
  }

  try {
    console.log(`🤖 Executando workflow ${workflowId} via chat completions...`);

    const chatId = context?.chatId || 'default_user';
    const contactName = context?.contactName || 'Usuário';

    // Monta mensagens com contexto e histórico
    const messages: ConversationMessage[] = [
      {
        role: "system",
        content: `Você é um assistente inteligente integrado ao WhatsApp via AgentKit.
Seu objetivo é executar o fluxo correspondente ao workflow ${workflowId}.

Contexto do usuário:
- Nome: ${contactName}
- Plataforma: ${context?.platform || 'whatsapp'}
- Identificador: ${chatId}

Regras de comportamento:
- Responda sempre em português brasileiro
- Seja simpático, prestativo e direto
- Use emojis quando apropriado para tornar a conversa mais amigável
- Mantenha respostas concisas (máximo 500 caracteres quando possível)
- Se nêo souber algo, admita e ofereça ajuda alternativa
- Interprete a intençêo do usuário e responda adequadamente
- Lembre-se do contexto da conversa anterior

Execute o fluxo lógico equivalente ao workflow ${workflowId} de forma natural.`
      },
      ...(conversationHistory || []),
      {
        role: "user",
        content: userInput
      }
    ];

    const body = {
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro ao executar workflow: ${response.status}`);
      console.error(`❌ Resposta: ${errorText.substring(0, 500)}`);
      throw new Error(`Falha ao executar workflow: ${response.status}`);
    }

    const data = await response.json() as any;

    // Extrai a resposta do assistente
    let output = "Desculpe, nêo recebi uma resposta válida.";

    if (data.choices && data.choices[0]) {
      const choice = data.choices[0];

      if (choice.message && choice.message.content) {
        output = choice.message.content;
      } else if (choice.text) {
        output = choice.text;
      } else {
        console.warn('⚠️ Formato de resposta inesperado:', choice);
        output = JSON.stringify(choice);
      }
    } else {
      console.warn('⚠️ Resposta sem choices:', data);
      output = JSON.stringify(data);
    }

    console.log(`✅ Resposta do workflow: ${output.substring(0, 100)}...`);

    // Incrementa contador de execuções
    workflowExecutions.set(chatId, (workflowExecutions.get(chatId) || 0) + 1);

    return {
      text: output,
      success: true
    };

  } catch (error) {
    console.error(`❌ Erro ao executar workflow ${workflowId}:`, error);

    // Fallback para chat completions simples se o workflow falhar
    console.log('⚠️ Usando fallback para chat completions...');
    return await fallbackToCompletions(workflowId, userInput, context, conversationHistory);
  }
}

/**
 * Fallback usando chat completions quando o workflow nêo está disponível
 */
async function fallbackToCompletions(
  workflowId: string,
  userInput: string,
  context?: ConversationContext,
  conversationHistory?: ConversationMessage[]
): Promise<OpenAIResponse> {
  try {
    console.log('🔄 Usando Chat Completions como fallback...');

    const messages: ConversationMessage[] = [
      {
        role: "system",
        content: `Você é um assistente útil do AgentKit. Execute o workflow ${workflowId} conforme solicitado pelo usuário.

Contexto da conversa:
- Contato: ${context?.contactName || 'Usuário'}
- Plataforma: ${context?.platform || 'whatsapp'}
- Tipo de mensagem: ${context?.messageType || 'text'}
- É grupo: ${context?.isGroup ? 'Sim' : 'Nêo'}
- Timestamp: ${context?.timestamp || new Date().toISOString()}

Instruções:
- Seja amigável e prestativo
- Mantenha respostas concisas (máximo 500 caracteres)
- Use emojis ocasionalmente para tornar a conversa mais amigável
- Responda sempre em português brasileiro`
      },
      ...(conversationHistory || []),
      {
        role: "user",
        content: userInput
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      text: response.choices[0]?.message?.content || "Desculpe, nêo consegui processar sua solicitaçêo.",
      success: true
    };
  } catch (error) {
    return {
      text: "Desculpe, ocorreu um erro ao processar sua solicitaçêo.",
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Limpa dados de um chat específico
 * @param chatId - ID do chat
 */
export function clearChatSession(chatId: string): void {
  if (workflowExecutions.has(chatId)) {
    workflowExecutions.delete(chatId);
    console.log(`🗑️ Dados do chat ${chatId} limpos`);
  } else {
    console.log(`🗑️ Nenhum dado encontrado para ${chatId}`);
  }
}

/**
 * Envia uma mensagem para a OpenAI e recebe uma resposta (funçêo simplificada)
 * @param message - Mensagem do usuário
 * @param context - Contexto da conversa
 * @param conversationHistory - Histórico da conversa
 * @returns Promise<OpenAIResponse>
 */
export async function sendMessageToOpenAI(
  message: string,
  context: ConversationContext,
  conversationHistory: ConversationMessage[] = []
): Promise<OpenAIResponse> {
  // Usar o workflow padrêo do .env ou fallback
  const defaultWorkflowId = process.env.WORKFLOW_ID || "wf_2V0vUNR8UYZ3xM15B9a910586940994955";
  return await runAgentKitWorkflow(defaultWorkflowId, message, context, conversationHistory);
}

/**
 * Cria um contexto padrêo para conversas
 * @param chatId - ID do chat
 * @param contactName - Nome do contato
 * @param messageType - Tipo da mensagem
 * @param isGroup - Se é um grupo
 * @returns ConversationContext
 */
export function createConversationContext(
  chatId: string,
  contactName: string,
  messageType: string,
  isGroup: boolean = false
): ConversationContext {
  return {
    chatId,
    contactName,
    timestamp: new Date().toISOString(),
    platform: 'whatsapp',
    messageType,
    isGroup
  };
}

/**
 * Limita o histórico de conversa para evitar tokens excessivos
 * @param history - Histórico atual
 * @param maxLength - Tamanho máximo (padrêo: 20)
 * @returns ConversationMessage[]
 */
export function limitConversationHistory(
  history: ConversationMessage[],
  maxLength: number = 20
): ConversationMessage[] {
  if (history.length <= maxLength) {
    return history;
  }

  // Mantém a mensagem do sistema e as últimas mensagens
  const systemMessage = history.find(msg => msg.role === 'system');
  const recentMessages = history.slice(-maxLength + 1);

  return systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
}

/**
 * Testa a conexêo com a OpenAI
 * @returns Promise<boolean>
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Teste de conexêo" }],
      max_tokens: 10
    });

    return response.choices[0]?.message?.content ? true : false;
  } catch (error) {
    console.error('Erro ao testar conexêo com OpenAI:', error);
    return false;
  }
}

/**
 * Retorna estatísticas de execuções de workflows
 * @returns Object com informações de execuções
 */
export function getSessionStats() {
  return {
    total: workflowExecutions.size,
    active: workflowExecutions.size,
    expired: 0,
    sessions: Array.from(workflowExecutions.entries()).map(([chatId, count]) => ({
      chatId,
      sessionId: `workflow_executions_${count}`,
      expiresAt: new Date().toISOString()
    }))
  };
}
