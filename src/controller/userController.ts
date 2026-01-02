import { CreateUserService } from "../services/createUserService";
import { AuthUserService } from "../services/authUserService";
import { Request, Response } from "express";
import * as yup from "yup";

export class UserController {

    async create(req: Request, res: Response) {
        const schema = yup.object().shape({
            name: yup.string().required("Nome é obrigatório."),
            email: yup.string().email("Email inválido.").required("Email é obrigatório."),
            password: yup.string().min(6, "A senha deve ter no mínimo 6 caracteres.").required("Senha é obrigatória."),
        });

        try {
            await schema.validate(req.body, { abortEarly: false });

            const { name, email, password } = req.body;

            const createUserService = new CreateUserService();

            const user = await createUserService.execute({
                name, 
                email, 
                password });

            return res.status(201).json(user);

        } catch (error: any) {
            return res.status(400).json({ message: error.mensage });
            
        }
    }

    async auth(req: Request, res: Response) {
        const schema = yup.object().shape({
            email: yup.string().email("Email inválido.").required("Email é obrigatório."),
            password: yup.string().min(6).required("Senha é obrigatória."),
        });

        try {
            await schema.validate(req.body, { abortEarly: false });

            const { email, password } = req.body;

            const authUserService = new AuthUserService();

            const auth = await authUserService.execute({ email, password });

            return res.status(200).json(auth);

        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }

}