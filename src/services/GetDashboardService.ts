import { GoalCompletionStatus } from "../generated/prisma/enums";
import { GoalRepository } from "../repository/goalRepository";
import { getDateRange } from "../utils/dateRange";


interface DashboardRequest {
  userId: string;
  period: "daily" | "weekly" | "monthly";
}

export class GetDashboardService {
  private goalRepository: GoalRepository;

  constructor() {
    this.goalRepository = new GoalRepository();
  }

  async execute({ userId, period }: DashboardRequest) {
    const { startDate, endDate } = getDateRange(period);

    const goals = await this.goalRepository.findByUserAndDateRange({
      userId,
      startDate,
      endDate,
    });

    let total = 0;
    let completed = 0;

    goals.forEach(goal => {
      goal.occurrences.forEach(occurrence => {
        total++;

        if (occurrence.status === GoalCompletionStatus.COMPLETED) {
          completed++;
        }
      });
    });

    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      period,
      range: { startDate, endDate },
      summary: {
        total,
        completed,
        pending,
        percentage,
      },
      goals,
    };
  }
}
