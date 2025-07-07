import { z } from "zod";
import { userSchema } from "src/shared/models/shared-user.model";


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
    .refine((data) => data.code.length === 6, {
        message: 'Code must be 6 digits',
        path: ['code']
    })

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export const RegisterResponseSchema = userSchema.omit({
    password: true,
    totpSecret: true,
});

export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>;