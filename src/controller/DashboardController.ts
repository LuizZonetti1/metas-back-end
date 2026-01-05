import { Request, Response } from "express";
import { GetDashboardService } from "../services/GetDashboardService";

export class DashboardController {
  async index(req: Request, res: Response) {
    const userId = req.userId;
    const period = (req.query.period as "daily" | "weekly" | "monthly") || "daily";

    const service = new GetDashboardService();
    const dashboard = await service.execute({ userId, period });

    return res.status(200).json(dashboard);
  }
}
