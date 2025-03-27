// Chat Widget Script
;(() => {
  // 1. Criação e injeção dos estilos (igual ao seu código original + indicador de digitação no final)
  const styles = `
        .chat-widget {
            --chat--color-primary: var(--chat-primary-color, #854fff);
            --chat--color-secondary: var(--chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--chat-background-color, #ffffff);
            --chat--color-font: var(--chat-font-color, #333333);
            font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
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

        .chat-widget .chat-container.position-left {
            right: auto;
            left: 20px;
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
            right: 20px;
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

        .chat-widget .chat-toggle.position-left {
            right: auto;
            left: 20px;
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

        /* ========== 3 PONTINHOS ANIMADOS (INDICADOR DE DIGITAÇÃO) ========== */
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

        /* Estilo para links nos mensagens */
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
        }
    `

  // Carrega a fonte Geist
  const fontLink = document.createElement("link")
  fontLink.rel = "stylesheet"
  fontLink.href = "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css"
  document.head.appendChild(fontLink)

  // Injeta estilos
  const styleSheet = document.createElement("style")
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)

  // Configuração padrão
  const defaultConfig = {
    webhook: {
      url: "",
      route: "",
    },
    branding: {
      logo: "",
      name: "",
      welcomeText: "",
      responseTimeText: "",
      poweredBy: {
        text: "Powered by ChatWidget",
        link: "#",
      },
    },
    style: {
      primaryColor: "",
      secondaryColor: "",
      position: "right",
      backgroundColor: "#ffffff",
      fontColor: "#333333",
    },
    baserow: null,
  }

  // Merge user config com defaults
  const config = window.ChatWidgetConfig
    ? {
        webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
        branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
        style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style },
        baserow: window.ChatWidgetConfig.baserow || null,
      }
    : defaultConfig

  // Evita duplicar inicialização
  if (window.ChatWidgetInitialized) return
  window.ChatWidgetInitialized = true

  // Variáveis globais
  let currentSessionId = ""
  let baserowRowId = null

  // Cria o container do widget
  const widgetContainer = document.createElement("div")
  widgetContainer.className = "chat-widget"

  // Corrige as variáveis CSS para corresponder ao seu design
  widgetContainer.style.setProperty("--chat--color-primary", config.style.primaryColor || "#854fff")
  widgetContainer.style.setProperty("--chat--color-secondary", config.style.secondaryColor || "#6b3fd4")
  widgetContainer.style.setProperty("--chat--color-background", config.style.backgroundColor || "#ffffff")
  widgetContainer.style.setProperty("--chat--color-font", config.style.fontColor || "#333333")

  const chatContainer = document.createElement("div")
  chatContainer.className = `chat-container${config.style.position === "left" ? " position-left" : ""}`

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
        </div>
    `

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
                <a href="${config.branding.poweredBy.link}" target="_blank">${config.branding.poweredBy.text}</a>
            </div>
        </div>
    `

  chatContainer.innerHTML = newConversationHTML + chatInterfaceHTML

  // Botão flutuante (circulo)
  const toggleButton = document.createElement("button")
  toggleButton.className = `chat-toggle${config.style.position === "left" ? " position-left" : ""}`
  toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.476 0-2.886-.313-4.156-.878l-3.156.586.586-3.156A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>`

  // Anexa ao documento
  widgetContainer.appendChild(chatContainer)
  widgetContainer.appendChild(toggleButton)
  document.body.appendChild(widgetContainer)

  // Referências
  const newChatBtn = chatContainer.querySelector(".new-chat-btn")
  const chatInterface = chatContainer.querySelector(".chat-interface")
  const messagesContainer = chatContainer.querySelector(".chat-messages")
  const textarea = chatContainer.querySelector("textarea")
  const sendButton = chatContainer.querySelector('button[type="submit"]')

  // Função para converter URLs em links clicáveis
  function linkifyText(text) {
    // Regex para detectar links HTTP/HTTPS
    const urlRegex = /(https?:\/\/[^\s]+)/g

    // Substitui as URLs encontradas por links HTML com texto "Link"
    return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">Checkout PersonCare</a>`)
  }

  // Função para exibir indicador de digitação
  function showTypingIndicator() {
    const typingIndicator = document.createElement("div")
    typingIndicator.className = "chat-message bot typing-indicator"
    typingIndicator.innerHTML = `
            <div class="typing-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        `
    messagesContainer.appendChild(typingIndicator)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    return typingIndicator
  }

  // Função para remover indicador de digitação
  function hideTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator)
    }
  }

  // Gera UUID
  function generateUUID() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0
          const v = c === "x" ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
  }

  // Busca o campo output no Baserow
  async function fetchBaserowResponse() {
    if (!config.baserow || !config.baserow.apiUrl || !config.baserow.token || !baserowRowId) return null

    // Extract the table ID from the API URL
    const tableIdMatch = config.baserow.apiUrl.match(/\/table\/(\d+)/)
    const tableId = tableIdMatch ? tableIdMatch[1] : null

    if (!tableId) {
      console.error("Não foi possível extrair o ID da tabela da URL da API")
      return null
    }

    // Construir a URL correta para a nova instância do Baserow
    const baseUrl = config.baserow.apiUrl.split("/api/")[0]
    const url = `${baseUrl}/api/database/rows/table/${tableId}/${baserowRowId}/?user_field_names=true`

    try {
      console.log("Buscando resposta do Baserow:", url)
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${config.baserow.token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erro na resposta do Baserow:", response.status, errorText)
        return null
      }

      const data = await response.json()
      return data.output
    } catch (e) {
      console.error("Erro ao buscar resposta do Baserow:", e)
      return null
    }
  }

  // Polling: aguarda o output mudar, exibindo pontinhos
  async function pollForOutputChange(previousOutput, timeout = 30000, interval = 1000) {
    const start = Date.now()
    // Mostra indicador
    const typingIndicator = showTypingIndicator()
    let finalOutput = null
    try {
      while (Date.now() - start < timeout) {
        const newOutput = await fetchBaserowResponse()
        if (newOutput && newOutput !== previousOutput) {
          finalOutput = newOutput
          break
        }
        await new Promise((resolve) => setTimeout(resolve, interval))
      }
    } finally {
      // Remove indicador independente de sucesso ou timeout
      hideTypingIndicator(typingIndicator)
    }
    return finalOutput
  }

  // handleChatEvent: cria (POST) ou atualiza (PATCH) a linha no Baserow
  async function handleChatEvent(action, chatInput) {
    if (!config.baserow || !config.baserow.apiUrl || !config.baserow.token) return
    const token = config.baserow.token
    const data = {
      sessionId: currentSessionId,
      action: action,
      chatInput: chatInput,
    }

    // Extract the table ID from the API URL
    const tableIdMatch = config.baserow.apiUrl.match(/\/table\/(\d+)/)
    const tableId = tableIdMatch ? tableIdMatch[1] : null

    if (!tableId) {
      console.error("Não foi possível extrair o ID da tabela da URL da API")
      return
    }

    // Construir a URL base correta para a nova instância do Baserow
    const baseUrl = config.baserow.apiUrl.split("/api/")[0]

    // Construct the proper API URLs for Baserow
    const createRowUrl = `${baseUrl}/api/database/rows/table/${tableId}/?user_field_names=true`

    if (action === "startConversation") {
      try {
        console.log("Criando nova conversa no Baserow:", createRowUrl)
        const response = await fetch(createRowUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Erro na resposta do Baserow:", response.status, errorText)
          throw new Error(`Erro ${response.status}: ${errorText}`)
        }

        const responseData = await response.json()
        baserowRowId = responseData.id
        console.log("Conversa criada com sucesso, ID:", baserowRowId)
        return responseData
      } catch (e) {
        console.error("Erro ao criar a linha:", e)
        const errorMessageDiv = document.createElement("div")
        errorMessageDiv.className = "chat-message bot"
        errorMessageDiv.textContent = "Desculpe, tivemos um problema ao iniciar a conversa. Tente novamente."
        messagesContainer.appendChild(errorMessageDiv)
      }
    } else if (action === "sendMessage") {
      if (!baserowRowId) {
        console.error("Nenhuma linha criada para atualizar. Execute startConversation primeiro.")
        const errorMessageDiv = document.createElement("div")
        errorMessageDiv.className = "chat-message bot"
        errorMessageDiv.textContent = "Erro: Inicie a conversa antes de enviar mensagens."
        messagesContainer.appendChild(errorMessageDiv)
        return
      }

      const updateRowUrl = `${baseUrl}/api/database/rows/table/${tableId}/${baserowRowId}/?user_field_names=true`

      try {
        console.log("Enviando mensagem para o Baserow:", updateRowUrl)
        const response = await fetch(updateRowUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Erro na resposta do Baserow:", response.status, errorText)
          throw new Error(`Erro ${response.status}: ${errorText}`)
        }

        return await response.json()
      } catch (e) {
        console.error("Erro ao atualizar a linha:", e)
        const errorMessageDiv = document.createElement("div")
        errorMessageDiv.className = "chat-message bot"
        errorMessageDiv.textContent = "Desculpe, tivemos um problema ao enviar sua mensagem. Tente novamente."
        messagesContainer.appendChild(errorMessageDiv)
      }
    }
  }

  // Inicia nova conversa
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

      // Polling p/ ver se o output muda
      const updatedOutput = await pollForOutputChange(previousOutput, 10000, 1000)

      // Exibe a resposta final
      const botMessageDiv = document.createElement("div")
      botMessageDiv.className = "chat-message bot"
      botMessageDiv.innerHTML = updatedOutput
        ? linkifyText(updatedOutput)
        : "Desculpe, não recebemos uma resposta. Tente novamente."
      messagesContainer.appendChild(botMessageDiv)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    } catch (error) {
      console.error("Error starting conversation:", error)
      chatInterface.classList.add("active")
      const errorMessageDiv = document.createElement("div")
      errorMessageDiv.className = "chat-message bot"
      errorMessageDiv.textContent =
        "Desculpe, tivemos um problema ao iniciar a conversa. Por favor, tente novamente mais tarde."
      messagesContainer.appendChild(errorMessageDiv)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  // Envia mensagem
  async function sendMessage(message) {
    if (!currentSessionId) {
      currentSessionId = generateUUID()
    }

    // Mostra msg do usuário
    const userMessageDiv = document.createElement("div")
    userMessageDiv.className = "chat-message user"
    userMessageDiv.innerHTML = linkifyText(message)
    messagesContainer.appendChild(userMessageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    // Valor antigo
    const previousOutput = await fetchBaserowResponse()

    // Atualiza a linha no Baserow
    if (config.baserow) {
      await handleChatEvent("sendMessage", message)
    }

    // Polling p/ ver se o output muda
    const updatedOutput = await pollForOutputChange(previousOutput, 10000, 1000)

    // Exibe a resposta final
    const botMessageDiv = document.createElement("div")
    botMessageDiv.className = "chat-message bot"
    botMessageDiv.innerHTML = updatedOutput
      ? linkifyText(updatedOutput)
      : "Desculpe, não recebemos uma resposta. Tente novamente."
    messagesContainer.appendChild(botMessageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  // Botão flutuante (abre/fecha chat)
  toggleButton.addEventListener("click", () => {
    chatContainer.classList.toggle("open")
  })

  // "Send us a message"
  newChatBtn.addEventListener("click", startNewConversation)

  // Botão "Send"
  sendButton.addEventListener("click", () => {
    const message = textarea.value.trim()
    if (message) {
      sendMessage(message)
      textarea.value = ""
    }
  })

  // Enter envia mensagem
  textarea.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const message = textarea.value.trim()
      if (message) {
        sendMessage(message)
        textarea.value = ""
      }
    }
  })

  // Fecha chat no "×"
  const closeButtons = chatContainer.querySelectorAll(".close-button")
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      chatContainer.classList.remove("open")
    })
  })
})()

