import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { HashingService } from "src/shared/services/hashing.service";
import { isUniqueConstraintPrismaError } from "src/shared/helpers";
import { RegisterBodyType } from "./auth.model";
import { AuthRepoitory } from "./auth.repo";

@Injectable()
export class AuthService {
    constructor(private readonly authRepo: AuthRepoitory, private readonly hashingService: HashingService,
        private readonly rolesService: RolesService) { }

    async register(body: RegisterBodyType) {
        try {
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
                throw new ConflictException('Email already exists')
            }
            throw new BadRequestException(error.message)
        }

    }

}