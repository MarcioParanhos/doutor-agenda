"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { createAppointmentSchema } from "./schema";

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    // Monta o campo date+time para o campo 'date' do banco
    const dateTime = dayjs(parsedInput.date)
      .set("hour", Number(parsedInput.time.split(":")[0]))
      .set("minute", Number(parsedInput.time.split(":")[1]))
      .set("second", 0)
      .toDate();

    await db.insert(appointmentsTable).values({
      clinicId: session.user.clinic.id,
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      date: dateTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/appointments");
  });
