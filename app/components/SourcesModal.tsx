import React from "react"
import type { Conversation } from "../types"

interface SourcesModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation | null
}

export const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose, conversation }) => {
  return (
    <div className={`modal fade ${isOpen ? 'show' : ''}`} style={{ display: isOpen ? 'block' : 'none' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5">Sources utilisées</h2>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Fermer"></button>
          </div>
          <div className="modal-body">
            {conversation?.messages.filter(m => m.sources && m.sources.length > 0).map((message, index) => (
              <div key={index} className="mb-3">
                <div className="fw-bold">Réponse du {message.role === 'assistant' ? 'bot' : 'utilisateur'} :</div>
                <ul className="list-unstyled">
                  {message.sources?.map((source, sIndex) => (
                    <li key={sIndex} className="d-flex align-items-start mb-2">
                      <span className="me-2">•</span>
                      <a href={source} target="_blank" rel="noopener noreferrer" className="text-break">
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {!conversation?.messages.some(m => m.sources) && (
              <div className="text-muted">Aucune source utilisée pour le moment.</div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 