export type Message = {
  role: "user" | "assistant"
  content: string
  attachment?: string
  id: string
  vote?: "up" | "down"
}

export type Feedback = {
  messageId: string
  vote: "up" | "down"
  reason: string
  voterName: string
}

export type Conversation = {
  id: string
  title: string
  messages: Message[]
  agentId: string
  createdAt: Date
  feedback: Feedback[]
}

