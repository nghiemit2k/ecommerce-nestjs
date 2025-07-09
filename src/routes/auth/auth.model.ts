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

export const RegisterResponseSchema = userSchema.omit({
    password: true,
    totpSecret: true,
});

export const VerificationCode = z.object({
    id: z.number(),
    code: z.string().min(6).max(6),
    email: z.string().email(),
    type: z.enum([TypeOfVerification.REGISTER, TypeOfVerification.FORGOT_PASSWORD]),
    expiresAt: z.date(),
    createdAt: z.date(),
})
export const SendOtpBodySchema = VerificationCode.pick({
    email: true,
    type: true,
}).strict()

export const SendOtpResponseSchema = z.object({
    message: z.string(),
})

export const VerifyOtpBodySchema = VerificationCode.pick({
    id: true,
    code: true,
}).strict()

export const VerifyOtpResponseSchema = z.object({
    message: z.string(),
})

export const LoginBodySchema = userSchema
    .pick({
        email: true,
        password: true,
    })
export const LoginResSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
})

export const RefreshTokenBodySchema = z.object({
    refreshToken: z.string()
}).strict()

export const RefreshTokenResSchema = LoginResSchema

export const DeviceSchema = z.object({
    id: z.number(),
    userId: z.number(),
    userAgent: z.string(),
    ip: z.string(),
    lastActive: z.date(),
    createdAt: z.date(),
    isActive: z.boolean(),
});

export const RefreshTokenSchema = z.object({
    token: z.string(),
    deviceId: z.number(),
    userId: z.number(),
    expiresAt: z.date(),
    createdAt: z.date(),
})

export const RoleSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    isActive: z.string(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const LogoutBodySchema = RefreshTokenBodySchema
export type LogoutBodyType = RefreshTokenBodyType
export type RoleType = z.infer<typeof RoleSchema>;
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type VerifyOtpBodyType = z.infer<typeof VerifyOtpBodySchema>
export type VerificationCodeType = z.infer<typeof VerificationCode>
export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>;
export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type RefreshTokenResType = LoginResType
export type DeviceType = z.infer<typeof DeviceSchema>;
export type SendOtpResponseType = z.infer<typeof SendOtpResponseSchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>