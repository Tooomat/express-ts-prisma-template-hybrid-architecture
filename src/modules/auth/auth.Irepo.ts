import { User } from "../../generated/prisma/client"
import { RegisterUserDTO } from "./auth.dto"

export interface IAuthRepository {
  findById(id: string): Promise<Pick<User, 'id' | 'email'> | null>
  findByEmail(email: string): Promise<Pick<User, 'id' | 'email'> | null>
  create(data: RegisterUserDTO): Promise<Pick<User, 'id' | 'email'>>
} 