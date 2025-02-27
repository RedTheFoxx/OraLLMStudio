import React from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import type { ExtraProps, Message } from "../types"

interface ChatMessageProps {
  message: Message
  onVote: (messageId: string, vote: "up" | "down") => void
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onVote }) => {
  return (
    <div className={`mb-3 ${message.role === "user" ? "text-end" : "text-start"} slide-in`}>
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
              code({ node, className, children, ...props }: JSX.IntrinsicElements["code"] & ExtraProps) {
                const match = /language-(\w+)/.exec(className || "")
                return match ? (
                  <SyntaxHighlighter 
                    style={tomorrow} 
                    language={match[1]} 
                    PreTag="div"
                  >
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
              onClick={() => onVote(message.id, "up")}
              aria-label="Pouce en l'air"
            >
              <ThumbsUp size={16} />
            </button>
            <button
              className={`btn btn-sm btn-outline-secondary ${message.vote === "down" ? "active" : ""}`}
              onClick={() => onVote(message.id, "down")}
              aria-label="Pouce en bas"
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 