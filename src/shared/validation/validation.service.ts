import { ZodTypeAny , z } from "zod";

export class ValidationService {
    validate<T extends ZodTypeAny>(
        schema: T,
        data: unknown
    ): z.infer<T> {
        return schema.parse(data)
    }
}