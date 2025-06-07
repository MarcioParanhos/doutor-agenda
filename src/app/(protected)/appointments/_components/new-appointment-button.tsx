"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { doctorsTable, patientsTable } from "@/db/schema";

import NewAppointmentForm from "./new-appointment-form";

interface NewAppointmentButtonProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const NewAppointmentButton = ({
  patients,
  doctors,
}: NewAppointmentButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>Novo Agendamento</Button>
      </DialogTrigger>
      <DialogContent>
        <NewAppointmentForm
          patients={patients}
          doctors={doctors}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentButton;
