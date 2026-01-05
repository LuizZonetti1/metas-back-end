import { Router } from "express";
import { UserController } from "../controller/userController";
import { GoalController } from "../controller/goalController";
import { authMiddleware } from "../middlewares/auth";
import { DashboardController } from "../controller/DashboardController";

const routes = Router();
const userController = new UserController();
const goalController = new GoalController();
const dashboardController = new DashboardController();


routes.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Servidor esta funcionando corretamente",
  }
  );
});

routes.post("/users/create", userController.create);
routes.post("/users/auth", userController.auth);

routes.get("/goals", authMiddleware, goalController.list);
routes.get("/goals/:id", authMiddleware, goalController.get);
routes.post("/goals/create", authMiddleware, goalController.create);
routes.post("/goals/occurrences/:id/complete", authMiddleware, goalController.completeOccurrence);

routes.get("/dashboard", authMiddleware, dashboardController.index);

export default routes;