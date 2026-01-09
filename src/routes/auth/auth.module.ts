import { Module } from "@nestjs/common";
import { SharedModule } from "src/shared/shared.module";
import { AuthService } from "./auth.service";
import { RolesService } from "./roles.service";
import { AuthController } from "./auth.controller";
import { AuthRepoitory } from "./auth.repo";
import { TokenService } from "src/shared/services/token.service";
import { HashingService } from "src/shared/services/hashing.service";
import { JwtService } from "@nestjs/jwt";
import { GoogleService } from "./google.service";

@Module({
    imports: [SharedModule],
    controllers: [AuthController],
    providers: [AuthService, RolesService, AuthRepoitory, TokenService, HashingService, JwtService, GoogleService],
    exports: [AuthService, GoogleService]
})
export class AuthModule { } 