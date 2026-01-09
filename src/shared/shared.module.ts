import { Module } from "@nestjs/common";
import { PrismaService } from "./services/prisma.service";
import { HashingService } from "./services/hashing.service";
import { SharedUserRepository } from "./repository/shared-user.repo";
import { AuthRepoitory } from "src/routes/auth/auth.repo";
import { EmailService } from "./services/email.service";
import { AccessTokenGuard } from "./guards/access-token.guard";
import { APIKeyGuard } from "./guards/api-key.guard";
import { APP_GUARD } from "@nestjs/core";
import { AuthenticationGuard } from "./guards/authentication.guard";
import { JwtModule } from "@nestjs/jwt";
import { TokenService } from "./services/token.service";

const sharedServices = [
    PrismaService, HashingService,
    SharedUserRepository,
    AuthRepoitory,
    EmailService,
    AccessTokenGuard,
    APIKeyGuard,
    AuthenticationGuard,
    TokenService
]
@Module({
    imports: [JwtModule.register({})],
    controllers: [],
    providers: [...sharedServices, {
        provide: APP_GUARD,
        useClass: AuthenticationGuard
    }],
    exports: [...sharedServices],
})
export class SharedModule { }