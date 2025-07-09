export const REQUEST_USER_KEY = 'user'

export const AuthType = {
    Bearer: 'Bearer',
    None: 'None',
    APIKey: 'ApiKey',
} as const


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

