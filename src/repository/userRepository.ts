import { prisma } from '../database/prisma';

interface CreateUser {
    name: string;
    email: string;
    password: string;
}