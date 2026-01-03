import { Router } from "express";
import { UserController } from "../controller/userController";
import { GoalController } from "../controller/goalController";
import { authMiddleware } from "../middlewares/auth";

const routes = Router();
const userController = new UserController();
const goalController = new GoalController();


routes.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Servidor esta funcionando corretamente",
  }
  );
});

routes.post("/users/create", userController.create);
routes.post("/users/auth", userController.auth);

routes.get("/goals/:id", authMiddleware, goalController.get);
routes.post("/goals/create", authMiddleware, goalController.create);

export default routes;