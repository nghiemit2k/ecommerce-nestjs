import { createZodDto } from "nestjs-zod";
import { LoginBodySchema, LoginResSchema, LogoutBodySchema, RefreshTokenBodySchema, RefreshTokenResSchema, RegisterBodySchema, RegisterResponseSchema, SendOtpBodySchema, SendOtpResponseSchema, VerifyOtpBodySchema, VerifyOtpResponseSchema } from "./auth.model";

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) { }

export class RegisterResponseDTO extends createZodDto(RegisterResponseSchema) { }

export class SendOtpBodyDTO extends createZodDto(SendOtpBodySchema) { }

export class SendOtpResponseDTO extends createZodDto(SendOtpResponseSchema) { }

export class VerifyOtpBodyDTO extends createZodDto(VerifyOtpBodySchema) { }

export class VerifyOtpResponseDTO extends createZodDto(VerifyOtpResponseSchema) { }

export class LoginBodyDTO extends createZodDto(LoginBodySchema) { }

export class LoginResDTO extends createZodDto(LoginResSchema) { }

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) { }
export class RefreshTokenResDTO extends createZodDto(RefreshTokenResSchema) { }
export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) { }