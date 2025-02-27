import React, { useRef, useState } from "react"
import { Upload, Info } from "lucide-react"

interface ChatInputProps {
  inputMessage: string
  setInputMessage: (message: string) => void
  sendMessage: (attachment?: string) => Promise<void>
  isLoading: boolean
  currentConversation: boolean
  uploadProgress: number
  onShowSourcesModal: () => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputMessage,
  setInputMessage,
  sendMessage,
  isLoading,
  currentConversation,
  uploadProgress,
  onShowSourcesModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const attachment = e.target?.result as string
        sendMessage(attachment)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
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
      <div className="input-group mb-2">
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
      <div className="d-flex justify-content-end">
        <button
          className="btn btn-sm btn-outline-secondary"
          type="button"
          onClick={onShowSourcesModal}
          disabled={!currentConversation}
          title="Voir les sources utilisées"
        >
          <Info size={14} className="me-1" />
          Sources
        </button>
      </div>
    </div>
  )
} 