import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { HashingService } from "src/shared/services/hashing.service";
import { isUniqueConstraintPrismaError } from "src/shared/helpers";
import { PrismaService } from "src/shared/services/prisma.service";

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly hashingService: HashingService,
        private readonly rolesService: RolesService) { }

    async register(body: any) {
        try {
            const clientRoleId = await this.rolesService.getClientRoleId()
            const hashedPassword = await this.hashingService.hash(body.password)
            const user = await this.prisma.user.create({
                data: {
                    email: body.email,
                    password: hashedPassword,
                    roleId: clientRoleId,
                    name: body.name,
                    phoneNumber: body.phoneNumber
                },
                omit: {
                    totpSecret: true
                }
            })

            return user
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new ConflictException('Email already exists')
            }
            throw new BadRequestException(error.message)
        }

    }

}