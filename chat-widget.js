// Chat Widget Script
;(() => {
  const BASEROW_CONFIG = {
    apiUrl: "https://baserow.codewave-ia.com.br/api/database/fields/table/682/",
    token: "sYd38oTJdDvSnS1N5dci6y12PUEt9mKg",
  }

  // Cache de elementos DOM e variáveis globais
  let widgetContainer, chatContainer, messagesContainer, textarea, sendButton, chatInterface
  let currentSessionId = ""
  let baserowRowId = null
  let typingIndicator = null
  let pollTimer = null

  // Configuração padrão
  const defaultConfig = {
    webhook: { url: "", route: "" },
    branding: {
      logo: "",
      name: "",
      welcomeText: "",
      responseTimeText: "",
      poweredBy: { text: "Powered by ChatWidget", link: "#" },
    },
    style: {
      primaryColor: "#854fff",
      secondaryColor: "#6b3fd4",
      position: "right",
      backgroundColor: "#ffffff",
      fontColor: "#333333",
    },
    baserow: null,
  }

  // Evita duplicar inicialização
  if (window.ChatWidgetInitialized) return
  window.ChatWidgetInitialized = true

  // Merge user config com defaults - otimizado
  const config = {
    webhook: { ...defaultConfig.webhook, ...(window.ChatWidgetConfig?.webhook || {}) },
    branding: { ...defaultConfig.branding, ...(window.ChatWidgetConfig?.branding || {}) },
    style: { ...defaultConfig.style, ...(window.ChatWidgetConfig?.style || {}) },
    baserow: BASEROW_CONFIG,
  }

  // Inicialização - carrega recursos e cria elementos DOM
  function init() {
    // Carrega a fonte Geist com preload para melhor performance
    const fontLink = document.createElement("link")
    fontLink.rel = "preload"
    fontLink.href = "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css"
    fontLink.as = "style"
    fontLink.onload = function () {
      this.onload = null
      this.rel = "stylesheet"
    }
    document.head.appendChild(fontLink)

    // Injeta estilos - usando insertAdjacentHTML para melhor performance
    const styleSheet = document.createElement("style")
    styleSheet.textContent = getStyles()
    document.head.appendChild(styleSheet)

    // Cria elementos principais
    createWidgetElements()

    // Adiciona event listeners
    setupEventListeners()
  }

  // Função para obter estilos - separada para melhor organização
  function getStyles() {
    return `
        .chat-widget {
            --chat--color-primary: var(--chat-primary-color, ${config.style.primaryColor});
            --chat--color-secondary: var(--chat-secondary-color, ${config.style.secondaryColor});
            --chat--color-background: var(--chat-background-color, ${config.style.backgroundColor});
            --chat--color-font: var(--chat-font-color, ${config.style.fontColor});
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            ${config.style.position === "left" ? "left: 20px;" : "right: 20px;"}
            z-index: 1000;
            display: none;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            font-family: inherit;
        }
        .chat-widget .chat-container.open {
            display: flex;
            flex-direction: column;
        }
        .chat-widget .brand-header {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(133, 79, 255, 0.1);
            position: relative;
        }
        .chat-widget .close-button {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--chat--color-font);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
            font-size: 20px;
            opacity: 0.6;
        }
        .chat-widget .close-button:hover {
            opacity: 1;
        }
        .chat-widget .brand-header img {
            width: 32px;
            height: 32px;
        }
        .chat-widget .brand-header span {
            font-size: 18px;
            font-weight: 500;
            color: var(--chat--color-font);
        }
        .chat-widget .new-conversation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            text-align: center;
            width: 100%;
            max-width: 300px;
        }
        .chat-widget .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: var(--chat--color-font);
            margin-bottom: 24px;
            line-height: 1.3;
        }
        .chat-widget .new-chat-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.3s;
            font-weight: 500;
            font-family: inherit;
            margin-bottom: 12px;
        }
        .chat-widget .new-chat-btn:hover {
            transform: scale(1.02);
        }
        .chat-widget .message-icon {
            width: 20px;
            height: 20px;
        }
        .chat-widget .response-text {
            font-size: 14px;
            color: var(--chat--color-font);
            opacity: 0.7;
            margin: 0;
        }
        .chat-widget .chat-interface {
            display: none;
            flex-direction: column;
            height: 100%;
        }
        .chat-widget .chat-interface.active {
            display: flex;
        }
        .chat-widget .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: var(--chat--color-background);
            display: flex;
            flex-direction: column;
            scroll-behavior: smooth;
        }
        .chat-widget .chat-message {
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
        }
        .chat-widget .chat-message.user {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            align-self: flex-end;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.2);
            border: none;
        }
        .chat-widget .chat-message.bot {
            background: var(--chat--color-background);
            border: 1px solid rgba(133, 79, 255, 0.2);
            color: var(--chat--color-font);
            align-self: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .chat-widget .chat-input {
            padding: 16px;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
            display: flex;
            gap: 8px;
        }
        .chat-widget .chat-input textarea {
            flex: 1;
            padding: 12px;
            border: 1px solid rgba(133, 79, 255, 0.2);
            border-radius: 8px;
            background: var(--chat--color-background);
            color: var(--chat--color-font);
            resize: none;
            font-family: inherit;
            font-size: 14px;
        }
        .chat-widget .chat-input textarea::placeholder {
            color: var(--chat--color-font);
            opacity: 0.6;
        }
        .chat-widget .chat-input button {
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            cursor: pointer;
            transition: transform 0.2s;
            font-family: inherit;
            font-weight: 500;
        }
        .chat-widget .chat-input button:hover {
            transform: scale(1.05);
        }
        .chat-widget .chat-toggle {
            position: fixed;
            bottom: 20px;
            ${config.style.position === "left" ? "left: 20px;" : "right: 20px;"}
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: linear-gradient(135deg, var(--chat--color-primary) 0%, var(--chat--color-secondary) 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(133, 79, 255, 0.3);
            z-index: 999;
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .chat-widget .chat-toggle:hover {
            transform: scale(1.05);
        }
        .chat-widget .chat-toggle svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }
        .chat-widget .chat-footer {
            padding: 8px;
            text-align: center;
            background: var(--chat--color-background);
            border-top: 1px solid rgba(133, 79, 255, 0.1);
        }
        .chat-widget .chat-footer a {
            color: var(--chat--color-primary);
            text-decoration: none;
            font-size: 12px;
            opacity: 0.8;
            transition: opacity 0.2s;
            font-family: inherit;
        }
        .chat-widget .chat-footer a:hover {
            opacity: 1;
        }
        /* Indicador de digitação */
        .chat-message.typing-indicator {
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }
        .typing-dots {
            display: inline-flex;
            gap: 4px;
            margin-top: 4px;
        }
        .typing-dots .dot {
            width: 8px;
            height: 8px;
            background-color: #ccc;
            border-radius: 50%;
            animation: typingIndicator 1s infinite;
            opacity: 0.4;
        }
        .typing-dots .dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        .typing-dots .dot:nth-child(3) {
            animation-delay: 0.4s;
        }
        @keyframes typingIndicator {
            0% {
                transform: translateY(0);
                opacity: 0.4;
            }
            50% {
                transform: translateY(-3px);
                opacity: 1;
            }
            100% {
                transform: translateY(0);
                opacity: 0.4;
            }
        }
        /* Links nas mensagens */
        .chat-widget .chat-message a {
            color: inherit;
            text-decoration: underline;
            word-break: break-all;
        }
        .chat-widget .chat-message.user a {
            color: white;
        }
        .chat-widget .chat-message.bot a {
            color: var(--chat--color-primary);
        }`
  }

  // Cria os elementos do widget
  function createWidgetElements() {
    // Cria o container principal
    widgetContainer = document.createElement("div")
    widgetContainer.className = "chat-widget"

    // Cria o container do chat
    chatContainer = document.createElement("div")
    chatContainer.className = "chat-container"

    // HTML do "Send us a message" + interface
    const newConversationHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button">×</button>
        </div>
        <div class="new-conversation">
            <h2 class="welcome-text">${config.branding.welcomeText}</h2>
            <button class="new-chat-btn">
                <svg class="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                </svg>
                Send us a message
            </button>
            <p class="response-text">${config.branding.responseTimeText}</p>
        </div>`

    const chatInterfaceHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message here..." rows="1"></textarea>
                <button type="submit">Send</button>
            </div>
            <div class="chat-footer">
                const link = config.branding.poweredBy?.link || "https://www.instagram.com/codewave.ia?igsh=N283MXpvc25laHFi";
                const text = config.branding.poweredBy?.text || "Powered by CodeWave.ia";
                const html = `<a href="${link}" target="_blank">${text}</a>`;
            </div>
        </div>`

    chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML

    // Botão flutuante (circulo)
    const toggleButton = document.createElement("button")
    toggleButton.className = "chat-toggle"
    toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`

    // Anexa ao documento
    widgetContainer.appendChild(chatContainer)
    widgetContainer.appendChild(toggleButton)
    document.body.appendChild(widgetContainer)

    // Armazena referências para elementos frequentemente usados
    chatInterface = chatContainer.querySelector(".chat-interface")
    messagesContainer = chatContainer.querySelector(".chat-messages")
    textarea = chatContainer.querySelector("textarea")
    sendButton = chatContainer.querySelector('button[type="submit"]')
  }

  // Configura event listeners
  function setupEventListeners() {
    // Botão flutuante (abre/fecha chat)
    widgetContainer.querySelector(".chat-toggle").addEventListener("click", () => {
      chatContainer.classList.toggle("open")
    })

    // "Send us a message"
    chatContainer.querySelector(".new-chat-btn").addEventListener("click", startNewConversation)

    // Botão "Send"
    sendButton.addEventListener("click", handleSendMessage)

    // Enter envia mensagem
    textarea.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    })

    // Fecha chat no "×" - usando delegação de eventos para melhor performance
    chatContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("close-button")) {
        chatContainer.classList.remove("open")
      }
    })
  }

  // Handler para envio de mensagem
  function handleSendMessage() {
    const message = textarea.value.trim()
    if (message) {
      sendMessage(message)
      textarea.value = ""
    }
  }

  // Função para converter URLs em links clicáveis - otimizada
  function linkifyText(text) {
    // Regex para detectar links HTTP/HTTPS
    const urlRegex = /(https?:\/\/[^\s]+)/g
    // Substitui as URLs encontradas por links HTML
    return text.replace(
      urlRegex,
      () => `<a href="https://personcare.com" target="_blank" rel="noopener noreferrer">Checkout PersonCare</a>`,
    )
  }

  // Função para exibir indicador de digitação - otimizada para reutilização
  function showTypingIndicator() {
    if (typingIndicator) return typingIndicator

    typingIndicator = document.createElement("div")
    typingIndicator.className = "chat-message bot typing-indicator"
    typingIndicator.innerHTML = `
        <div class="typing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        </div>`
    messagesContainer.appendChild(typingIndicator)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    return typingIndicator
  }

  // Função para remover indicador de digitação
  function hideTypingIndicator() {
    if (typingIndicator && typingIndicator.parentNode) {
      typingIndicator.parentNode.removeChild(typingIndicator)
      typingIndicator = null
    }
  }

  // Gera UUID - otimizado para usar crypto.randomUUID quando disponível
  function generateUUID() {
    if (crypto.randomUUID) return crypto.randomUUID()

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // Extrai ID da tabela da URL da API - função auxiliar
  function extractTableId(apiUrl) {
    const tableIdMatch = apiUrl.match(/\/table\/(\d+)/)
    return tableIdMatch ? tableIdMatch[1] : null
  }

  // Cache para respostas do Baserow
  const responseCache = {
    lastOutput: null,
    lastFetch: 0,
    cacheDuration: 500, // ms
  }

  // Busca o campo output no Baserow - com cache para reduzir chamadas
  async function fetchBaserowResponse() {
    if (!config.baserow || !config.baserow.apiUrl || !config.baserow.token || !baserowRowId) return null

    // Verifica cache
    const now = Date.now()
    if (now - responseCache.lastFetch < responseCache.cacheDuration) {
      return responseCache.lastOutput
    }

    // Extract the table ID from the API URL
    const tableId = extractTableId(config.baserow.apiUrl)
    if (!tableId) {
      console.error("Não foi possível extrair o ID da tabela da URL da API")
      return null
    }

    // Construir a URL correta
    const baseUrl = config.baserow.apiUrl.split("/api/")[0]
    const url = `${baseUrl}/api/database/rows/table/${tableId}/${baserowRowId}/?user_field_names=true`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${config.baserow.token}`,
        },
        // Adiciona cache-control para evitar caching do navegador
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()

      // Atualiza cache
      responseCache.lastOutput = data.output
      responseCache.lastFetch = now

      return data.output
    } catch (e) {
      console.error("Erro ao buscar resposta do Baserow:", e)
      return null
    }
  }

  // Polling otimizado com cancelamento
  async function pollForOutputChange(previousOutput, timeout = 30000, interval = 1000) {
    // Limpa polling anterior se existir
    if (pollTimer) {
      clearTimeout(pollTimer)
    }

    const start = Date.now()
    showTypingIndicator()

    // Função para verificar mudanças
    const checkForChanges = async () => {
      if (Date.now() - start > timeout) {
        hideTypingIndicator()
        return null
      }

      try {
        const newOutput = await fetchBaserowResponse()
        if (newOutput && newOutput !== previousOutput) {
          hideTypingIndicator()
          return newOutput
        }

        // Agenda próxima verificação
        pollTimer = setTimeout(async () => {
          const result = await checkForChanges()
          if (result && onOutputChange) {
            onOutputChange(result)
          }
        }, interval)

        return null
      } catch (error) {
        hideTypingIndicator()
        console.error("Erro durante polling:", error)
        return null
      }
    }

    // Variável para armazenar callback
    let onOutputChange = null

    // Retorna uma promise que será resolvida quando houver mudança
    return new Promise((resolve) => {
      onOutputChange = resolve
      checkForChanges().then((result) => {
        if (result) resolve(result)
      })
    })
  }

  // handleChatEvent: cria (POST) ou atualiza (PATCH) a linha no Baserow - otimizado
  async function handleChatEvent(action, chatInput) {
    if (!config.baserow || !config.baserow.apiUrl || !config.baserow.token) return

    const token = config.baserow.token
    const data = {
      sessionId: currentSessionId,
      action: action,
      chatInput: chatInput,
    }

    // Extract the table ID from the API URL
    const tableId = extractTableId(config.baserow.apiUrl)
    if (!tableId) {
      console.error("Não foi possível extrair o ID da tabela da URL da API")
      return
    }

    // Construir a URL base
    const baseUrl = config.baserow.apiUrl.split("/api/")[0]
    const baseEndpoint = `${baseUrl}/api/database/rows/table/${tableId}`

    try {
      let url, method

      if (action === "startConversation") {
        url = `${baseEndpoint}/?user_field_names=true`
        method = "POST"
      } else if (action === "sendMessage") {
        if (!baserowRowId) {
          throw new Error("Nenhuma linha criada para atualizar. Execute startConversation primeiro.")
        }
        url = `${baseEndpoint}/${baserowRowId}/?user_field_names=true`
        method = "PATCH"
      } else {
        throw new Error(`Ação desconhecida: ${action}`)
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${await response.text()}`)
      }

      const responseData = await response.json()

      if (action === "startConversation") {
        baserowRowId = responseData.id
      }

      return responseData
    } catch (error) {
      console.error(`Erro ao ${action === "startConversation" ? "criar" : "atualizar"} a linha:`, error)

      // Exibe mensagem de erro no chat
      const errorMessageDiv = document.createElement("div")
      errorMessageDiv.className = "chat-message bot"
      errorMessageDiv.textContent =
        action === "startConversation"
          ? "Desculpe, tivemos um problema ao iniciar a conversa. Tente novamente."
          : "Desculpe, tivemos um problema ao enviar sua mensagem. Tente novamente."
      messagesContainer.appendChild(errorMessageDiv)
      messagesContainer.scrollTop = messagesContainer.scrollHeight

      return null
    }
  }

  // Inicia nova conversa - otimizada
  async function startNewConversation() {
    try {
      currentSessionId = generateUUID()

      // Oculta a tela de boas-vindas
      const welcomeHeader = chatContainer.querySelector(".brand-header")
      const welcomeConversation = chatContainer.querySelector(".new-conversation")
      if (welcomeHeader) welcomeHeader.style.display = "none"
      if (welcomeConversation) welcomeConversation.style.display = "none"

      // Mostra interface do chat
      chatInterface.classList.add("active")

      // Cria a linha no Baserow
      if (config.baserow) {
        await handleChatEvent("startConversation", "")
      }

      // Captura valor antigo
      const previousOutput = await fetchBaserowResponse()

      // Polling p/ ver se o output muda - com timeout reduzido para melhor UX
      const updatedOutput = await pollForOutputChange(previousOutput, 10000, 1000)

      // Exibe a resposta final
      addMessageToChat("bot", updatedOutput || "Desculpe, não recebemos uma resposta. Tente novamente.")
    } catch (error) {
      console.error("Error starting conversation:", error)
      chatInterface.classList.add("active")
      addMessageToChat(
        "bot",
        "Desculpe, tivemos um problema ao iniciar a conversa. Por favor, tente novamente mais tarde.",
      )
    }
  }

  // Função auxiliar para adicionar mensagens ao chat
  function addMessageToChat(type, content) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `chat-message ${type}`
    messageDiv.innerHTML = type === "bot" ? linkifyText(content) : content
    messagesContainer.appendChild(messageDiv)

    // Usa requestAnimationFrame para scroll suave
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    })
  }

  // Envia mensagem - otimizada
  async function sendMessage(message) {
    if (!currentSessionId) {
      currentSessionId = generateUUID()
    }

    // Mostra msg do usuário
    addMessageToChat("user", linkifyText(message))

    // Valor antigo
    const previousOutput = await fetchBaserowResponse()

    // Atualiza a linha no Baserow
    if (config.baserow) {
      await handleChatEvent("sendMessage", message)
    }

    // Polling p/ ver se o output muda
    const updatedOutput = await pollForOutputChange(previousOutput, 10000, 1000)

    // Exibe a resposta final
    if (updatedOutput) {
      addMessageToChat("bot", updatedOutput)
    } else {
      addMessageToChat("bot", "Desculpe, não recebemos uma resposta. Tente novamente.")
    }
  }

  // Inicializa o widget
  init()
})()

