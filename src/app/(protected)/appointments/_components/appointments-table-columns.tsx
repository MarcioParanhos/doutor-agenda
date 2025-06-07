import { ColumnDef } from "@tanstack/react-table";

export type AppointmentWithRelations = {
  patientName: string;
  doctorName: string;
  formattedDate: string;
};

export const appointmentsTableColumns: ColumnDef<AppointmentWithRelations>[] = [
  {
    id: "patient",
    header: "Paciente",
    accessorKey: "patientName",
  },
  {
    id: "doctor",
    header: "Médico",
    accessorKey: "doctorName",
  },
  {
    id: "date",
    header: "Data/Hora",
    accessorKey: "formattedDate",
  },
];
