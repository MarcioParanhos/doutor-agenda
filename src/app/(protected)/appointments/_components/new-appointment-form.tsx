"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { createAppointment } from "@/actions/create-appointment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable, patientsTable } from "@/db/schema";

const formSchema = z.object({
  patientId: z.string().uuid({ message: "Selecione um paciente" }),
  doctorId: z.string().uuid({ message: "Selecione um médico" }),
  appointmentPrice: z
    .string()
    .min(1, { message: "Informe o valor da consulta" }),
  date: z.date({ required_error: "Selecione uma data" }),
  time: z.string().min(1, { message: "Selecione um horário" }),
});

type FormValues = z.infer<typeof formSchema>;

interface NewAppointmentFormProps {
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

interface AppointmentSlot {
  date: Date;
  time: string;
}

// Função utilitária para gerar horários disponíveis
function generateTimeSlots(from: string, to: string, interval = 30) {
  const slots: string[] = [];
  let current = dayjs(`2020-01-01T${from}`);
  const end = dayjs(`2020-01-01T${to}`);
  while (current.isBefore(end)) {
    slots.push(current.format("HH:mm"));
    current = current.add(interval, "minute");
  }
  return slots;
}

// Função utilitária para agrupar horários por período
function groupTimesByPeriod(times: string[]) {
  const morning: string[] = [];
  const afternoon: string[] = [];
  const night: string[] = [];
  times.forEach((time) => {
    const [hourStr] = time.split(":");
    const hour = Number(hourStr);
    if (hour < 12) {
      morning.push(time);
    } else if (hour < 18) {
      afternoon.push(time);
    } else {
      night.push(time);
    }
  });
  return { morning, afternoon, night };
}

const NewAppointmentForm = ({
  patients,
  doctors,
  onSuccess,
}: NewAppointmentFormProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<
    (typeof doctors)[0] | undefined
  >();
  const [selectedPatient, setSelectedPatient] = useState<
    (typeof patients)[0] | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>(
    [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentPrice: "",
      date: undefined,
      time: "",
    },
  });

  const { execute, status } = useAction(createAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao criar agendamento");
    },
  });

  const onSubmit = (values: FormValues) => {
    execute(values);
  };

  // Atualiza o valor do médico selecionado
  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    setSelectedDoctor(doctor);
    if (doctor) {
      form.setValue(
        "appointmentPrice",
        (doctor.appointmentPriceInCents / 100).toFixed(2),
      );
    } else {
      form.setValue("appointmentPrice", "");
    }
    form.setValue("doctorId", doctorId);
  };

  // Atualiza o paciente selecionado
  const handlePatientChange = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    setSelectedPatient(patient);
    form.setValue("patientId", patientId);
  };

  useEffect(() => {
    async function fetchAppointments() {
      if (!selectedDoctor || !selectedDate) {
        setAppointmentSlots([]);
        return;
      }
      // Chamada para buscar agendamentos do médico na data selecionada
      const res = await fetch(
        `/api/appointments?doctorId=${selectedDoctor.id}&date=${selectedDate.toISOString()}`,
      );
      const data = await res.json();
      setAppointmentSlots(data.appointments);
    }
    fetchAppointments();
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    form.setValue("time", "");
  }, [selectedDoctor, selectedPatient, selectedDate, form]);

  // Gerar horários disponíveis
  let availableTimes: string[] = [];
  if (selectedDoctor && selectedDate) {
    const allSlots = generateTimeSlots(
      selectedDoctor.availableFromTime,
      selectedDoctor.availableToTime,
    );
    // Filtrar horários já agendados
    const bookedTimes = appointmentSlots.map((a) => a.time);
    availableTimes = allSlots.filter((time) => !bookedTimes.includes(time));
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo agendamento.
          </DialogDescription>
        </DialogHeader>
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => handlePatientChange(value)}
                disabled={patients.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pacientes</SelectLabel>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Médico</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => handleDoctorChange(value)}
                disabled={doctors.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Médicos</SelectLabel>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="appointmentPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da Consulta</FormLabel>
              <FormControl>
                <NumericFormat
                  value={field.value}
                  onValueChange={(values) => field.onChange(values.value)}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  allowNegative={false}
                  fixedDecimalScale
                  decimalScale={2}
                  className="input"
                  customInput={Input}
                  disabled={!selectedDoctor}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!field.value}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                    disabled={!selectedDoctor || !selectedPatient}
                  >
                    <CalendarIcon />
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setSelectedDate(date ?? undefined);
                    }}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => {
            // Converter horários para horário local do navegador
            const localTimes = availableTimes.map((time) => {
              const [h, m] = time.split(":").map(Number);
              const local = new Date();
              local.setHours(h, m, 0, 0);
              return local.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
            });
            // Mapear localTimes para os valores originais
            const timeMap = Object.fromEntries(
              localTimes.map((lt, i) => [lt, availableTimes[i]]),
            );
            const grouped = groupTimesByPeriod(localTimes);
            console.log("Grouped:", grouped);
            return (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                {selectedDoctor && (
                  <div className="text-muted-foreground mb-1 text-xs">
                    Horário do médico: {selectedDoctor.availableFromTime} -{" "}
                    {selectedDoctor.availableToTime}
                  </div>
                )}
                <div className="text-muted-foreground mb-1 text-xs">
                  Horários gerados: {localTimes.join(", ") || "nenhum"}
                </div>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={
                    !selectedDoctor || !selectedPatient || !selectedDate
                  }
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(grouped).map(([period, times]) =>
                      times.length > 0 ? (
                        <SelectGroup key={period}>
                          <SelectLabel>
                            {period === "morning"
                              ? "Manhã"
                              : period === "afternoon"
                                ? "Tarde"
                                : "Noite"}
                          </SelectLabel>
                          {times.map((localTime) => (
                            <SelectItem
                              key={localTime}
                              value={timeMap[localTime]}
                            >
                              {localTime}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ) : null,
                    )}
                  </SelectContent>
                </Select>
                {!selectedDoctor && (
                  <div className="text-muted-foreground mt-2 text-sm">
                    Selecione um médico
                  </div>
                )}
                {selectedDoctor &&
                  (!selectedDoctor.availableFromTime ||
                    !selectedDoctor.availableToTime) && (
                    <div className="text-destructive mt-2 text-sm">
                      Médico sem horário de atendimento configurado
                    </div>
                  )}
                {selectedDoctor &&
                  selectedDate &&
                  availableTimes.length === 0 && (
                    <div className="text-muted-foreground mt-2 text-sm">
                      Nenhum horário disponível para este dia
                    </div>
                  )}
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <DialogFooter>
          <Button type="submit" disabled={status === "executing"}>
            {status === "executing" ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default NewAppointmentForm;
