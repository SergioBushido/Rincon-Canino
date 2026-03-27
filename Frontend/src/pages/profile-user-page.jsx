import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import UserInfo from "../components/client-profile/user-info";
import PetInfo from "../components/client-profile/pet-info";
import BookForm from "../components/client-profile/book-form";

import Navbar from "../components/navbar";
import Footer from "../components/footer";

import ReservationInfo from "../components/client-profile/reservation/reservation-info";
import ClientClassReservation from "../components/client-profile/client-class-reservation";
import Stay from "../components/client-profile/reservation/stay";
import UploadPetPhoto from "../components/client-profile/upload-photos-user";

import { getPet } from "../services/pet";
import { getClient } from "../services/client";
import { useReservClassesStore } from "../stores/reservation-store";

export default function ProfileUserPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [activePetIndex, setActivePetIndex] = useState(0);
  const [showAddPet, setShowAddPet] = useState(false);
  const { reloadReservClasses } = useReservClassesStore();

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getClient(navigate);
        if (userData?.error) {
          navigate("/login");
        } else if (userData?.id === "1") {
          navigate("/profile-admin");
        } else {
          setUser(userData);

          const petData = await getPet(userData.id);
          // Manejar si la API devuelve un array o un objeto único
          const petsList = Array.isArray(petData) ? petData : (petData && petData.id ? [petData] : []);
          setPets(petsList);
        }
      } catch (error) {
        console.error("Error al cargar datos del cliente o mascota:", error);
      }
    }

    fetchData();
  }, [navigate]);

  if (!user) {
    return <p>Cargando datos...</p>;
  }

  // Función para recargar mascotas tras un nuevo registro
  const handlePetAdded = async () => {
    try {
      const petData = await getPet(user.id);
      // Aseguramos que siempre sea un array
      const petsList = Array.isArray(petData) ? petData : (petData && petData.id ? [petData] : []);
      setPets(petsList);
      setShowAddPet(false);
      // Seleccionamos la última mascota (la recién creada)
      if (petsList.length > 0) setActivePetIndex(petsList.length - 1);
    } catch (error) {
      console.error("Error al actualizar lista de mascotas:", error);
    }
  };

  const activePet = pets[activePetIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-12">
        {/* Profile Card Section */}
        <UserInfo
          id={user.id}
          name={user.nombre}
          email={user.email}
          dni={user.dni}
          phone={user.telefono}
        />

        {/* Selector de Mascotas (Tabs) */}
        {pets.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 border-b border-white/5 pb-4 overflow-x-auto">
            {pets.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => {
                  setActivePetIndex(idx);
                  setShowAddPet(false);
                }}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                  activePetIndex === idx && !showAddPet
                    ? "bg-brand-violet text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    : "bg-[#161616] text-zinc-500 hover:text-white hover:bg-[#222]"
                }`}
              >
                {p.nombre}
              </button>
            ))}
            <button
              onClick={() => setShowAddPet(true)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-2 ${
                showAddPet
                  ? "bg-brand-cyan text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  : "bg-[#161616] text-zinc-500 hover:text-brand-cyan hover:bg-[#222]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Nueva Mascota
            </button>
          </div>
        )}

        {/* Contenido Dinámico */}
        {showAddPet || pets.length === 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
             <div className="bg-[#161616] border border-white/5 rounded-3xl p-10 text-center shadow-xl">
              <p className="text-zinc-400 font-medium mb-4">Añade un nuevo integrante a tu familia perruna.</p>
              <BookForm id_cliente={user.id} onSuccess={handlePetAdded} />
            </div>
          </div>
        ) : (
          activePet && (
            <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500" key={activePet.id}>
              <PetInfo pet={activePet} />
              
              <ReservationInfo id_cliente={user.id} id_pet={activePet.id} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <ClientClassReservation onReservationSuccess={() => reloadReservClasses(user.id)} id_cliente={user.id} id_pet={activePet.id} mascota={activePet} />
                <Stay id_cliente={user.id} mascota={activePet} userName={user.nombre} />
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-8 pt-8 border-t border-white/5">
                <UploadPetPhoto petId={activePet.id} />
              </div>
            </div>
          )
        )}

        <div className="flex justify-center pt-12 mt-12 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("token");
              navigate("/login");
            }}
            className="group flex items-center space-x-2 text-zinc-500 hover:text-red-400 transition-colors duration-300 font-bold uppercase tracking-[0.2em] text-xs"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-4 h-4 transform group-hover:rotate-12 transition-transform"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
