export type Message = {
  role: "user" | "assistant"
  content: string
  attachment?: string
  id: string
  vote?: "up" | "down"
  sources?: string[]
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

export type ExtraProps = {
  node?: any
  className?: string
  children?: React.ReactNode
}

