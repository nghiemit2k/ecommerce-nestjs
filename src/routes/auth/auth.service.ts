import { HttpException, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { HashingService } from "src/shared/services/hashing.service";
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from "src/shared/helpers";
import { ForgotPasswordBodyType, LoginBodyType, RefreshTokenBodyType, RegisterBodyType, SendOtpBodyType } from "./auth.model";
import { AuthRepoitory } from "./auth.repo";
import { SharedUserRepository } from "src/shared/repository/shared-user.repo";
import { addMilliseconds } from "date-fns";
import ms from "ms";
import envConfig from "src/shared/config";
import { TypeOfVerification, TypeOfVerificationType } from "src/shared/constants/auth.constant";
import { EmailService } from "src/shared/services/email.service";
import { AccessTokenPayloadCreate } from "src/shared/types/jwt.type";
import { TokenService } from "src/shared/services/token.service";


@Injectable()
export class AuthService {
    constructor(private readonly authRepo: AuthRepoitory, private readonly hashingService: HashingService,
        private readonly rolesService: RolesService, private readonly sharedUserRepo: SharedUserRepository,
        private readonly emailService: EmailService, private readonly tokenService: TokenService) { }

    async validateVerificationCode({ email, code, type }: { email: string, code: string, type: TypeOfVerificationType }) {
        const verificationCode = await this.authRepo.findUniqueVerificationCode({
            email,
            code,
            type
        })
        if (!verificationCode) {
            throw new UnprocessableEntityException([{
                message: 'Invalid verification code',
                path: ['code']
            }])
        }
        if (verificationCode.expiresAt < new Date()) {
            throw new UnprocessableEntityException([{
                message: 'Verification code expired',
                path: ['code']
            }])
        }
        console.log(verificationCode)
        return verificationCode
    }
    async register(body: RegisterBodyType) {
        try {
            await this.validateVerificationCode({
                email: body.email,
                code: body.code,
                type: TypeOfVerification.REGISTER
            })
            const clientRoleId = await this.rolesService.getClientRoleId()
            const hashedPassword = await this.hashingService.hash(body.password)
            const [user] = await Promise.all([
                this.authRepo.createUser({
                    email: body.email,
                    name: body.name,
                    password: hashedPassword,
                    phoneNumber: body.phoneNumber,
                    roleId: clientRoleId,

                }),
                this.authRepo.deleteVerificationCode({
                    email: body.email,
                    code: body.code,
                    type: TypeOfVerification.REGISTER
                })
            ])
            return user
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new UnprocessableEntityException([{
                    message: 'Email already exists',
                    path: ['email']
                }])
            }
            // Re-throw other errors
            throw error;
        }
    }

    async sendOtp(body: SendOtpBodyType) {
        console.log(body)
        const user = await this.sharedUserRepo.findUnique({ email: body.email })
        if (body.type === TypeOfVerification.REGISTER && user) {
            throw new UnprocessableEntityException([{
                message: 'Email already exists',
                path: ['email']
            }])
        }

        if (body.type === TypeOfVerification.FORGOT_PASSWORD && !user) {
            throw new UnprocessableEntityException([{
                message: 'Email not found',
                path: ['email']
            }])
        }
        const code = generateOTP()
        const result = await this.authRepo.createVerificationCode({
            email: body.email,
            code,
            type: body.type,
            expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN))
        })
        console.log(result)
        const { error } = await this.emailService.sendOTP({
            email: body.email,
            code
        })

        if (error) {
            throw new UnprocessableEntityException({
                message: 'Send OTP failed',
                path: 'code',
            });
        }
        return { message: 'OTP sent successfully' }
    }

    async login(body: LoginBodyType & { userAgent: string; ip: string }) {
        const user = await this.authRepo.findUniqueUserIncludeRole({
            email: body.email,
        });
        if (!user) {
            throw new UnprocessableEntityException([
                {
                    message: 'email not exist',
                    path: 'email',
                },
            ]);
        }
        const isPasswordMatch = await this.hashingService.compare(
            body.password,
            user.password,
        );
        if (!isPasswordMatch) {
            throw new UnprocessableEntityException([
                {
                    message: 'Password not correct',
                    path: 'password',
                },
            ]);
        }
        const device = await this.authRepo.createDevice({
            userId: user.id,
            userAgent: body.userAgent,
            ip: body.ip,
        });
        const token = await this.generateTokens({
            userId: user.id,
            deviceId: device.id,
            roleId: user.roleId,
            roleName: user.role.name,
        });
        return token;
    }
    async generateTokens({
        userId,
        deviceId,
        roleId,
        roleName,
    }: AccessTokenPayloadCreate) {
        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.signAccessToken({
                userId,
                deviceId,
                roleId,
                roleName,
            }),
            this.tokenService.signRefreshToken({
                userId,
            }),
        ]);
        const decodedRefreshToken =
            await this.tokenService.verifyRefreshToken(refreshToken);
        await this.authRepo.createRefreshToken({
            token: refreshToken,
            userId,
            expiresAt: new Date(decodedRefreshToken.exp * 1000),
            deviceId,
        });
        return { accessToken, refreshToken };
    }

    async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string, ip: string }) {
        try {
            const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
            const refreshTokenInDb = await this.authRepo.findUniqueRefreshTokenIncludeUserRole({
                token: refreshToken
            })
            if (!refreshTokenInDb) {
                throw new UnprocessableEntityException([{
                    message: 'Invalid refresh token',
                }])
            }
            const { deviceId, user: { roleId, name: roleName } } = refreshTokenInDb

            const $updateDevice = this.authRepo.updateDevice(deviceId, {
                ip,
                userAgent
            })

            const $deleteRefreshToken = this.authRepo.deleteRefreshToken({
                token: refreshToken
            })

            const $tokens = this.generateTokens({ userId, roleId, roleName, deviceId })

            const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])

            return tokens
        } catch (error) {
            if (error instanceof HttpException)
                throw error
        }
        throw new UnprocessableEntityException()
    }

    async logout(refreshToken: string) {
        try {
            await this.tokenService.verifyRefreshToken(refreshToken)
            const deleteRefreshToken = await this.authRepo.deleteRefreshToken({
                token: refreshToken
            })
            await this.authRepo.updateDevice(deleteRefreshToken.deviceId, {
                isActive: false
            })
            return {
                message: 'Logout successfully'
            }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new UnprocessableEntityException([{
                    message: 'Invalid refresh token',
                }])
            }
            throw new UnprocessableEntityException()
        }
    }

    async forgotPassword(body: ForgotPasswordBodyType) {
        const { email, code, newPassword } = body
        const user = await this.sharedUserRepo.findUnique({
            email
        })
        if (!user) {
            throw new UnprocessableEntityException([{
                message: 'Email not found',
            }])
        }
        await this.validateVerificationCode({
            email,
            code,
            type: TypeOfVerification.FORGOT_PASSWORD
        })

        const hashedPassword = await this.hashingService.hash(newPassword)

        await Promise.all([
            this.authRepo.updateUser({
                id: user.id
            }, {
                password: hashedPassword
            }),
            this.authRepo.deleteVerificationCode({
                email,
                code,
                type: TypeOfVerification.FORGOT_PASSWORD
            })
        ])

        return { message: 'Password updated successfully' }
    }
}