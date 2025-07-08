import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserType } from "src/shared/models/shared-user.model";
import { PrismaService } from "src/shared/services/prisma.service";
import { RegisterBodyType, VerificationCodeType } from "./auth.model";
import { TypeOfVerification, TypeOfVerificationType } from "src/shared/constants/auth.constant";

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
    async createVerificationCode(payload: Pick<VerificationCodeType, 'email' | 'code' | 'type' | 'expiresAt'>): Promise<VerificationCodeType> {
        return this.prisma.verificationCode.upsert({
            where: {
                email: payload.email,

            },
            create: payload,
            update: {
                code: payload.code,
                expiresAt: payload.expiresAt
            }

        })
    }

    async findUniqueVerificationCode(uniqueValue: { email: string } | { id: number } |
    { email: string, code: string, type: TypeOfVerificationType }): Promise<VerificationCodeType | null> {
        return this.prisma.verificationCode.findUnique({
            where: uniqueValue
        })
    }
}