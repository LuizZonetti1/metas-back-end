import { prisma } from '../database/prisma';

export class UserRepository {
    async findByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        return user;
    }

    async create(data : {
        name: string;
        email: string;
        password: string;
    }) {
        return prisma.user.create({
            data,
        });
    }
}