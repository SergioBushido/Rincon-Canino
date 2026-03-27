import { Notification, useToaster, CustomProvider } from "rsuite";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./reservation.css";

import { formatDate } from "./utils";
import { getClassesByName } from "../../../services/class";
import { getStayReservationsByClientName } from "../../../services/stay_client";
import ClientStayReservation from "../client-stay-reservation";

Stay.propTypes = {
  id_cliente: PropTypes.string.isRequired,
  mascota: PropTypes.shape({
    id: PropTypes.string.isRequired,
    condicion_especial: PropTypes.bool.isRequired,
  }).isRequired,
  userName: PropTypes.string.isRequired
};

export default function Stay({ id_cliente, mascota, userName }) {
  const [userStays, setUserStays] = useState([])
  const [userClasses, setUserClasses] = useState([])

  const toaster = useToaster();

  const fetchClientStays = async () => {
    try {
      const stays = await getStayReservationsByClientName(userName);
      setUserStays(stays);
    } catch (error) {
      toaster.push(
        <Notification type="error" header="Error cargando tus estancias." />,
        { placement: "topEnd" }
      );
    }
  };

  useEffect(() => {
    const fetchClientClasses = async () => {
      try {
        const classes = await getClassesByName(userName);
        setUserClasses(classes);
      } catch (error) {
        toaster.push(
          <Notification type="error" header="Error cargando tus clases." />,
          { placement: "topEnd" }
        );
      }
    }

    fetchClientClasses();
    fetchClientStays();
  }, [userName, toaster]);

  if (!mascota?.id) {
    return (
      <div className="p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center">
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
          Regresa a la pestaña "Información" para registrar una mascota.
        </p>
      </div>
    );
  }

  return (
    <CustomProvider theme="dark">
      <div className="space-y-10">
        {/* Booking Card */}
        <ClientStayReservation onReservationSuccess={fetchClientStays} mascota={mascota} />
      </div>
    </CustomProvider>
  );
}
