import { createZodDto } from "nestjs-zod";
import { RegisterBodySchema, RegisterResponseSchema, SendOtpBodySchema, SendOtpResponseSchema, VerifyOtpBodySchema, VerifyOtpResponseSchema } from "./auth.model";

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) { }

export class RegisterResponseDTO extends createZodDto(RegisterResponseSchema) { }

export class SendOtpBodyDTO extends createZodDto(SendOtpBodySchema) { }

export class SendOtpResponseDTO extends createZodDto(SendOtpResponseSchema) { }

export class VerifyOtpBodyDTO extends createZodDto(VerifyOtpBodySchema) { }

export class VerifyOtpResponseDTO extends createZodDto(VerifyOtpResponseSchema) { }
