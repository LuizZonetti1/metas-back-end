import { Request, Response } from "express";
import * as yup from "yup";
import { CreateGoalService } from "../services/createGoalService";
import { GoalFrequency } from "../generated/prisma/enums";
import { GetGoalService } from "../services/getGoalService";

export class GoalController {

    async create(req: Request, res: Response) {
        const schema = yup.object().shape({
            title: yup.string().required("Título é obrigatório."),
            description: yup.string(),
            frequency: yup.mixed<GoalFrequency>().oneOf(Object.values(GoalFrequency)).required("Frequência é obrigatória."),
        });

        try {
            await schema.validate(req.body, { abortEarly: false });

            const { title, description, frequency } = req.body;
            const userId = req.userId;

            const createGoalService = new CreateGoalService();

            const goal = await createGoalService.execute({ title, description, frequency, userId });

            return res.status(201).json(goal);
        } catch (error: any) {
            return res.status(400).json({ 
                message: "Erro ao criar meta",
                error: error.errors ?? error.message
            });
            
        }
    }

    async get(req: Request, res: Response) {
        const goalId = req.params.id;
        const userId = req.userId;

        const getGoalService = new GetGoalService();

        const goal = await getGoalService.execute({ goalId, userId });

        return res.status(200).json(goal);
    }

}