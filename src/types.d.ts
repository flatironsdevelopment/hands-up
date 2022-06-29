export interface User {
  id: string
  name: string
  photo: string
  isConnected?: boolean
  isHandUp?: boolean
  raisedAt?: number
}

export type MeetSnapshot = { [key: string]: User }
