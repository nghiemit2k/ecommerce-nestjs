import { Module } from "@nestjs/common";
import { SharedModule } from "src/shared/shared.module";
import { AuthService } from "./auth.service";
import { RolesService } from "./roles.service";
import { AuthController } from "./auth.controller";
import { AuthRepoitory } from "./auth.repo";

@Module({
    imports: [SharedModule],
    controllers: [AuthController],
    providers: [AuthService, RolesService, AuthRepoitory],
    exports: [AuthService]
})
export class AuthModule { } 