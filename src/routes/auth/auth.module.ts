import { Module } from "@nestjs/common";
import { SharedModule } from "src/shared/shared.module";
import { AuthService } from "./auth.service";
import { RolesService } from "./roles.service";
import { AuthController } from "./auth.controller";

@Module({
    imports: [SharedModule],
    controllers: [AuthController],
    providers: [AuthService, RolesService],
    exports: [AuthService]
})
export class AuthModule { } 