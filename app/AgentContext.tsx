"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"

type Agent = {
  id: string
  name: string
  description: string
  systemPrompt: string
  documents: string[]
  active: boolean
  examplePrompts: string[]
}

type AgentContextType = {
  agents: Agent[]
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    // In a real application, you would fetch the agents from an API or database
    const mockAgents: Agent[] = [
      {
        id: "1",
        name: "Assistant Général",
        description: "Un assistant polyvalent pour diverses tâches",
        systemPrompt: "Vous êtes un assistant utile et polyvalent.",
        documents: [],
        active: true,
        examplePrompts: [
          "Quelles sont les principales caractéristiques du framework Orange Boosted ?",
          "Comment puis-je améliorer ma productivité au travail ?",
          "Pouvez-vous expliquer le concept de design responsive ?",
        ],
      },
      {
        id: "2",
        name: "Expert en Code",
        description: "Un expert en programmation et développement logiciel",
        systemPrompt: "Vous êtes un expert en programmation et développement logiciel.",
        documents: ["coding_best_practices.pdf"],
        active: true,
        examplePrompts: [
          "Quelles sont les meilleures pratiques pour écrire du code propre ?",
          "Pouvez-vous expliquer la différence entre var, let et const en JavaScript ?",
          "Comment implémenter un algorithme de recherche binaire ?",
        ],
      },
      {
        id: "3",
        name: "Analyste de Données",
        description: "Spécialisé dans l'analyse de données et la visualisation",
        systemPrompt: "Vous êtes un analyste de données spécialisé dans l'analyse et la visualisation de données.",
        documents: ["data_analysis_techniques.pdf", "visualization_tools.pdf"],
        active: true,
        examplePrompts: [
          "Quelles sont les techniques de visualisation de données les plus courantes ?",
          "Pouvez-vous expliquer le concept de signification statistique ?",
          "Comment effectuer une analyse de régression ?",
        ],
      },
    ]
    setAgents(mockAgents)
  }, [])

  return <AgentContext.Provider value={{ agents, setAgents }}>{children}</AgentContext.Provider>
}

export const useAgents = () => {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error("useAgents must be used within an AgentProvider")
  }
  return context
}

