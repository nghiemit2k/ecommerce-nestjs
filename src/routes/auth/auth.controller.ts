import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { RegisterResponseType } from "./auth.model";
import { ZodSerializerDto } from "nestjs-zod";
import { RegisterBodyDTO, RegisterResponseDTO } from "./auth.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ZodSerializerDto(RegisterResponseDTO)
    async register(@Body() body: RegisterBodyDTO): Promise<RegisterResponseType> {
        return this.authService.register(body)
    }
}