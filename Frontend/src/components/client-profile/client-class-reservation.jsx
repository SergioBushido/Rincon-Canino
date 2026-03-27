import { useState, useEffect } from "react";
import {
  Modal,
  Notification,
  useToaster,
  DatePicker,
  RadioGroup,
  Radio,
  Toggle,
} from "rsuite";
import PropTypes from "prop-types";
import isBefore from "date-fns/isBefore";
import startOfDay from "date-fns/startOfDay";
import { format } from "date-fns";

// Services
import { getIndividualClassAvailable, getAvailableClass } from "../../services/class";
import { createReservation } from "../../services/class_client";
import { getClient } from "../../services/client";

// Utils
import { getDates, getHours, getReservation, formatDate, shouldDisableDate } from "./reservation/utils";

ClientClassReservation.propTypes = {
  onReservationSuccess: PropTypes.func,
  mascota: PropTypes.object,
};

export default function ClientClassReservation({ onReservationSuccess, mascota }) {
  const [showModal, setShowModal] = useState(false);
  const [isGroupClass, setIsGroupClass] = useState(false);

  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState("");
  const [showHours, setShowHours] = useState(false);

  const [client, setClient] = useState(null);

  const toaster = useToaster();

  useEffect(() => {
    if (showModal) {
      setSelectedDate(null);
      setSelectedHour("");
      setShowHours(false);

      getClient()
        .then(setClient)
        .catch(error => {
          console.error("Error al cargar datos del cliente:", error);
          toaster.push(<Notification type="error" header="Error al cargar perfil" />, { placement: "topEnd" });
        });

      const fetchClasses = async () => {
        try {
          if (isGroupClass) {
            const data = await getAvailableClass();
            setAvailableClasses(data.clasesDisponiblesGrupal || []);
          } else {
            const data = await getIndividualClassAvailable();
            setAvailableClasses(data || []);
          }
        } catch (error) {
          console.error("Error al cargar clases:", error);
          toaster.push(<Notification type="error" header="Error al cargar clases" />, { placement: "topEnd" });
        }
      };

      fetchClasses();
    }
  }, [showModal, isGroupClass, toaster]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleReserve = async () => {
    if (!selectedDate || !selectedHour) {
      toaster.push(<Notification type="error" header="Por favor, selecciona una fecha y una hora." closable />, { placement: "topEnd" });
      return;
    }

    if (!client || !client.id) {
      toaster.push(<Notification type="error" header="Error de usuario" closable>No se pudo identificar al cliente.</Notification>, { placement: "topEnd" });
      return;
    }

    if (!mascota?.id) {
      toaster.push(<Notification type="error" header="Selecciona una mascota" closable>Seleccioná una mascota desde el menú superior antes de reservar.</Notification>, { placement: "topEnd" });
      return;
    }

    const reservationId = getReservation(availableClasses, selectedDate, selectedHour);

    if (!reservationId) {
      toaster.push(<Notification type="error" header="Error en la reserva" closable>No se pudo encontrar la clase seleccionada.</Notification>, { placement: "topEnd" });
      return;
    }

    try {
      const result = await createReservation(reservationId, mascota.id);

      if (result && result.error) {
        throw new Error(result.error);
      }

      toaster.push(<Notification type="success" header="¡Reserva Realizada!" closable>Tu clase ha sido confirmada con éxito.</Notification>, { placement: "topEnd" });
      handleCloseModal();
      if (onReservationSuccess) {
        onReservationSuccess();
      }
    } catch (error) {
      toaster.push(<Notification type="error" header="Error en la Reserva" closable>{error.message || "No se pudo completar la reserva."}</Notification>, { placement: "topEnd" });
    }
  };

  const abledDates = getDates(availableClasses);

  return (
    <>
      <div className="p-8 bg-[#161616] border border-white/5 rounded-[2.5rem] shadow-2xl h-full flex flex-col">
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Reserva tu <span className="text-zinc-500">Clase</span></h3>
        <p className="text-zinc-400 mt-2 mb-6">Consulta los horarios y únete a nuestras sesiones de entrenamiento.</p>
        {mascota && (
          <p className="text-xs text-zinc-500 mb-4 uppercase tracking-widest font-bold">
            Mascota: <span className="text-brand-cyan">{mascota.nombre}</span>
          </p>
        )}
        <button onClick={handleOpenModal} className="relative w-full py-4 group/btn overflow-hidden rounded-2xl transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] mt-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-brand-violet opacity-90 group-hover/btn:scale-105 transition-transform duration-500" />
          <span className="relative text-[10px] font-black uppercase tracking-[0.3em] text-white">Reservar Clase</span>
        </button>
      </div>

      <Modal open={showModal} onClose={handleCloseModal} size="lg" className="custom-dark-modal">
        <Modal.Header className="pb-4 border-b border-white/5">
          <Modal.Title className="text-white font-black uppercase tracking-widest text-xs italic">
            Reservar <span className={isGroupClass ? "text-brand-violet" : "text-brand-cyan"}>Entrenamiento</span>
            {mascota && <span className="text-zinc-500"> — {mascota.nombre}</span>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Info & Hours */}
            <div className="space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    {isGroupClass ? 'Entrena en ' : 'Entrenamiento '}
                    <span className="text-zinc-500">{isGroupClass ? 'comunidad' : 'personalizado'}</span>
                  </h3>
                  <Toggle
                    checked={isGroupClass}
                    onChange={setIsGroupClass}
                    checkedChildren="Grupal"
                    unCheckedChildren="Individual"
                  />
                </div>

                {showHours ? (
                  <div className="space-y-4 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-left-4 duration-500">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">
                      Horarios para el {selectedDate ? format(selectedDate, "dd/MM/yyyy") : ""}
                    </label>
                    <div className="bg-[#1e1e1e]/50 rounded-2xl p-6 border border-white/5">
                      <RadioGroup
                        name="radioGroup"
                        inline
                        value={selectedHour}
                        onChange={setSelectedHour}
                        className="flex flex-wrap gap-4"
                      >
                        {getHours(availableClasses, selectedDate).map((hour) => {
                          const findClase = availableClasses.find(
                            (c) => c.fecha === formatDate(selectedDate) && c.hora_inicio === hour
                          );
                          return (
                            <Radio
                              key={hour}
                              value={hour}
                              className={`!flex items-center space-x-2 text-sm font-bold text-zinc-300 hover:text-${isGroupClass ? 'brand-violet' : 'brand-cyan'} transition-colors`}
                            >
                              <span className="text-zinc-200">{hour}</span>
                              <span className="text-[10px] font-black bg-white/5 px-2 py-0.5 rounded text-zinc-500">
                                CUPO: {findClase?.cupo}
                              </span>
                            </Radio>
                          );
                        })}
                      </RadioGroup>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center">
                    <p className="text-zinc-600 text-sm font-medium">Selecciona un día en el calendario</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Calendar */}
            <div className="space-y-4">
              <div className="bg-[#1e1e1e] border border-white/10 rounded-[2.5rem] p-4 shadow-2xl">
                <DatePicker
                  inline
                  value={selectedDate}
                  shouldDisableDate={(date) =>
                    shouldDisableDate(date, abledDates) || isBefore(date, startOfDay(new Date()))
                  }
                  onChange={(date) => {
                    setSelectedDate(date);
                    setShowHours(true);
                    setSelectedHour("");
                  }}
                  className="custom-inline-picker"
                  format="dd/MM/yyyy"
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="pt-4 border-t border-white/5 space-y-2">
          <button onClick={handleReserve} className={`w-full py-4 ${isGroupClass ? 'bg-brand-violet' : 'bg-brand-cyan'} text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-opacity-80 transition-colors shadow-lg`}>Confirmar y Reservar</button>
          <button onClick={handleCloseModal} className="w-full py-3 text-zinc-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors">Cancelar</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}