import { UserRepository } from "../repository/userRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface AuthUserRequest {
    email: string;
    password: string;
}

export class AuthUserService {

    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async execute ({ email, password }: AuthUserRequest) {

        const user = await this.userRepository.findByEmail(email);
        
        if (!user) {
            throw new Error("Email ou senha incorretos.");
        }

        if (!user.password) {
            throw new Error("Email ou senha incorretos.");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new Error("Email ou senha incorretos.");
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET nao definido.");
        }

        const token = jwt.sign({sub: user.id}, process.env.JWT_SECRET as string, {
            expiresIn: "7d"
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token,
         };
    }

}
