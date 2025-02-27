import React, { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Agent } from "../AgentContext"

interface ParametersPanelProps {
  selectedAgent: Agent | null
  temperature: number
  setTemperature: (temp: number) => void
  numDocs: number
  setNumDocs: (num: number) => void
  onDeleteAllConversations: () => void
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  selectedAgent,
  temperature,
  setTemperature,
  numDocs,
  setNumDocs,
  onDeleteAllConversations,
}) => {
  const [showLLMParams, setShowLLMParams] = useState(false)

  return (
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
                onClick={() => navigator.clipboard.writeText(prompt)}
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
                <button className="btn btn-danger btn-sm w-100" onClick={onDeleteAllConversations}>
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
  )
} 