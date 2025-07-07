import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserType } from "src/shared/models/shared-user.model";
import { PrismaService } from "src/shared/services/prisma.service";
import { RegisterBodyType } from "./auth.model";

@Injectable()
export class AuthRepoitory {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
        try {
            return this.prisma.user.create({
                data: user,
                omit: {
                    password: true,
                    totpSecret: true
                }
            })
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}