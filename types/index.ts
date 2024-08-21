export interface Task {
  id: string
  title: string
  createdAt: string
  done: boolean
  subtasks: string[]
}

export interface Subtask {
  id: string
  title: string
  done: boolean
}
