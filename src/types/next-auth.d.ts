import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      user_id: string
      name?: string | null
      email?: string | null
      image?: string | null
      current_plan?: string
      subscription_status?: string
      status?: number
    }
  }

  interface User {
    user_id: string
    name?: string | null
    email?: string | null
    image?: string | null
    current_plan?: string
    subscription_status?: string
    status?: number
  }
}