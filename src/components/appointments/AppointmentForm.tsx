import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { Dialog, DialogHeader, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { appointmentsApi } from "../../api/appointments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAppointmentDto } from "../../types";
import { customersApi } from "../../api/customers";
import { professionalsApi } from "../../api/professionals";
import { servicesApi } from "../../api/services";
import { businessHoursApi } from "../../api/businessHours";
import { useQuery } from "@tanstack/react-query";

type Props = {
  establishmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AppointmentForm({ establishmentId, open, onOpenChange }: Props) {
  const [customerId, setCustomerId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [serviceId, setServiceId] = useState("");
    const { data: customers = [] } = useQuery({
      queryKey: ["customers", establishmentId],
      queryFn: () => customersApi.getAll(establishmentId),
      enabled: !!establishmentId,
    });
    const { data: professionals = [] } = useQuery({
      queryKey: ["professionals", establishmentId],
      queryFn: () => professionalsApi.getAll(establishmentId),
      enabled: !!establishmentId,
    });
    const { data: services = [] } = useQuery({
      queryKey: ["services", establishmentId],
      queryFn: () => servicesApi.getAll(establishmentId),
      enabled: !!establishmentId,
    });

    // Auto-preenche duração ao selecionar serviço
    const selectedService = services.find((s) => s.id === serviceId);
    React.useEffect(() => {
      if (selectedService) setDurationMinutes(Number(selectedService.durationMinutes));
    }, [selectedService]);
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (payload: CreateAppointmentDto) => appointmentsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments", establishmentId] });
      onOpenChange(false);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      establishmentId,
      customerId,
      professionalId,
      serviceId,
      scheduledDate,
      scheduledTime,
      durationMinutes,
    });
  };

  // Buscar agendamentos do dia para bloquear horários ocupados
  const { data: dayAppointments = [] } = useQuery({
    queryKey: ["appointments", establishmentId, scheduledDate],
    queryFn: () => appointmentsApi.getAll(establishmentId, scheduledDate),
    enabled: !!establishmentId && !!scheduledDate,
  });

  // Buscar horários de funcionamento
  const { data: businessHours = [] } = useQuery({
    queryKey: ["businessHours", establishmentId],
    queryFn: () => businessHoursApi.getAll(establishmentId),
    enabled: !!establishmentId,
  });

  // Geração de slots respeitando horários de funcionamento e bloqueando conflitos
  function generateSlots(): string[] {
    if (!scheduledDate || !durationMinutes) return [];
    
    // Determinar dia da semana (0 = Domingo, 1 = Segunda, etc.)
    const dayOfWeek = new Date(scheduledDate + 'T00:00:00').getDay();
    
    // Buscar horário de funcionamento para o dia selecionado
    const dayHours = businessHours.find(
      (bh) => bh.dayOfWeek === dayOfWeek && bh.isActive
    );
    
    // Se não houver horário configurado, usa padrão 09:00-18:00
    const openTime = dayHours?.openTime || "09:00";
    const closeTime = dayHours?.closeTime || "18:00";
    
    // Se o estabelecimento está fechado neste dia, retorna vazio
    if (!dayHours && businessHours.length > 0) {
      return [];
    }
    
    const [startHour, startMin] = openTime.split(':').map(Number);
    const [endHour, endMin] = closeTime.split(':').map(Number);
    const step = 15; // minutos
    
    // Horários já ocupados pelo profissional
    const taken = new Set(
      professionalId
        ? dayAppointments
            .filter((a: any) => a.professionalId === professionalId)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>
          Novo Agendamento
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="customer">Cliente</Label>
            <Select
              id="customer"
              value={customerId}
              onChange={setCustomerId}
              options={customers.map((c) => ({ value: c.id, label: c.name, subtitle: c.phone }))}
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
              options={services.map((s) => ({ value: s.id, label: s.name, subtitle: `R$ ${Number(s.price).toFixed(2)} • ${s.durationMinutes}min` }))}
              placeholder="Selecione o serviço"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Hora</Label>
              <Select
                id="time"
                value={scheduledTime}
                onChange={setScheduledTime}
                options={timeOptions}
                placeholder={professionalId ? "Selecione um horário" : "Escolha primeiro o profissional"}
              />
              {timeOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum horário disponível para os filtros selecionados.</p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Duração (min)</Label>
            <Input id="duration" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} required />
          </div>
        </form>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
        <Button onClick={onSubmit} disabled={createMutation.isPending}>Salvar</Button>
      </DialogFooter>
    </Dialog>
  );
}
