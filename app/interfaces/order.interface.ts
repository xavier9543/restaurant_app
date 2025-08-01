import { OrderItem } from "."

export interface Order {
  id: number
  total: number
  created_at: string
  orderItems: OrderItem[]
  createdAt?: string

}