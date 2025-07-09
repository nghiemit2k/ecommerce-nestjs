import { Body, Controller, Ip, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ZodSerializerDto } from "nestjs-zod";
import { LoginBodyDTO, RegisterBodyDTO, RegisterResponseDTO, SendOtpBodyDTO } from "./auth.dto";
import { UserAgent } from "src/shared/decorators/user-agent.decorator";


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

    @Post('login')
    async Login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
        return this.authService.login({
            ...body,
            userAgent,
            ip
        });
    }
}