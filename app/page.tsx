"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Trash2, Upload, MessageSquare, Plus, Loader, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useAgents } from "./AgentContext"
import { FeedbackModal } from "./components/FeedbackModal"
import type { Agent } from "./AgentContext"
import type { Feedback } from "./types"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  attachment?: string
  vote?: "up" | "down" | null
}

type Conversation = {
  id: string
  title: string
  messages: Message[]
  agentId: string
  createdAt: Date
  feedback: Feedback[]
}

type Feedback = {
  messageId: string
  vote: "up" | "down"
  reason: string
  voterName: string
}

export default function Chatbot() {
  const { agents } = useAgents()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "danger">("success")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLLMParams, setShowLLMParams] = useState(false)
  const [temperature, setTemperature] = useState(0.2)
  const [numDocs, setNumDocs] = useState(5)
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [currentVote, setCurrentVote] = useState<"up" | "down" | null>(null)
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  const activeAgents = agents.filter((agent) => agent.active)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && isClient) {
      const toastEl = document.getElementById("chatToast")
      if (toastEl) {
        import("boosted").then(({ Toast }) => {
          const toast = new Toast(toastEl)
          if (showToast) {
            toast.show()
            setTimeout(() => {
              toast.hide()
              setShowToast(false)
            }, 5000)
          } else {
            toast.hide()
          }
        })
      }
    }
  }, [showToast, isClient])

  const createDefaultConversation = (agent: Agent): Conversation => {
    return {
      id: Date.now().toString(),
      title: "Nouvelle conversation",
      messages: [],
      agentId: agent.id,
      createdAt: new Date(),
      feedback: [],
    }
  }

  useEffect(() => {
    const defaultAgent = agents.find((agent) => agent.name === "Assistant Général")
    if (defaultAgent) {
      setSelectedAgent(defaultAgent)
      const defaultConversation = createDefaultConversation(defaultAgent)
      setConversations([defaultConversation])
      setCurrentConversation(defaultConversation)
    }
  }, [agents])

  const startNewConversation = () => {
    if (!selectedAgent) return
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `Nouvelle Conv. ${conversations.length + 1}`,
      messages: [],
      agentId: selectedAgent.id,
      createdAt: new Date(),
      feedback: [],
    }
    setConversations([newConversation, ...conversations])
    setCurrentConversation(newConversation)
    setToastMessage("Nouvelle conversation commencée !")
    setToastType("success")
    setShowToast(true)
  }

  const deleteConversation = (id: string) => {
    setIsDeleting(true)
    setTimeout(() => {
      const updatedConversations = conversations.filter((conv) => conv.id !== id)
      setConversations(updatedConversations)
      if (currentConversation?.id === id) {
        setCurrentConversation(updatedConversations[0] || null)
      }
      setIsDeleting(false)
      setToastMessage("Conversation supprimée avec succès !")
      setToastType("success")
      setShowToast(true)
    }, 300)
  }

  const simulateStreamingResponse = async (message: string) => {
    const words = message.split(" ")
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      setCurrentConversation((prev) => {
        if (!prev) return prev
        const lastMessage = prev.messages[prev.messages.length - 1]
        if (lastMessage.role === "assistant") {
          const updatedMessages = [
            ...prev.messages.slice(0, -1),
            {
              ...lastMessage,
              content: lastMessage.content + " " + words[i],
            },
          ]
          return { ...prev, messages: updatedMessages }
        }
        return prev
      })
    }
  }

  const sendMessage = async (attachment?: string) => {
    if (!currentConversation) return
    if (!inputMessage.trim() && !attachment) return

    setIsLoading(true)

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      attachment,
    }

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, newMessage],
    }

    setCurrentConversation(updatedConversation)
    setConversations(conversations.map((conv) => (conv.id === updatedConversation.id ? updatedConversation : conv)))

    setInputMessage("")

    // Simulate streaming response
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "",
    }
    setCurrentConversation((prev) => {
      if (!prev) return prev
      return { ...prev, messages: [...prev.messages, assistantMessage] }
    })

    let responseContent = ""
    if (selectedAgent?.name === "Assistant Général") {
      responseContent = `En tant qu'assistant utile, je suis là pour vous aider avec toutes vos questions ou tâches. Comment puis-je vous aider aujourd'hui ?`
    } else if (selectedAgent?.name === "Expert en Code") {
      responseContent = `En tant qu'expert en codage, je peux vous aider avec des questions de programmation, des revues de code et des meilleures pratiques. Quel sujet de codage spécifique souhaitez-vous aborder ?`
    } else if (selectedAgent?.name === "Analyste de Données") {
      responseContent = `En tant qu'analyste de données, je peux vous aider avec l'analyse de données, la visualisation et les concepts statistiques. Quelle question liée aux données avez-vous ?`
    } else {
      responseContent = `Vous avez dit : ${inputMessage}. Voici une réponse simulée en streaming pour démontrer l'effet.`
    }

    await simulateStreamingResponse(responseContent)
    setIsLoading(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentConversation) return
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const attachment = e.target?.result as string
        sendMessage(attachment)
      }
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setUploadProgress(progress)
        }
      }
      reader.onloadend = () => {
        setUploadProgress(0)
      }
      reader.readAsDataURL(file)
    }
  }

  const startTitleEdit = (conv: Conversation) => {
    setEditingTitleId(conv.id)
    setEditingTitle(conv.title)
  }

  const saveTitleEdit = () => {
    if (!editingTitleId) return
    setConversations(
      conversations.map((conv) => (conv.id === editingTitleId ? { ...conv, title: editingTitle || conv.title } : conv)),
    )
    setEditingTitleId(null)
    setEditingTitle("")
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveTitleEdit()
    } else if (e.key === "Escape") {
      setEditingTitleId(null)
      setEditingTitle("")
    }
  }

  const deleteAllConversations = () => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      if (
        window.confirm("Êtes-vous sûr de vouloir supprimer toutes les conversations ? Cette action est irréversible.")
      ) {
        setConversations([])
        setCurrentConversation(null)
        setToastMessage("Toutes les conversations ont été supprimées.")
        setToastType("success")
        setShowToast(true)
      }
    }
  }

  const handleVote = (messageId: string, vote: "up" | "down") => {
    setCurrentMessageId(messageId)
    setCurrentVote(vote)
    setFeedbackModalOpen(true)
  }

  const handleFeedbackSubmit = (feedback: { reason: string; voterName: string }) => {
    if (currentConversation && currentMessageId && currentVote) {
      const newFeedback: Feedback = {
        messageId: currentMessageId,
        vote: currentVote,
        reason: feedback.reason,
        voterName: feedback.voterName,
      }
      const updatedConversation = {
        ...currentConversation,
        feedback: [...currentConversation.feedback, newFeedback],
        messages: currentConversation.messages.map((msg) =>
          msg.id === currentMessageId ? { ...msg, vote: currentVote } : msg,
        ),
      }
      setCurrentConversation(updatedConversation)
      setConversations(conversations.map((conv) => (conv.id === updatedConversation.id ? updatedConversation : conv)))
      setFeedbackModalOpen(false)
      setCurrentVote(null)
      setCurrentMessageId(null)
      setToastMessage("Merci pour votre feedback !")
      setToastType("success")
      setShowToast(true)
    }
  }

  return (
    <div className="d-flex flex-column vh-100">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        .slide-in {
          animation: slideIn 0.3s ease-in-out;
        }
        .delete-animation {
          transition: all 0.3s ease-in-out;
        }
        .delete-animation.deleting {
          opacity: 0;
          transform: translateX(-20px);
        }
        .conversation-list {
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }
        .conversation-item {
          transition: all 0.2s ease-in-out;
        }
        .conversation-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .conversation-item.active {
          background-color: #ff7900;
          color: white;
        }
        .file-upload-button {
          transition: all 0.2s ease-in-out;
        }
        .file-upload-button:hover {
          transform: scale(1.05);
        }
        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .markdown-content {
          font-size: 0.9rem;
        }
        .markdown-content p {
          margin-bottom: 0.5rem;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content ul, .markdown-content ol {
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
        }
        .markdown-content pre {
          margin-bottom: 0.5rem;
        }
        .chat-container {
          height: calc(100vh - 200px);
          overflow-y: auto;
        }
        .llm-params {
          font-size: 0.8rem;
          border: 1px solid #000000;
          border-radius: 0.375rem;
          padding: 1rem;
        }
        .llm-params .form-range {
          width: 100%;
        }
        .llm-params .quantity-selector {
          display: inline-flex;
          align-items: stretch;
        }
        .quantity-selector input[type="number"] {
          text-align: center;
          -moz-appearance: textfield;
        }
        .quantity-selector input[type="number"]::-webkit-outer-spin-button,
        .quantity-selector input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .quantity-selector .btn-icon {
          padding: 0.25rem 0.5rem;
        }
        .conversation-title {
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          margin: -2px -4px;
        }
        .conversation-title:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .conversation-title-input {
          background: transparent;
          border: none;
          outline: none;
          color: inherit;
          width: 100%;
          padding: 0;
          margin: 0;
          font-size: inherit;
        }
        .conversation-title-input:focus {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

      <div className="flex-grow-1 d-flex">
        <aside className="bg-light border-end sidebar" style={{ width: "300px" }}>
          <div className="p-3 d-flex flex-column" style={{ height: "100%" }}>
            <select
              className="form-select mb-3"
              value={selectedAgent?.id || ""}
              onChange={(e) => {
                const agent = activeAgents.find((agent) => agent.id === e.target.value) || null
                setSelectedAgent(agent)
                setCurrentConversation(null)
              }}
            >
              <option value="">Sélectionnez un agent</option>
              {activeAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center"
              onClick={startNewConversation}
              disabled={!selectedAgent}
            >
              <Plus size={18} className="me-2" />
              Nouvelle Conv.
            </button>
            <div className="conversation-list">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item p-2 rounded mb-2 d-flex align-items-center justify-content-between ${
                    currentConversation?.id === conv.id ? "active" : ""
                  } ${isDeleting && conv.id === currentConversation?.id ? "delete-animation deleting" : ""}`}
                  onClick={() => !editingTitleId && setCurrentConversation(conv)}
                >
                  <div className="d-flex align-items-center flex-grow-1 me-2">
                    <MessageSquare size={18} className="me-2" />
                    <div className="min-w-0">
                      {editingTitleId === conv.id ? (
                        <input
                          type="text"
                          className="conversation-title-input"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={handleTitleKeyPress}
                          onBlur={saveTitleEdit}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div
                          className="conversation-title text-truncate"
                          onClick={(e) => {
                            e.stopPropagation()
                            startTitleEdit(conv)
                          }}
                        >
                          {conv.title}
                        </div>
                      )}
                      <div className="text-black" style={{ fontSize: "0.75rem" }}>
                        {conv.createdAt.toLocaleDateString()}{" "}
                        {conv.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-link text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-grow-1 d-flex flex-column">
          <div className="flex-grow-1 p-4 chat-container">
            {currentConversation ? (
              currentConversation.messages.map((message, index) => (
                <div key={index} className={`mb-3 ${message.role === "user" ? "text-end" : "text-start"} slide-in`}>
                  <div
                    className={`d-inline-block p-2 rounded-3 ${
                      message.role === "user" ? "bg-primary text-white" : "bg-light"
                    }`}
                  >
                    {message.attachment && (
                      <div className="mb-2">
                        <img
                          src={message.attachment || "/placeholder.svg"}
                          alt="Fichier téléchargé"
                          style={{ maxWidth: "200px", maxHeight: "200px" }}
                        />
                      </div>
                    )}
                    <div className="markdown-content">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "")
                            return !inline && match ? (
                              <SyntaxHighlighter style={tomorrow} language={match[1]} PreTag="div" {...props}>
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            )
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {message.role === "assistant" && (
                      <div className="mt-2 d-flex justify-content-end">
                        <button
                          className={`btn btn-sm btn-outline-secondary me-2 ${message.vote === "up" ? "active" : ""}`}
                          onClick={() => handleVote(message.id, "up")}
                          aria-label="Pouce en l'air"
                        >
                          <ThumbsUp size={16} />
                        </button>
                        <button
                          className={`btn btn-sm btn-outline-secondary ${message.vote === "down" ? "active" : ""}`}
                          onClick={() => handleVote(message.id, "down")}
                          aria-label="Pouce en bas"
                        >
                          <ThumbsDown size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center mt-5 fade-in">
                <p>
                  Sélectionnez un agent et commencez une nouvelle conversation ou sélectionnez une conversation
                  existante.
                </p>
              </div>
            )}
            {isLoading && (
              <div className="text-center mt-3">
                <Loader className="animate-spin" size={24} />
              </div>
            )}
          </div>
          <div className="p-3 border-top" style={{ paddingBottom: "1.5rem" }}>
            {uploadProgress > 0 && (
              <div className="progress mb-3">
                <div
                  className="progress-bar bg-orange"
                  role="progressbar"
                  style={{ width: `${uploadProgress}%` }}
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {uploadProgress.toFixed(0)}%
                </div>
              </div>
            )}
            <div className="input-group mb-3">
              <button
                className="btn btn-outline-secondary file-upload-button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!currentConversation || isLoading}
              >
                <Upload size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                onChange={handleFileUpload}
                disabled={!currentConversation || isLoading}
              />
              <input
                type="text"
                className="form-control"
                placeholder={
                  currentConversation
                    ? "Tapez votre message..."
                    : "Sélectionnez un agent ou commencez une nouvelle conversation"
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={!currentConversation || isLoading}
              />
              <button
                className="btn btn-primary"
                onClick={() => sendMessage()}
                disabled={!currentConversation || isLoading}
              >
                Envoyer
              </button>
            </div>
          </div>
        </main>

        <aside className="bg-light border-start" style={{ width: "250px" }}>
          <div className="p-3 d-flex flex-column h-100">
            <h5 className="mb-3">Exemples</h5>
            {selectedAgent ? (
              <ul className="list-group mb-3">
                {selectedAgent.examplePrompts.map((prompt, index) => (
                  <li
                    key={index}
                    className="list-group-item list-group-item-action fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setInputMessage(prompt)}
                  >
                    {prompt}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Sélectionnez un agent pour voir les invites prédéfinies.</p>
            )}
            <div className="mt-auto">
              <button
                className="btn btn-secondary btn-sm d-flex align-items-center w-100 mb-2"
                onClick={() => setShowLLMParams(!showLLMParams)}
              >
                {showLLMParams ? <ChevronUp size={18} className="me-2" /> : <ChevronDown size={18} className="me-2" />}
                Paramètres
              </button>
              {showLLMParams && (
                <div className="llm-params">
                  <div className="mb-2">
                    <label htmlFor="temperature" className="form-label">
                      Température : {temperature}
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      id="temperature"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="numDocs" className="form-label">
                      Nombre de Documents : {numDocs}
                    </label>
                    <div className="quantity-selector quantity-selector-sm">
                      <input
                        type="number"
                        id="numDocs"
                        className="form-control"
                        aria-live="polite"
                        data-bs-step="counter"
                        name="quantity"
                        title="quantité"
                        value={numDocs}
                        min="1"
                        max="8"
                        step="1"
                        data-bs-round="0"
                        aria-label="Sélecteur du nombre de documents"
                        onChange={(e) => setNumDocs(Math.max(1, Math.min(8, Number.parseInt(e.target.value) || 1)))}
                      />
                      <button
                        type="button"
                        className="btn btn-icon btn-outline-secondary btn-sm"
                        aria-describedby="numDocs"
                        data-bs-step="down"
                        onClick={() => setNumDocs(Math.max(1, numDocs - 1))}
                      >
                        <span className="visually-hidden">Diminuer</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-outline-secondary btn-sm"
                        aria-describedby="numDocs"
                        data-bs-step="up"
                        onClick={() => setNumDocs(Math.min(8, numDocs + 1))}
                      >
                        <span className="visually-hidden">Augmenter</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button className="btn btn-danger btn-sm w-100" onClick={deleteAllConversations}>
                      Supprimer toutes les conversations
                    </button>
                  </div>
                </div>
              )}
              <Link href="/agents-studio" className="btn btn-link btn-sm d-flex align-items-center w-100 mt-3">
                Gérer les agents
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <footer className="bg-dark text-light py-3">
        <div className="container text-center">
          <p>&copy; 2024 Orange Business - Digital Services France</p>
        </div>
      </footer>

      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div
          id="chatToast"
          className={`toast align-items-center text-white bg-${toastType} border-0`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">{toastMessage}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Fermer"
            ></button>
          </div>
        </div>
      </div>
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        vote={currentVote || "up"}
      />
    </div>
  )
}

