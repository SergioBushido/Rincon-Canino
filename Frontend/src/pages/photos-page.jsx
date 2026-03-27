import Navbar from "../components/navbar";
import NavbarAdmin from "../components/navbar-admin";
import Footer from "../components/footer";

import { useEffect, useState } from "react";
import { CustomProvider } from "rsuite";

// Importa tus servicios para llamadas a la API
import { getClient } from "../services/client";
import { getPet } from "../services/pet";
import { getPhotos, getPhotosByPet, deletePhoto, BASE_URL } from "../services/photos";

export default function PhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [noPhotos, setNoPhotos] = useState(false);  // Estado para verificar si no hay fotos
  const [user, setUser] = useState(null);
  const [, setPet] = useState(null);

  const handleDeletePhoto = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta foto?")) {
      try {
        await deletePhoto(id);
        // Remove the deleted photo from the state
        setPhotos(photos.filter(p => p.id !== id));
        if (photos.length === 1) { // If the last photo is deleted
          setNoPhotos(true);
        }
      } catch (error) {
        console.error("Error al eliminar la foto:", error);
      }
    }
  };

  useEffect(() => {
    getClient().then((user) => {
      if (!user || user.error) return;
      setUser(user);

      if (user.id === "1") {
        getPhotos()
          .then((data) => {
            if (data && data.length > 0) {
              setPhotos(data);
              setNoPhotos(false);
            } else {
              setNoPhotos(true);
            }
          })
          .catch(() => setNoPhotos(true));
      } else {
        getPet(user.id).then((petData) => {
          const petsList = Array.isArray(petData) ? petData : (petData && petData.id ? [petData] : []);
          if (petsList.length === 0) {
            setNoPhotos(true);
            return;
          }
          const primaryPet = petsList[0];
          setPet(primaryPet);
          
          getPhotosByPet(primaryPet.id)
            .then((data) => {
              if (data && data.length > 0) {
                setPhotos(data);
                setNoPhotos(false);
              } else {
                setNoPhotos(true);
              }
            })
            .catch(() => setNoPhotos(true));
        });
      }
    });
  }, []);

  return (
    <CustomProvider theme="dark">
      <div className="min-h-screen bg-[#101010] text-zinc-400 font-sans selection:bg-brand-cyan/30 selection:text-white overflow-x-hidden">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-cyan/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-violet/5 blur-[120px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {user && user.id === "1" ? <NavbarAdmin /> : <Navbar />}

        <main className="relative z-10 m-auto max-w-screen-xl w-full px-6 py-28 space-y-16">
          <div className="space-y-4 text-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-cyan">Galería de Recuerdos</h2>
            <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">
              Momentos <span className="text-zinc-600">Caninos</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-cyan to-brand-violet mx-auto rounded-full" />
          </div>

          <div className="flex flex-wrap gap-8 justify-center min-h-[400px]">
            {noPhotos ? (
              <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                <svg className="w-16 h-16 text-zinc-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Sin fotos disponibles en este momento</p>
              </div>
            ) : (
              photos.map((photo) => {
                const rutaImagen = photo.contenido.replace(/\\/g, "/");
                return (
                  <div key={photo.id} className="group relative w-full md:w-[400px] aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-[#161616] border border-white/5 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-white/10">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      src={`${BASE_URL}/${rutaImagen}`}
                      alt="Mascota"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {user && (
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-6 right-6 p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl backdrop-blur-md transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
                        title="Eliminar de la galería"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}

                    <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <span className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
                        Mascota Rinconera
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-20 border-t border-white/5 mx-auto max-w-lg text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">Cada foto es un recuerdo guardado para siempre en Rincón Canino</p>
          </div>

          <Footer />
        </main>
      </div>
    </CustomProvider>
  );
}
