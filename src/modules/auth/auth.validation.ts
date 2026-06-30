import { z } from "zod";

export class AuthValidation {
    static readonly REGISTER_SCHEMA = z.object({
        email: z
            .string()
            .email(),
        password: z
            .string()
            .min(8)
    })
}