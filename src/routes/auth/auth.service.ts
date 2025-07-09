import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { HashingService } from "src/shared/services/hashing.service";
import { generateOTP, isUniqueConstraintPrismaError } from "src/shared/helpers";
import { LoginBodyType, RegisterBodyType, SendOtpBodyType } from "./auth.model";
import { AuthRepoitory } from "./auth.repo";
import { SharedUserRepository } from "src/shared/repository/shared-user.repo";
import { addMilliseconds } from "date-fns";
import ms from "ms";
import envConfig from "src/shared/config";
import { TypeOfVerification } from "src/shared/constants/auth.constant";
import { EmailService } from "src/shared/services/email.service";
import { AccessTokenPayloadCreate } from "src/shared/types/jwt.type";
import { TokenService } from "src/shared/services/token.service";

@Injectable()
export class AuthService {
    constructor(private readonly authRepo: AuthRepoitory, private readonly hashingService: HashingService,
        private readonly rolesService: RolesService, private readonly sharedUserRepo: SharedUserRepository,
        private readonly emailService: EmailService, private readonly tokenService: TokenService) { }

    async register(body: RegisterBodyType) {
        try {
            const verificationCode = await this.authRepo.findUniqueVerificationCode({
                email: body.email,
                code: body.code,
                type: TypeOfVerification.REGISTER

            })
            console.log(verificationCode)
            if (!verificationCode) {
                console.log(verificationCode)
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
            const clientRoleId = await this.rolesService.getClientRoleId()
            const hashedPassword = await this.hashingService.hash(body.password)
            const user = await this.authRepo.createUser({
                email: body.email,
                name: body.name,
                password: hashedPassword,
                phoneNumber: body.phoneNumber,
                roleId: clientRoleId
            })
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
        const user = await this.sharedUserRepo.findUnique({ email: body.email })
        if (user) {
            throw new UnprocessableEntityException([{
                message: 'Email already exists',
                path: ['email']
            }])
        }
        const code = generateOTP()
        const verificationCode = await this.authRepo.createVerificationCode({
            email: body.email,
            code,
            type: body.type,
            expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN))
        })
        const { error, data } = await this.emailService.sendOTP({
            email: body.email,
            code
        })
        console.log({ data })
        if (error) {
            throw new UnprocessableEntityException({
                message: 'Send OTP failed',
                path: 'code',
            });
        }
        return verificationCode
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
}