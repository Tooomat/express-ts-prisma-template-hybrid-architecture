import { User } from "../../generated/prisma/client"

// ─── REGISTER ────────────────────────────────────
export type RegisterUserDTO = {
  email:    string
  password: string
}

export type AuthResponse = {
  id: string
  email: string
}

export function toAuthResponse(user: Pick<User, 'id' | 'email'>): AuthResponse {
    return {
        id: user.id,
        email: user.email
    }
}