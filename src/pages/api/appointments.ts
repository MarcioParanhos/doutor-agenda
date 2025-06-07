import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ error: "doctorId e date são obrigatórios" });
  }

  const day = dayjs(date as string);

  const appointments = await db.query.appointmentsTable.findMany({
    where: and(
      eq(appointmentsTable.doctorId, doctorId as string),
      eq(appointmentsTable.date, day.toDate()),
    ),
  });

  // Retorna apenas os horários (HH:mm) dos agendamentos
  const slots = appointments.map((a) => ({
    date: a.date,
    time: dayjs(a.date).format("HH:mm"),
  }));

  return res.status(200).json({ appointments: slots });
}
