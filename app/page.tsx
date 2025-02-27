"use client"

import { useState, useEffect } from "react"
import { Loader } from "lucide-react"
import { useAgents } from "./AgentContext"
import { FeedbackModal } from "./components/FeedbackModal"
import { ChatMessage } from "./components/ChatMessage"
import { ConversationSidebar } from "./components/ConversationSidebar"
import { ChatInput } from "./components/ChatInput"
import { ParametersPanel } from "./components/ParametersPanel"
import { SourcesModal } from "./components/SourcesModal"
import { useChat } from "./hooks/useChat"
import "./styles/chat.css"

export default function Chatbot() {
  const { agents } = useAgents()
  const [temperature, setTemperature] = useState(0.2)
  const [numDocs, setNumDocs] = useState(5)
  const [isClient, setIsClient] = useState(false)
  
  const {
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
    startNewConversation,
    deleteConversation,
    deleteAllConversations,
    sendMessage,
    handleVote,
    handleFeedbackSubmit,
  } = useChat()

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
  }, [showToast, isClient, setShowToast])

  useEffect(() => {
    const defaultAgent = agents.find((agent) => agent.name === "Assistant Général")
    if (defaultAgent) {
      setSelectedAgent(defaultAgent)
    }
  }, [agents, setSelectedAgent])

  const handleSelectAgent = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId) || null
    setSelectedAgent(agent)
  }

  return (
    <div className="d-flex flex-column vh-100">
      <div className="flex-grow-1 d-flex">
        <ConversationSidebar
          conversations={conversations}
          selectedAgent={selectedAgent}
          activeAgents={activeAgents}
          currentConversation={currentConversation}
          isDeleting={isDeleting}
          onSelectConversation={setCurrentConversation}
          onDeleteConversation={deleteConversation}
          onStartNewConversation={startNewConversation}
          onSelectAgent={handleSelectAgent}
        />

        <main className="flex-grow-1 d-flex flex-column">
          <div className="flex-grow-1 p-4 chat-container">
            {currentConversation ? (
              currentConversation.messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onVote={handleVote} 
                />
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
          
          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            sendMessage={sendMessage}
            isLoading={isLoading}
            currentConversation={!!currentConversation}
            uploadProgress={uploadProgress}
            onShowSourcesModal={() => setShowSourcesModal(true)}
          />
        </main>

        <ParametersPanel
          selectedAgent={selectedAgent}
          temperature={temperature}
          setTemperature={setTemperature}
          numDocs={numDocs}
          setNumDocs={setNumDocs}
          onDeleteAllConversations={deleteAllConversations}
        />
      </div>

      <footer className="bg-dark text-light py-3">
        <div className="container text-center">
          <p>&copy; 2024 Orange Business - Digital Services France</p>
        </div>
      </footer>

      <div className="toast-container position-fixed top-0 end-0 p-3">
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
        vote={currentConversation?.messages.find(m => m.vote)?.vote || "up"}
      />

      {backendStatus === "offline" && (
        <div className="alert alert-danger m-2" role="alert">
          Le backend n'est pas disponible. Certaines fonctionnalités peuvent ne pas fonctionner correctement.
        </div>
      )}

      <SourcesModal
        isOpen={showSourcesModal}
        onClose={() => setShowSourcesModal(false)}
        conversation={currentConversation}
      />
    </div>
  )
}

