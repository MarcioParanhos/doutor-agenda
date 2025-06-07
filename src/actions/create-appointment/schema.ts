import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid({ message: "Paciente obrigatório" }),
  doctorId: z.string().uuid({ message: "Médico obrigatório" }),
  appointmentPrice: z.string().min(1, { message: "Valor obrigatório" }),
  date: z.date({ required_error: "Data obrigatória" }),
  time: z.string().min(1, { message: "Horário obrigatório" }),
});

export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>;
