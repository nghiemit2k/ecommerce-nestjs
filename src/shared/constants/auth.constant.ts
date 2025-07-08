export const UserStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    BLOCKED: 'BLOCKED'
} as const

export const TypeOfVerification = {
    REGISTER: 'REGISTER',
    FORGOT_PASSWORD: 'FORGOT_PASSWORD'
} as const

export type TypeOfVerificationType = (typeof TypeOfVerification)[keyof typeof TypeOfVerification]