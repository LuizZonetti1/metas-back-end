import { GoalCompletionStatus } from "../generated/prisma/enums";
import { GoalOccurrenceRepository } from "../repository/goalOccurrenceRepository";

interface CompleteOccurrenceRequest {
    occurrenceId: string;
    userId: string;
}

export class CompleteGoalOccurrenceService {

    private occurrenceRepository: GoalOccurrenceRepository;

    constructor() {
        this.occurrenceRepository = new GoalOccurrenceRepository();
    }
    async execute({ occurrenceId, userId }: CompleteOccurrenceRequest) {

        const occurrence = await this.occurrenceRepository.findById(occurrenceId);

        if (!occurrence) {
            throw new Error("Ocorrencia nao encontrada.");
        }

        if (occurrence.goal.userId !== userId) {
            throw new Error("Acesso nao autorizado.");
        }

        const updatedOccurrence = 
            occurrence.status === GoalCompletionStatus.COMPLETED
        ? await this.occurrenceRepository.update(
            occurrenceId,
            GoalCompletionStatus.NOT_COMPLETED
          )
        : await this.occurrenceRepository.update(
            occurrenceId,
            GoalCompletionStatus.COMPLETED
          );

        return updatedOccurrence;

    }

}