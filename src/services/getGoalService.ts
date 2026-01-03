import { GoalRepository } from "../repository/goalRepository";

interface GetGoalRequest {
    goalId: string;
    userId: string;
}

export class GetGoalService {

    private goalRepository: GoalRepository;

    constructor() {
        this.goalRepository = new GoalRepository();
    }

    async execute({ goalId, userId }: GetGoalRequest) {
        const goal = await this.goalRepository.findByIdAndUserId(goalId, userId);
        return goal;
    }

}