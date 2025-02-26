"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Plus, Trash2, Edit, Check, X, Upload, File } from "lucide-react"
import { useAgents } from "../AgentContext"

type Agent = {
  id: string
  name: string
  description: string
  systemPrompt: string
  documents: string[]
  active: boolean
  examplePrompts: string[]
}

type AlertType = "success" | "info" | "warning" | "danger"

export default function AgentsStudio() {
  const { agents, setAgents } = useAgents()
  const [newAgent, setNewAgent] = useState<Agent>({
    id: "",
    name: "",
    description: "",
    systemPrompt: "",
    documents: [],
    active: false,
    examplePrompts: [],
  })
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newExamplePrompt, setNewExamplePrompt] = useState("")

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  const createAgent = () => {
    if (newAgent.name && newAgent.systemPrompt) {
      setAgents([...agents, { ...newAgent, id: Date.now().toString(), active: true }])
      setNewAgent({
        id: "",
        name: "",
        description: "",
        systemPrompt: "",
        documents: [],
        active: false,
        examplePrompts: [],
      })
      setIsCreating(false)
      setAlert({ message: "Agent créé avec succès !", type: "success" })
    } else {
      setAlert({ message: "Échec de la création de l'agent. Veuillez remplir tous les champs requis.", type: "danger" })
    }
  }

  const updateAgent = () => {
    if (editingAgent) {
      setAgents(agents.map((agent) => (agent.id === editingAgent.id ? editingAgent : agent)))
      setEditingAgent(null)
      setAlert({ message: "Agent mis à jour avec succès !", type: "success" })
    }
  }

  const deleteAgent = (id: string) => {
    setAgents(agents.filter((agent) => agent.id !== id))
    setAlert({ message: "Agent supprimé avec succès !", type: "success" })
  }

  const toggleAgentStatus = (id: string) => {
    setAgents(agents.map((agent) => (agent.id === id ? { ...agent, active: !agent.active } : agent)))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && editingAgent) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setEditingAgent({
          ...editingAgent,
          documents: [...editingAgent.documents, file.name],
        })
      }
      reader.readAsText(file)
    }
  }

  const deleteDocument = (documentName: string) => {
    if (editingAgent) {
      setEditingAgent({
        ...editingAgent,
        documents: editingAgent.documents.filter((doc) => doc !== documentName),
      })
    }
  }

  const addExamplePrompt = (isEditing: boolean) => {
    if (newExamplePrompt) {
      if (isEditing && editingAgent) {
        if (editingAgent.examplePrompts.length < 5) {
          setEditingAgent({
            ...editingAgent,
            examplePrompts: [...editingAgent.examplePrompts, newExamplePrompt],
          })
        }
      } else {
        if (newAgent.examplePrompts.length < 5) {
          setNewAgent({
            ...newAgent,
            examplePrompts: [...newAgent.examplePrompts, newExamplePrompt],
          })
        }
      }
      setNewExamplePrompt("")
    }
  }

  const removeExamplePrompt = (index: number, isEditing: boolean) => {
    if (isEditing && editingAgent) {
      setEditingAgent({
        ...editingAgent,
        examplePrompts: editingAgent.examplePrompts.filter((_, i) => i !== index),
      })
    } else {
      setNewAgent({
        ...newAgent,
        examplePrompts: newAgent.examplePrompts.filter((_, i) => i !== index),
      })
    }
  }

  return (
    <div className="container-fluid mt-4">
      <style jsx global>{`
        :root {
          --orange-100: #FFF0E5;
          --orange-200: #FFD5B3;
          --orange-300: #FFBA80;
          --orange-400: #FF9E4D;
          --orange-500: #FF7900;
          --orange-600: #CC6100;
          --orange-700: #994900;
          --blue-100: #E5F1FF;
          --blue-200: #B3D6FF;
          --blue-300: #80BBFF;
          --blue-400: #4DA0FF;
          --blue-500: #1A85FF;
          --blue-600: #006ACC;
          --blue-700: #005099;
          --green-100: #E5FFF2;
          --green-200: #B3FFD9;
          --green-300: #80FFC0;
          --green-400: #4DFFA6;
          --green-500: #1AFF8C;
          --green-600: #00CC6A;
          --green-700: #00994F;
        }
        .table {
          --bs-table-bg: transparent;
          --bs-table-color: var(--bs-body-color);
        }
        .table > :not(caption) > * > * {
          padding: 0.75rem;
          background-color: var(--bs-table-bg);
          border-bottom-width: 1px;
          box-shadow: inset 0 0 0 9999px var(--bs-table-accent-bg);
        }
        .table > thead {
          background-color: var(--orange-100);
        }
        .btn-orange {
          background-color: var(--orange-500);
          border-color: var(--orange-500);
          color: white;
        }
        .btn-orange:hover {
          background-color: var(--orange-600);
          border-color: var(--orange-600);
          color: white;
        }
        .btn-blue {
          background-color: var(--blue-500);
          border-color: var(--blue-500);
          color: white;
        }
        .btn-blue:hover {
          background-color: var(--blue-600);
          border-color: var(--blue-600);
          color: white;
        }
        .btn-green {
          background-color: var(--green-500);
          border-color: var(--green-500);
          color: white;
        }
        .btn-green:hover {
          background-color: var(--green-600);
          border-color: var(--green-600);
          color: white;
        }
        .agent-form {
          background-color: var(--orange-100);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .action-button {
          width: 32px;
          height: 32px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 5px;
        }
        .document-list {
          list-style-type: none;
          padding-left: 0;
        }
        .document-item {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
        .document-name {
          margin-left: 5px;
          margin-right: 10px;
        }
        .example-prompt-list {
          list-style-type: none;
          padding-left: 0;
        }
        .example-prompt-item {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
        .example-prompt-text {
          margin-right: 10px;
          flex-grow: 1;
        }
      `}</style>

      <h1 className="mb-4">Gestion des agents</h1>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Fermer"
            onClick={() => setAlert(null)}
          ></button>
        </div>
      )}

      {isCreating ? (
        <div className="agent-form">
          <h2>Créer un nouvel agent</h2>
          <div className="mb-3">
            <label htmlFor="agentName" className="form-label">
              Nom de l'Agent
            </label>
            <input
              type="text"
              className="form-control"
              id="agentName"
              value={newAgent.name}
              onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="agentDescription" className="form-label">
              Description
            </label>
            <input
              type="text"
              className="form-control"
              id="agentDescription"
              value={newAgent.description}
              onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="systemPrompt" className="form-label">
              Prompt Système
            </label>
            <textarea
              className="form-control"
              id="systemPrompt"
              rows={3}
              value={newAgent.systemPrompt}
              onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="examplePrompts" className="form-label">
              Exemples de Prompts (max 5)
            </label>
            <ul className="example-prompt-list">
              {newAgent.examplePrompts.map((prompt, index) => (
                <li key={index} className="example-prompt-item">
                  <span className="example-prompt-text">{prompt}</span>
                  <button
                    className="btn btn-sm btn-danger action-button"
                    onClick={() => removeExamplePrompt(index, false)}
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
            {newAgent.examplePrompts.length < 5 && (
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ajouter un exemple de prompt"
                  value={newExamplePrompt}
                  onChange={(e) => setNewExamplePrompt(e.target.value)}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={() => addExamplePrompt(false)}>
                  Ajouter
                </button>
              </div>
            )}
          </div>
          <button className="btn btn-primary me-2" onClick={createAgent}>
            <Check size={18} className="me-2" />
            Créer l'Agent
          </button>
          <button className="btn btn-secondary" onClick={() => setIsCreating(false)}>
            <X size={18} className="me-2" />
            Annuler
          </button>
        </div>
      ) : (
        <button className="btn btn-primary mb-4" onClick={() => setIsCreating(true)}>
          <Plus size={18} className="me-2" />
          Créer un Nouvel Agent
        </button>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Prompt Système</th>
              <th>Documents</th>
              <th>Exemples de Prompts</th>
              <th>Actif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td>{agent.name}</td>
                <td>{agent.description}</td>
                <td>{agent.systemPrompt.substring(0, 50)}...</td>
                <td>
                  {agent.documents.length > 0 ? (
                    <span className="badge bg-success">Oui</span>
                  ) : (
                    <span className="badge bg-secondary">Non</span>
                  )}
                </td>
                <td>{agent.examplePrompts.length}</td>
                <td>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`activeSwitch-${agent.id}`}
                      checked={agent.active}
                      onChange={() => toggleAgentStatus(agent.id)}
                    />
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary me-2 action-button"
                    onClick={() => setEditingAgent(agent)}
                  >
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-sm btn-danger action-button" onClick={() => deleteAgent(agent.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingAgent && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier l'Agent</h5>
                <button type="button" className="btn-close" onClick={() => setEditingAgent(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="editAgentName" className="form-label">
                    Nom de l'Agent
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editAgentName"
                    value={editingAgent.name}
                    onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editAgentDescription" className="form-label">
                    Description
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editAgentDescription"
                    value={editingAgent.description}
                    onChange={(e) => setEditingAgent({ ...editingAgent, description: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editSystemPrompt" className="form-label">
                    Prompt Système
                  </label>
                  <textarea
                    className="form-control"
                    id="editSystemPrompt"
                    rows={3}
                    value={editingAgent.systemPrompt}
                    onChange={(e) => setEditingAgent({ ...editingAgent, systemPrompt: e.target.value })}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="editExamplePrompts" className="form-label">
                    Exemples de Prompts (max 5)
                  </label>
                  <ul className="example-prompt-list">
                    {editingAgent.examplePrompts.map((prompt, index) => (
                      <li key={index} className="example-prompt-item">
                        <span className="example-prompt-text">{prompt}</span>
                        <button
                          className="btn btn-sm btn-danger action-button"
                          onClick={() => removeExamplePrompt(index, true)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {editingAgent.examplePrompts.length < 5 && (
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ajouter un exemple de prompt"
                        value={newExamplePrompt}
                        onChange={(e) => setNewExamplePrompt(e.target.value)}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => addExamplePrompt(true)}
                      >
                        Ajouter
                      </button>
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Documents</label>
                  <ul className="document-list">
                    {editingAgent.documents.map((doc, index) => (
                      <li key={index} className="document-item">
                        <File size={16} />
                        <span className="document-name">{doc}</span>
                        <button className="btn btn-sm btn-danger action-button" onClick={() => deleteDocument(doc)}>
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <input
                    type="file"
                    id="fileUpload"
                    className="d-none"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                  <label htmlFor="fileUpload" className="btn btn-sm btn-secondary">
                    <Upload size={16} className="me-2" />
                    Télécharger un Document
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingAgent(null)}>
                  Fermer
                </button>
                <button type="button" className="btn btn-primary" onClick={updateAgent}>
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

