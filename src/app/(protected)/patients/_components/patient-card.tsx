"use client";

import dayjs from "dayjs";
import { Mars, Phone, Trash, User, UserRoundSearch, Venus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deletePatient } from "@/actions/delete-patient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import UpsertPatientForm from "./upsert-patient-form";

interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
    createdAt?: string | Date;
  };
}

export function PatientCard({ patient }: PatientCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deletePatientAction = useAction(deletePatient, {
    onSuccess: () => {
      toast.success("Paciente deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar paciente");
    },
  });
  const handleDeletePatient = () => {
    deletePatientAction.execute({ id: patient.id });
  };
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials || <User />}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{patient.name}</h3>
            <p className="text-muted-foreground text-sm">{patient.email}</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2">
        <Badge variant="outline">
          {patient.sex === "male" ? (
            <>
              <Mars className="mr-1 inline h-4 w-4" /> Masculino
            </>
          ) : (
            <>
              <Venus className="mr-1 inline h-4 w-4" /> Feminino
            </>
          )}
        </Badge>
        <Badge variant="outline">
          <Phone />
          {patient.phoneNumber}
        </Badge>
        {patient.createdAt && (
          <span className="text-muted-foreground text-xs">
            Cadastrado em: {dayjs(patient.createdAt).format("DD/MM/YYYY")}
          </span>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex flex-col gap-2">
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <UserRoundSearch />
              Ver detalhes
            </Button>
          </DialogTrigger>
          <UpsertPatientForm
            patient={patient}
            onSuccess={() => setIsEditOpen(false)}
            isOpen={isEditOpen}
          />
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash className="mr-2 h-4 w-4" /> Deletar paciente
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que deseja deletar o paciente?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Isso irá deletar o paciente e
                remover seus dados do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePatient}
                disabled={deletePatientAction.status === "executing"}
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export default PatientCard;
