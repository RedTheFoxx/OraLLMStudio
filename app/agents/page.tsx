"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, Upload } from "lucide-react"

type Agent = {
  id: string
  name: string
  systemPrompt: string
  documents: string[]
}

export default function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [newAgent, setNewAgent] = useState<Agent>({
    id: "",
    name: "",
    systemPrompt: "",
    documents: [],
  })

  const createAgent = () => {
    if (newAgent.name && newAgent.systemPrompt) {
      setAgents([...agents, { ...newAgent, id: Date.now().toString() }])
      setNewAgent({ id: "", name: "", systemPrompt: "", documents: [] })
    }
  }

  const deleteAgent = (id: string) => {
    setAgents(agents.filter((agent) => agent.id !== id))
  }

  const handleFileUpload = (agentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setAgents(
          agents.map((agent) =>
            agent.id === agentId ? { ...agent, documents: [...agent.documents, content] } : agent,
          ),
        )
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Manage Agents</h1>
      <div className="row">
        <div className="col-md-6">
          <h2>Create New Agent</h2>
          <div className="mb-3">
            <label htmlFor="agentName" className="form-label">
              Agent Name
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
            <label htmlFor="systemPrompt" className="form-label">
              System Prompt
            </label>
            <textarea
              className="form-control"
              id="systemPrompt"
              rows={3}
              value={newAgent.systemPrompt}
              onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
            ></textarea>
          </div>
          <button className="btn btn-primary" onClick={createAgent}>
            <Plus size={18} className="me-2" />
            Create Agent
          </button>
        </div>
        <div className="col-md-6">
          <h2>Existing Agents</h2>
          {agents.map((agent) => (
            <div key={agent.id} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{agent.name}</h5>
                <p className="card-text">{agent.systemPrompt}</p>
                <div className="mb-2">
                  <strong>Documents:</strong>{" "}
                  {agent.documents.length > 0
                    ? agent.documents.map((doc, index) => (
                        <span key={index} className="badge bg-secondary me-1">
                          Document {index + 1}
                        </span>
                      ))
                    : "No documents uploaded"}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <input
                      type="file"
                      id={`fileUpload-${agent.id}`}
                      className="d-none"
                      onChange={(e) => handleFileUpload(agent.id, e)}
                    />
                    <label htmlFor={`fileUpload-${agent.id}`} className="btn btn-outline-primary me-2">
                      <Upload size={18} className="me-2" />
                      Upload Document
                    </label>
                  </div>
                  <button className="btn btn-danger" onClick={() => deleteAgent(agent.id)}>
                    <Trash2 size={18} className="me-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

