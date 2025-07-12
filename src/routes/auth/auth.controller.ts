import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ZodSerializerDto } from "nestjs-zod";
import { LoginBodyDTO, LoginResDTO, RefreshTokenResDTO, RefreshTokenBodyDTO, RegisterBodyDTO, RegisterResponseDTO, SendOtpBodyDTO, LogoutBodyDTO, GetAuthorizationUrlResDTO } from "./auth.dto";
import { UserAgent } from "src/shared/decorators/user-agent.decorator";
import { MessageResDTO } from "src/shared/dtos/response.dto";
import { isPublic } from "src/shared/decorators/auth.decorator";
import { GoogleService } from "./google.service";
import { Response } from "express";
import envConfig from "src/shared/config";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
        private readonly googleService: GoogleService
    ) { }

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

    @Get('google-link')
    @isPublic()
    getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
        return this.googleService.getAuthorizationUrl({
            userAgent,
            ip
        })
    }

    @Get('google/callback')
    @isPublic()
    async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
        try {
            const data = await this.googleService.googleCallback({ code, state })
            console.log(data)
            return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'error when login with google, please try another ways'
            return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${message}`)
        }
    }
}