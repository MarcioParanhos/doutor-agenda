import { z } from "zod";

export const upsertPatientSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phoneNumber: z
    .string()
    .min(14, { message: "Telefone inválido" }) // (99) 99999-9999
    .max(15, { message: "Telefone inválido" }),
  sex: z.enum(["male", "female"], { required_error: "Sexo é obrigatório" }),
});

export type UpsertPatientSchema = z.infer<typeof upsertPatientSchema>;
