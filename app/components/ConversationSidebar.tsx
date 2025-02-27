import React, { useState } from "react"
import { Trash2, MessageSquare, Plus } from "lucide-react"
import type { Conversation } from "../types"
import type { Agent } from "../AgentContext"

interface ConversationSidebarProps {
  conversations: Conversation[]
  selectedAgent: Agent | null
  activeAgents: Agent[]
  currentConversation: Conversation | null
  isDeleting: boolean
  onSelectConversation: (conversation: Conversation) => void
  onDeleteConversation: (id: string) => void
  onStartNewConversation: () => void
  onSelectAgent: (agentId: string) => void
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  selectedAgent,
  activeAgents,
  currentConversation,
  isDeleting,
  onSelectConversation,
  onDeleteConversation,
  onStartNewConversation,
  onSelectAgent,
}) => {
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const startTitleEdit = (conv: Conversation) => {
    setEditingTitleId(conv.id)
    setEditingTitle(conv.title)
  }

  const saveTitleEdit = () => {
    if (!editingTitleId) return
    // Notify parent component about title change
    const updatedConversation = conversations.find(conv => conv.id === editingTitleId)
    if (updatedConversation) {
      const updated = { ...updatedConversation, title: editingTitle || updatedConversation.title }
      onSelectConversation(updated)
    }
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

  return (
    <aside className="bg-light border-end sidebar" style={{ width: "300px" }}>
      <div className="p-3 d-flex flex-column" style={{ height: "100%" }}>
        <select
          className="form-select mb-3"
          value={selectedAgent?.id || ""}
          onChange={(e) => onSelectAgent(e.target.value)}
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
          onClick={onStartNewConversation}
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
              onClick={() => !editingTitleId && onSelectConversation(conv)}
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
                  onDeleteConversation(conv.id)
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
} 