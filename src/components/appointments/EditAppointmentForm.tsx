import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { Dialog, DialogHeader, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { appointmentsApi } from "../../api/appointments";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { Appointment } from "../../types";
import { customersApi } from "../../api/customers";
import { professionalsApi } from "../../api/professionals";
import { servicesApi } from "../../api/services";
import { businessHoursApi } from "../../api/businessHours";
import toast from "react-hot-toast";

type Props = {
  establishmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
};

export function EditAppointmentForm({ establishmentId, open, onOpenChange, appointment }: Props) {
  const [customerId, setCustomerId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [notes, setNotes] = useState("");

  const { data: customers = [] } = useQuery({
    queryKey: ["customers", establishmentId],
    queryFn: () => customersApi.getAll(establishmentId),
    enabled: !!establishmentId && open,
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals", establishmentId],
    queryFn: () => professionalsApi.getAll(establishmentId),
    enabled: !!establishmentId && open,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", establishmentId],
    queryFn: () => servicesApi.getAll(establishmentId),
    enabled: !!establishmentId && open,
  });

  // Preencher form com dados do agendamento
  useEffect(() => {
    if (appointment) {
      setCustomerId(appointment.customerId);
      setProfessionalId(appointment.professionalId ?? "");
      setServiceId(appointment.serviceId ?? "");
      setScheduledDate(appointment.scheduledDate);
      setScheduledTime(appointment.scheduledTime);
      setDurationMinutes(appointment.durationMinutes);
      setNotes(appointment.notes || "");
    }
  }, [appointment, open]);

  // Auto-preenche duração ao selecionar serviço
  const selectedService = services.find((s) => s.id === serviceId);
  useEffect(() => {
    if (selectedService && !appointment) {
      setDurationMinutes(Number(selectedService.durationMinutes));
    }
  }, [selectedService, appointment]);
  
  // Limpar horário ao mudar profissional (exceto no carregamento inicial)
  useEffect(() => {
    if (appointment && professionalId !== appointment.professionalId) {
      setScheduledTime("");
    }
  }, [professionalId, appointment]);

  const qc = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; updates: any }) =>
      appointmentsApi.update(payload.id, payload.updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento atualizado com sucesso!");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Erro ao atualizar agendamento");
    },
  });

  // Buscar agendamentos do dia para bloquear horários ocupados
  const { data: dayAppointments = [] } = useQuery({
    queryKey: ["appointments", establishmentId, scheduledDate],
    queryFn: () => appointmentsApi.getAll(establishmentId, scheduledDate),
    enabled: !!establishmentId && !!scheduledDate && open,
  });

  // Buscar horários de funcionamento
  const { data: businessHours = [] } = useQuery({
    queryKey: ["businessHours", establishmentId],
    queryFn: () => businessHoursApi.getAll(),
    enabled: !!establishmentId && open,
  });

  // Geração de slots respeitando horários de funcionamento e bloqueando conflitos
  function generateSlots(): string[] {
    if (!scheduledDate || !durationMinutes) return [];

    const dayOfWeek = new Date(scheduledDate + "T00:00:00").getDay();
    const dayHours = businessHours.find(
      (bh) => bh.dayOfWeek === dayOfWeek && bh.isOpen
    );

    const openTime = dayHours?.openTime || "09:00";
    const closeTime = dayHours?.closeTime || "18:00";

    if (!dayHours && businessHours.length > 0) {
      return [];
    }

    const [startHour, startMin] = openTime.split(":").map(Number);
    const [endHour, endMin] = closeTime.split(":").map(Number);
    const step = 15;

    // Horários ocupados (exceto o agendamento atual)
    const taken = new Set(
      professionalId
        ? dayAppointments
            .filter((a: any) => 
              a.professionalId === professionalId && 
              a.id !== appointment?.id // Excluir o próprio agendamento
            )
            .map((a: any) => a.scheduledTime.substring(0, 5))
        : []
    );

    const slots: string[] = [];
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const time = `${hh}:${mm}`;

      if (!taken.has(time)) {
        slots.push(time);
      }

      currentMinutes += step;
    }

    return slots;
  }

  const timeOptions = generateSlots().map((t) => ({ value: t, label: t }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointment) return;

    updateMutation.mutate({
      id: appointment.id,
      updates: {
        customerId,
        professionalId,
        serviceId,
        scheduledDate,
        scheduledTime,
        durationMinutes,
        notes: notes.trim() || undefined,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Editar Agendamento</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Cliente</Label>
            <Select
              id="customer"
              value={customerId}
              onChange={setCustomerId}
              options={customers.map((c) => ({
                value: c.id,
                label: c.name,
                subtitle: c.phone,
              }))}
              placeholder="Selecione o cliente"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="professional">Profissional</Label>
            <Select
              id="professional"
              value={professionalId}
              onChange={setProfessionalId}
              options={professionals.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Selecione o profissional"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="service">Serviço</Label>
            <Select
              id="service"
              value={serviceId}
              onChange={setServiceId}
              options={services.map((s) => ({
                value: s.id,
                label: s.name,
                subtitle: `R$ ${Number(s.price).toFixed(2)} • ${s.durationMinutes}min`,
              }))}
              placeholder="Selecione o serviço"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Horário</Label>
              <Select
                id="time"
                value={scheduledTime}
                onChange={setScheduledTime}
                options={timeOptions}
                placeholder={professionalId ? "Selecione um horário" : "Escolha primeiro o profissional"}
                disabled={!professionalId}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o agendamento..."
              className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </form>
      </DialogContent>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
