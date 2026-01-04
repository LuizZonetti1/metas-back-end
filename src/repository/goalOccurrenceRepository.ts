import { prisma } from "../database/prisma";
import { GoalCompletionStatus } from "../generated/prisma/enums";

export class GoalOccurrenceRepository {

    async findById(id: string) {
        return prisma.goalOccurrence.findUnique({
            where: {id},
            include: {
                goal: true,
            },
        });
    }

    async update (id: string, status: GoalCompletionStatus) {
        return prisma.goalOccurrence.update({
            where: {id},
            data: {status},
        });
    }   

}