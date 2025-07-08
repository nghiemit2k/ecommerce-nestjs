import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { RegisterResponseType, SendOtpResponseType } from "./auth.model";
import { ZodSerializerDto } from "nestjs-zod";
import { RegisterBodyDTO, RegisterResponseDTO, SendOtpBodyDTO } from "./auth.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ZodSerializerDto(RegisterResponseDTO)
    async register(@Body() body: RegisterBodyDTO) {
        return this.authService.register(body)
    }

    @Post('send-otp')
    async sendOtp(@Body() body: SendOtpBodyDTO) {
        return this.authService.sendOtp(body)
    }
}