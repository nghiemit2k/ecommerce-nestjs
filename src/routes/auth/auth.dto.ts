import { createZodDto } from "nestjs-zod";
import { RegisterBodySchema, RegisterResponseSchema } from "./auth.model";

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) { }

export class RegisterResponseDTO extends createZodDto(RegisterResponseSchema) { }