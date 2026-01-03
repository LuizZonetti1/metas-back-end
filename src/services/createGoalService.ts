import { prisma } from "../database/prisma";
import { GoalCompletionStatus, GoalFrequency, GoalStatus } from "../generated/prisma/enums";
import { GoalRepository } from "../repository/goalRepository";

interface CreateGoalDTO {
    title: string;
    description: string;
    frequency: GoalFrequency;
    userId: string;
}

export class CreateGoalService {

    private goalRepository: GoalRepository;

    constructor() {
        this.goalRepository = new GoalRepository();
    }

    async execute ({title, description, frequency, userId}: CreateGoalDTO) {
        const goal = await this.goalRepository.create({
            title,
            description,
            frequency,
            status: GoalStatus.ACTIVE,
            userId
        });

        //Cria a primeira occorencia (REGRA INICIAL)
        await prisma.goalOccurrence.create({
            data: {
                goalId: goal.id,
                date: new Date(),
                status : GoalCompletionStatus.NOT_COMPLETED,
            }
        })

        return goal;
    }   

}