import { Module } from "@nestjs/common";
import { PrismaService } from "./services/prisma.service";
import { HashingService } from "./services/hashing.service";

const sharedServices = [
    PrismaService, HashingService,
]
@Module({
    imports: [],
    controllers: [],
    providers: [...sharedServices],
    exports: [...sharedServices],
})
export class SharedModule { }