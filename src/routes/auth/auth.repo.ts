import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserType } from "src/shared/models/shared-user.model";
import { PrismaService } from "src/shared/services/prisma.service";
import { DeviceType, RefreshTokenType, RegisterBodyType, RoleType, VerificationCodeType } from "./auth.model";
import { TypeOfVerificationType } from "src/shared/constants/auth.constant";
import { User } from "@prisma/client";

@Injectable()
export class AuthRepoitory {
    constructor(private readonly prisma: PrismaService) { }

    async createUser(user: Pick<UserType, 'email' | 'name' | 'password' | 'phoneNumber' | 'roleId'>): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
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
                type: payload.type,
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

    createRefreshToken(data: {
        token: string;
        userId: number;
        expiresAt: Date;
        deviceId: number;
    }) {
        return this.prisma.refreshToken.create({
            data,
        });
    }

    createDevice(
        data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> &
            Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
    ) {
        return this.prisma.device.create({
            data,
        });
    }

    async findUniqueUserIncludeRole(
        uniqueObject: { email: string } | { id: number },
    ) {
        return this.prisma.user.findUnique({
            where: uniqueObject,
            include: {
                role: true,
            },
        });
    }

    async findUniqueRefreshTokenIncludeUserRole(uniqueObject: { token: string }):
        Promise<RefreshTokenType & { user: UserType & { role: RoleType } } | null> {
        return this.prisma.refreshToken.findUnique({
            where: uniqueObject,
            include: {
                user: {
                    include: {
                        role: true
                    }
                }

            },
        });
    }

    async updateDevice(deviceId: number, data: Partial<DeviceType>): Promise<DeviceType> {
        return this.prisma.device.update({
            where: { id: deviceId },
            data,
        });
    }

    async deleteRefreshToken(uniqueObject: { token: string }): Promise<RefreshTokenType> {
        return this.prisma.refreshToken.delete({
            where: uniqueObject,
        });
    }

    async createUserIncludeRole(user: Pick<UserType, 'email' | 'name' | 'password' | 'phoneNumber' | 'avatar' | 'roleId'>):
        Promise<UserType & { role: RoleType }> {

        return this.prisma.user.create({
            data: user,
            include: {
                role: true
            }
        })
    }

    updateUser(where: { id: number } | { email: string }, data: Partial<Omit<UserType, 'id'>>): Promise<UserType> {
        return this.prisma.user.update({
            where,
            data
        })
    }

    deleteVerificationCode(uniqueValue: { email: string } | { id: number } | { email: string, code: string, type: TypeOfVerificationType }):
        Promise<VerificationCodeType> {
        return this.prisma.verificationCode.delete({
            where: uniqueValue
        })
    }
}