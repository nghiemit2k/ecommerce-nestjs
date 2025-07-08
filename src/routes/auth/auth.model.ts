import { z } from "zod";
import { userSchema } from "src/shared/models/shared-user.model";
import { TypeOfVerification } from "src/shared/constants/auth.constant";


export const RegisterBodySchema = userSchema.pick({
    email: true,
    name: true,
    password: true,
    phoneNumber: true,
}).extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().min(6).max(6),
}).strict().refine((data) => data.password === data.confirmPassword, {
    message: 'Password and confirm password do not match',
    path: ['confirmPassword']
})
// .refine((data) => data.code && data.code.length === 6, {
//     message: 'Code must be 6 digits',
//     path: ['code']
// })

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export const RegisterResponseSchema = userSchema.omit({
    password: true,
    totpSecret: true,
});

export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>;

export const VerificationCode = z.object({
    id: z.number(),
    code: z.string().min(6).max(6),
    email: z.string().email(),
    type: z.enum([TypeOfVerification.REGISTER, TypeOfVerification.FORGOT_PASSWORD]),
    expiresAt: z.date(),
    createdAt: z.date(),
})

export type VerificationCodeType = z.infer<typeof VerificationCode>

export const SendOtpBodySchema = VerificationCode.pick({
    email: true,
    type: true,
}).strict()

export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>

export const SendOtpResponseSchema = z.object({
    message: z.string(),
})

export type SendOtpResponseType = z.infer<typeof SendOtpResponseSchema>

export const VerifyOtpBodySchema = VerificationCode.pick({
    id: true,
    code: true,
}).strict()

export type VerifyOtpBodyType = z.infer<typeof VerifyOtpBodySchema>

export const VerifyOtpResponseSchema = z.object({
    message: z.string(),
})