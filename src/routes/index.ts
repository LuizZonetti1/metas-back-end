import { Router } from "express";
import { UserController } from "../controller/userController";

const routes = Router();
const userController = new UserController();

routes.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Servidor esta funcionando corretamente",
  }
  );
});

routes.post("/users/create", userController.create);
routes.post("/users/auth", userController.auth);

export default routes;