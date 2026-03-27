import PropTypes from "prop-types";
import { useState } from "react";
import { updateClient } from "../../services/client";
import { Notification, useToaster } from "rsuite";

ChangeDataForm.propTypes = {
  id: PropTypes.string,
  phone: PropTypes.string,
  email: PropTypes.string,
};

const telefonoRegexp = new RegExp(/^\d{9}$/);
const emailRegexp = new RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/);

export default function ChangeDataForm({ id, phone, email }) {
  const toaster = useToaster();
  const [loading, setLoading] = useState(false);

  const [telefono, setTelefono] = useState({
    value: phone,
    error: false,
    touched: false,
  });

  const [emailAddres, setEmailAddress] = useState({
    value: email,
    error: false,
    touched: false,
  });

  const handleTelefonoChange = (e) => {
    setTelefono({
      ...telefono,
      value: e.target.value,
    });
  };

  const handleTelefonoBlur = () => {
    setTelefono({
      ...telefono,
      error: !telefonoRegexp.test(telefono.value),
      touched: true,
    });
  };

  const handleEmailChange = (e) => {
    setEmailAddress({
      ...emailAddres,
      value: e.target.value,
    });
  };

  const handleEmailBlur = () => {
    setEmailAddress({
      ...emailAddres,
      error: !emailRegexp.test(emailAddres.value),
      touched: true,
    });
  };

  const handleSubmit = async () => {
    if (telefono.error || emailAddres.error) return;

    setLoading(true);
    try {
      const response = await updateClient({ 
        id, 
        telefono: telefono.value, 
        email: emailAddres.value 
      });

      if (response && !response.error) {
        toaster.push(
          <Notification type="success" header="Éxito" closable>
            Datos actualizados correctamente
          </Notification>,
          { placement: "topEnd" }
        );
        // Pequeño retardo para que se vea la notificación antes de recargar
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error(response?.error || "Error al actualizar");
      }
    } catch (error) {
      toaster.push(
        <Notification type="error" header="Error" closable>
          {error.message || "No se pudieron actualizar los datos"}
        </Notification>,
        { placement: "topEnd" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teléfono Field */}
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="block text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1"
          >
            Teléfono
          </label>
          <div className="relative group/input">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={telefono.value}
              onChange={handleTelefonoChange}
              onBlur={handleTelefonoBlur}
              placeholder="123456789"
              className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none transition-all duration-300 ${
                telefono.error && telefono.touched 
                  ? "border-red-500/50 bg-red-500/5" 
                  : "border-white/10 group-hover/input:border-white/20 focus:border-brand-cyan/50 focus:bg-brand-cyan/5"
              }`}
            />
            {telefono.error && telefono.touched && (
              <p className="mt-2 text-[10px] font-bold text-red-400 uppercase tracking-wider ml-1 animate-in fade-in slide-in-from-top-1">
                ❌ Debe tener exactamente 9 dígitos
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-1"
          >
            Correo electrónico
          </label>
          <div className="relative group/input">
            <input
              type="email"
              id="email"
              name="email"
              value={emailAddres.value}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="ejemplo@correo.com"
              className={`w-full bg-white/5 border rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none transition-all duration-300 ${
                emailAddres.error && emailAddres.touched 
                  ? "border-red-500/50 bg-red-500/5" 
                  : "border-white/10 group-hover/input:border-white/20 focus:border-brand-cyan/50 focus:bg-brand-cyan/5"
              }`}
            />
            {emailAddres.error && emailAddres.touched && (
              <p className="mt-2 text-[10px] font-bold text-red-400 uppercase tracking-wider ml-1 animate-in fade-in slide-in-from-top-1">
                ❌ Email no válido
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={loading || telefono.error || emailAddres.error}
          onClick={handleSubmit}
          className={`relative group px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 overflow-hidden ${
            loading || telefono.error || emailAddres.error
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-brand-cyan text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
          }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
