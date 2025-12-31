import { UserRepository } from "../repository/userRepository";
import bcrypt from "bcryptjs";

interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

export class CreateUserService {

    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async execute({ name, email, password }: CreateUserRequest) {
        const userExists = await this.userRepository.findByEmail(email);

        if (userExists) {
            throw new Error("Email ja cadastrado.");
        }

        const hashedPassword = await bcrypt.hash(password, 6);

        const user = await this.userRepository.create({
            name,
            email,
            password: hashedPassword,
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
        }

    }

}