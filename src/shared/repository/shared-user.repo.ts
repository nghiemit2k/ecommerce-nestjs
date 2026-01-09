import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { UserType } from "../models/shared-user.model";

@Injectable()
export class SharedUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
        return this.prisma.user.findUnique({
            where: uniqueObject
        })
    }
}