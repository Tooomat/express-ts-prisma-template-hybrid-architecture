import { PrismaPgService } from "../../infrastructure/database/prisma-pg.service"
import { IAuthRepository } from "./auth.Irepo" 
import { RegisterUserDTO } from "./auth.dto"
import { User } from "../../generated/prisma/client"

export class PrismaAuthRepository implements IAuthRepository {

  constructor(private prismaPgService: PrismaPgService) {}

  async findById(id: string): Promise<Pick<User, 'id' | 'email'> | null> {
    return this.prismaPgService.client.user.findUnique({
      where: { 
        id: id
      },
      select: {
        id: true,
        email: true
      }
    })
  }
  
  async findByEmail(email: string): Promise<Pick<User, 'id' | 'email'> | null> {
    return this.prismaPgService.client.user.findUnique({
        where: { 
            email: email 
        },
        select: {
            id: true,
            email: true
        }
    })
  }

  async create(data: RegisterUserDTO): Promise<Pick<User, 'id' | 'email'>> {
    return this.prismaPgService.client.user.create({
        data: data,
        select: {
          id: true,
          email: true
        }
    })
  }
}