import { prisma } from "../database/prisma";
import { GoalFrequency, GoalStatus } from '../generated/prisma/enums';

interface CreateGoal {
    title: string;
    description: string;
    frequency: GoalFrequency;
    status: GoalStatus;
    userId: string;
}


interface FindGoalsByUserAndDateRangeDTO {
    userId: string;
    startDate: Date;
    endDate: Date;
}
export class GoalRepository {

    async create(data: CreateGoal) {
        return prisma.goal.create({
            data: {
                title: data.title,
                description: data.description,
                frequency: data.frequency,
                status: data.status,
                userId: data.userId,
            },
        });
    }
    async findByIdAndUserId(goalId: string, userId: string) {
        return prisma.goal.findFirst({
            where: {
                id: goalId,
                userId: userId,
            },
        });
    }

    async findByUserAndDateRange({ userId, startDate, endDate }: FindGoalsByUserAndDateRangeDTO) {
        return prisma.goal.findMany({
            where: {
                userId,
            },
            include: {
                occurrences: {
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    orderBy: {
                        date: "asc",
                    },
                },
            },
        });

    }
}
