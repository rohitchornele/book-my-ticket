
import z, { email } from "zod";

export const signupPayloadModel = z.object({
    firstName : z.string().min(2),
    lastName : z.string().nullable().optional(),
    email : z.email(),
    password : z.string().minLength(6),
})