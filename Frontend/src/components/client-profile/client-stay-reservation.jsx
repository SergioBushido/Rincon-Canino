import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Notification,
  useToaster,
  DateRangePicker,
} from "rsuite";
import isBefore from "date-fns/isBefore";
import startOfDay from "date-fns/startOfDay";
import { format } from "date-fns";
import PropTypes from "prop-types";

// Servicios
import { getStayAll } from "../../services/stay";
import { createStayClient } from "../../services/stay_client";
import { getClient } from "../../services/client";

// Formateo seguro de fechas
const safeFormat = (date) => {
  if (!date || isNaN(new Date(date).getTime())) return "";
  return format(new Date(date), "yyyy-MM-dd");
};

ClientStayReservation.propTypes = {
  onReservationSuccess: PropTypes.func,
  mascota: PropTypes.object,
};

export default function ClientStayReservation({ onReservationSuccess, mascota }) {
  const [showModal, setShowModal] = useState(false);
  const [stays, setStays] = useState([]);
  const [client, setClient] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const toaster = useToaster();

  // Carga los datos necesarios solo cuando se abre el modal
  useEffect(() => {
    if (showModal) {
      getStayAll()
        .then(setStays)
        .catch(error => {
          console.error("Error al cargar periodos de estancia:", error);
          toaster.push(<Notification type="error" header="Error al cargar periodos" />, { placement: "topEnd" });
        });

      getClient()
        .then(setClient)
        .catch(error => {
          console.error("Error al cargar datos del cliente:", error);
          toaster.push(<Notification type="error" header="Error al cargar perfil" />, { placement: "topEnd" });
        });
    }
  }, [showModal, toaster]);

  const handleOpenModal = () => {
    setSelectedDates([]);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleReserve = async () => {
    if (!selectedDates || selectedDates.length !== 2) {
      toaster.push(<Notification type="error" header="Fechas no válidas" closable>Por favor, selecciona un rango de fechas.</Notification>, { placement: "topEnd" });
      return;
    }

    if (!mascota?.id) {
      toaster.push(<Notification type="error" header="Sin mascota seleccionada" closable>Seleccioná una mascota desde el menú superior antes de reservar.</Notification>, { placement: "topEnd" });
      return;
    }

    if (!client || !client.id) {
      toaster.push(<Notification type="error" header="Error de usuario" closable>No se pudo identificar al cliente. Por favor, inicia sesión de nuevo.</Notification>, { placement: "topEnd" });
      return;
    }

    const [startDate, endDate] = selectedDates;

    // Encuentra el bloque de estancia correspondiente a las fechas seleccionadas
    const selectedStayBlock = stays.find((s) => {
      const blockStart = startOfDay(new Date(s.fecha_inicio));
      const blockEnd = startOfDay(new Date(s.fecha_fin));
      const selStart = startOfDay(startDate);
      const selEnd = startOfDay(endDate);
      return selStart >= blockStart && selEnd <= blockEnd;
    });

    if (!selectedStayBlock) {
      toaster.push(<Notification type="error" header="Rango no válido" closable>El rango debe estar dentro de un único periodo de estancia habilitado.</Notification>, { placement: "topEnd" });
      return;
    }

    try {
      const result = await createStayClient(selectedStayBlock.id, mascota.id, safeFormat(startDate), safeFormat(endDate));

      if (result && result.error) {
        throw new Error(result.error);
      }

      toaster.push(<Notification type="success" header="¡Reserva Realizada!" closable>Tu estancia ha sido confirmada con éxito.</Notification>, { placement: "topEnd" });
      handleCloseModal();
      if (onReservationSuccess) {
        onReservationSuccess();
      }
    } catch (error) {
      toaster.push(<Notification type="error" header="Error en la Reserva" closable>{error.message || "No se pudo completar la reserva."}</Notification>, { placement: "topEnd" });
    }
  };

  return (
    <>
      <div className="p-8 bg-[#161616] border border-white/5 rounded-[2.5rem] shadow-2xl">
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Reserva tu <span className="text-zinc-500">Estancia</span></h3>
        <p className="text-zinc-400 mt-2 mb-4">Consulta la disponibilidad y asegura un lugar para tu mascota.</p>
        {mascota && (
          <p className="text-xs text-zinc-500 mb-6 uppercase tracking-widest font-bold">
            Mascota: <span className="text-brand-violet">{mascota.nombre}</span>
          </p>
        )}
        <button onClick={handleOpenModal} className="relative w-full py-4 group/btn overflow-hidden rounded-2xl transition-all duration-500 shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-violet to-brand-cyan opacity-90 group-hover/btn:scale-105 transition-transform duration-500" />
          <span className="relative text-[10px] font-black uppercase tracking-[0.3em] text-white">Iniciar Reserva</span>
        </button>
      </div>

      <Modal open={showModal} onClose={handleCloseModal} size="sm" className="custom-dark-modal">
        <Modal.Header className="pb-4 border-b border-white/5">
          <Modal.Title className="text-white font-black uppercase tracking-widest text-xs italic">
            Reservar <span className="text-brand-violet">Alojamiento</span>
            {mascota && <span className="text-zinc-500"> — {mascota.nombre}</span>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-8">
          <Form fluid className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">
                Selecciona tu periodo de estancia
              </label>
              <DateRangePicker
                block
                format="dd/MM/yyyy"
                value={selectedDates}
                onChange={setSelectedDates}
                shouldDisableDate={(date) => {
                  if (isBefore(date, startOfDay(new Date()))) return true;
                  if (!stays || stays.length === 0) return true;
                  const d = startOfDay(date);
                  return !stays.some((s) => d >= startOfDay(new Date(s.fecha_inicio)) && d <= startOfDay(new Date(s.fecha_fin)));
                }}
                className="custom-date-range-picker"
                placeholder="Elige las fechas de entrada y salida"
              />
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-2 ml-2">
                Solo se mostrarán los periodos habilitados.
              </p>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="pt-4 border-t border-white/5 space-y-2">
          <button onClick={handleReserve} className="w-full py-4 bg-brand-violet text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-violet-500 transition-colors shadow-lg">Confirmar y Reservar</button>
          <button onClick={handleCloseModal} className="w-full py-3 text-zinc-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors">Cancelar</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}