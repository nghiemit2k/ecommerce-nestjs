import { Module } from "@nestjs/common";
import { PrismaService } from "./services/prisma.service";
import { HashingService } from "./services/hashing.service";
import { SharedUserRepository } from "./repository/shared-user.repo";
import { AuthRepoitory } from "src/routes/auth/auth.repo";
import { EmailService } from "./services/email.service";

const sharedServices = [
    PrismaService, HashingService,
    SharedUserRepository,
    AuthRepoitory,
    EmailService
]
@Module({
    imports: [],
    controllers: [],
    providers: [...sharedServices],
    exports: [...sharedServices],
})
export class SharedModule { }