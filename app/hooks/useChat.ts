import { useState, useEffect } from "react"
import type { Conversation, Message, Feedback } from "../types"
import type { Agent } from "../AgentContext"
import { sendChatMessage, processStreamingResponse, checkBackendHealth } from "../api/chatClient"

export const useChat = () => {
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
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const [showSourcesModal, setShowSourcesModal] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [currentVote, setCurrentVote] = useState<"up" | "down" | null>(null)
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null)

  useEffect(() => {
    // Check backend health when component mounts
    const checkBackend = async () => {
      try {
        const isHealthy = await checkBackendHealth()
        setBackendStatus(isHealthy ? "online" : "offline")
      } catch (error) {
        console.error("Error checking backend health:", error)
        setBackendStatus("offline")
      }
    }
    
    checkBackend()
  }, [])

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

  const sendMessage = async (attachment?: string) => {
    if (!currentConversation) return
    if (!inputMessage.trim() && !attachment) return
    if (backendStatus === "offline") {
      setToastMessage("Le backend n'est pas disponible. Veuillez réessayer plus tard.")
      setToastType("danger")
      setShowToast(true)
      return
    }

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

    // Add empty assistant message that will be filled with streaming response
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "",
    }
    
    setCurrentConversation((prev) => {
      if (!prev) return prev
      return { ...prev, messages: [...prev.messages, assistantMessage] }
    })

    try {
      // Get the current agent
      const agent = selectedAgent
      
      if (!agent) {
        throw new Error("No agent selected")
      }
      
      // Send message to backend
      const response = await sendChatMessage(
        updatedConversation.messages,
        agent,
        0.2, // Default temperature
        true // Use streaming by default
      )
      
      if (response instanceof ReadableStream) {
        // Handle streaming response
        await processStreamingResponse(
          response,
          (content) => {
            // Update the assistant's message with each chunk
            setCurrentConversation((prev) => {
              if (!prev) return prev
              const lastMessage = prev.messages[prev.messages.length - 1]
              if (lastMessage.role === "assistant") {
                const updatedMessages = [
                  ...prev.messages.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + content,
                  },
                ]
                return { ...prev, messages: updatedMessages }
              }
              return prev
            })
          },
          () => {
            // Streaming complete
            setIsLoading(false)
          },
          (error) => {
            console.error("Error in streaming response:", error)
            setToastMessage("Erreur lors de la réception de la réponse.")
            setToastType("danger")
            setShowToast(true)
            setIsLoading(false)
          }
        )
      } else {
        // Handle non-streaming response
        setCurrentConversation((prev) => {
          if (!prev) return prev
          const lastMessage = prev.messages[prev.messages.length - 1]
          if (lastMessage.role === "assistant") {
            const updatedMessages = [
              ...prev.messages.slice(0, -1),
              {
                ...lastMessage,
                content: response.message,
              },
            ]
            return { ...prev, messages: updatedMessages }
          }
          return prev
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setToastMessage("Erreur lors de l'envoi du message.")
      setToastType("danger")
      setShowToast(true)
      setIsLoading(false)
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

  const selectAgent = (agentId: string, agents: Agent[]) => {
    const agent = agents.find((a) => a.id === agentId) || null
    setSelectedAgent(agent)
    if (agent) {
      const defaultConversation = createDefaultConversation(agent)
      setConversations([defaultConversation])
      setCurrentConversation(defaultConversation)
    } else {
      setCurrentConversation(null)
    }
  }

  return {
    conversations,
    currentConversation,
    setCurrentConversation,
    inputMessage,
    setInputMessage,
    isDeleting,
    selectedAgent,
    setSelectedAgent,
    isLoading,
    uploadProgress,
    setUploadProgress,
    showToast,
    setShowToast,
    toastMessage,
    toastType,
    backendStatus,
    showSourcesModal,
    setShowSourcesModal,
    feedbackModalOpen,
    setFeedbackModalOpen,
    currentVote,
    currentMessageId,
    startNewConversation,
    deleteConversation,
    deleteAllConversations,
    sendMessage,
    handleVote,
    handleFeedbackSubmit,
    selectAgent,
    createDefaultConversation,
  }
} 