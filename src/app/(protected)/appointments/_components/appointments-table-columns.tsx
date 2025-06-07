"use client";

import { ColumnDef } from "@tanstack/react-table";

import { AppointmentTableActions } from "./appointment-table-actions";

export type AppointmentWithRelations = {
  id: string;
  patientName: string;
  doctorName: string;
  formattedDate: string;
  formattedPrice: string;
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
  {
    id: "specialty",
    header: "Especialidade",
    accessorKey: "specialty",
  },
  {
    id: "price",
    header: "Valor",
    accessorKey: "formattedPrice",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <AppointmentTableActions appointmentId={row.original.id} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
