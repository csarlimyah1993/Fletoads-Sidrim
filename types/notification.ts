export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  icon?: string
  read: boolean
  createdAt: Date
  link?: string
}

