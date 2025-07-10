import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ZodSerializerDto } from "nestjs-zod";
import { LoginBodyDTO, LoginResDTO, RefreshTokenResDTO, RefreshTokenBodyDTO, RegisterBodyDTO, RegisterResponseDTO, SendOtpBodyDTO, LogoutBodyDTO } from "./auth.dto";
import { UserAgent } from "src/shared/decorators/user-agent.decorator";
import { MessageResDTO } from "src/shared/dtos/response.dto";
import { isPublic } from "src/shared/decorators/auth.decorator";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @isPublic()
    @ZodSerializerDto(RegisterResponseDTO)
    register(@Body() body: RegisterBodyDTO) {
        return this.authService.register(body)
    }

    @Post('send-otp')
    @isPublic()
    @ZodSerializerDto(MessageResDTO)
    sendOtp(@Body() body: SendOtpBodyDTO) {
        return this.authService.sendOtp(body)
    }

    @Post('login')
    @isPublic()
    @ZodSerializerDto(LoginResDTO)
    Login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
        return this.authService.login({
            ...body,
            userAgent,
            ip
        });
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    @ZodSerializerDto(RefreshTokenResDTO)
    refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
        return this.authService.refreshToken({
            refreshToken: body.refreshToken,
            userAgent,
            ip
        })
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Body() body: LogoutBodyDTO) {
        return this.authService.logout(body.refreshToken)
    }
}