import { GoalRepository } from "../repository/goalRepository";


interface ListGoalsRequest {
  userId: string;
  startDate: Date;
  endDate: Date;
}

export class ListGoalsService {
  private goalRepository: GoalRepository;

  constructor() {
    this.goalRepository = new GoalRepository();
  }

  async execute({ userId, startDate, endDate }: ListGoalsRequest) {
    const goals = await this.goalRepository.findByUserAndDateRange({
      userId,
      startDate,
      endDate,
    });

    return goals;
  }
}