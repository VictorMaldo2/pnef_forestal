'use client'

import { useState } from 'react'

export default function JornadaMarcacionForm() {
  const [form, setForm] = useState({
    propietario: '',
    extensionista: '',
    fecha_jornada: '',
    nro_resolucion: '',
    fecha_resolucion: '',
    superficie_total_predio: '',
    superficie_bajo_regimen: '',
    superficie_manejada: '',
    superficie_bosque_nativo: '',
    superficie_anual_planificada: '',
    superficie_marcada: '',
    superficie_marcada_km: '',
    actividades_realizadas: {
      raleo: false,
      poda: false,
      otras: ''
    },
    observaciones: '',
    prescripciones: '',
    medidas_proteccion: '',
    materiales_utilizados: '',
    firmas: {
      extensionista: '',
      supervisor: '',
      propietario: ''
    }
  })

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if(name in form.actividades_realizadas){
      setForm({
        ...form,
        actividades_realizadas: {
          ...form.actividades_realizadas,
          [name]: type === 'checkbox' ? checked : value
        }
      });
    } else if (name in form.firmas) {
      setForm({
        ...form,
        firmas: {
          ...form.firmas,
          [name]: value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Validar campos y enviar datos a Supabase
    console.log('Datos de jornada a enviar:', form);
    // Aquí puedes llamar a la API o usar supabase.from('jornada_marcacion').insert(form)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Registrar Jornada de Marcación</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="propietario" placeholder="Propietario" value={form.propietario} onChange={handleChange} 
                 className="border p-3 rounded w-full" required />
          <input name="extensionista" placeholder="Extensionista" value={form.extensionista} onChange={handleChange} 
                 className="border p-3 rounded w-full" required />
          <input name="fecha_jornada" type="date" value={form.fecha_jornada} onChange={handleChange} 
                 className="border p-3 rounded w-full" required />
          <input name="nro_resolucion" placeholder="N° Resolución" value={form.nro_resolucion} onChange={handleChange} 
                 className="border p-3 rounded w-full" />
          <input name="fecha_resolucion" type="date" value={form.fecha_resolucion} onChange={handleChange} 
                 className="border p-3 rounded w-full" />
        </div>

        {/* Superficies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="superficie_total_predio" type="number" step="0.01" placeholder="Superficie total (ha)" value={form.superficie_total_predio} onChange={handleChange} 
                 className="border p-3 rounded w-full" />
          <input name="superficie_bajo_regimen" type="number" step="0.01" placeholder="Superficie bajo régimen (ha)" value={form.superficie_bajo_regimen} onChange={handleChange} 
                 className="border p-3 rounded w-full" />
          <input name="superficie_manejada" type="number" step="0.01" placeholder="Superficie manejada (ha)" value={form.superficie_manejada} onChange={handleChange}
                 className="border p-3 rounded w-full" />
          <input name="superficie_bosque_nativo" type="number" step="0.01" placeholder="Superficie bosque nativo (ha)" value={form.superficie_bosque_nativo} onChange={handleChange}
                 className="border p-3 rounded w-full" />
          <input name="superficie_anual_planificada" type="number" step="0.01" placeholder="Superficie anual planificada (ha)" value={form.superficie_anual_planificada} onChange={handleChange}
                 className="border p-3 rounded w-full" />
          <input name="superficie_marcada" type="number" step="0.01" placeholder="Superficie marcada (ha)" value={form.superficie_marcada} onChange={handleChange}
                 className="border p-3 rounded w-full" />
          <input name="superficie_marcada_km" type="number" step="0.01" placeholder="Superficie marcada (km)" value={form.superficie_marcada_km} onChange={handleChange}
                 className="border p-3 rounded w-full" />
        </div>

        {/* Actividades checklist */}
        <fieldset>
          <legend className="font-semibold mb-2">Actividades Realizadas</legend>
          <div className="flex flex-col space-y-2">
            <label>
              <input type="checkbox" name="raleo" checked={form.actividades_realizadas.raleo || false} onChange={handleChange} className="mr-2" />
              Raleo
            </label>
            <label>
              <input type="checkbox" name="poda" checked={form.actividades_realizadas.poda || false} onChange={handleChange} className="mr-2" />
              Poda
            </label>
            <label>
              Otra Actividad:
              <input type="text" name="otras" value={form.actividades_realizadas.otras || ''} onChange={handleChange} className="ml-2 border p-1 rounded" />
            </label>
          </div>
        </fieldset>

        {/* Observaciones y prescripciones */}
        <textarea name="observaciones" placeholder="Observaciones" value={form.observaciones} onChange={handleChange} 
                  className="w-full h-24 border p-3 rounded" />
        <textarea name="prescripciones" placeholder="Prescripciones técnicas" value={form.prescripciones} onChange={handleChange} 
                  className="w-full h-24 border p-3 rounded" />
        <textarea name="medidas_proteccion" placeholder="Medidas de protección" value={form.medidas_proteccion} onChange={handleChange} 
                  className="w-full h-24 border p-3 rounded" />
        <textarea name="materiales_utilizados" placeholder="Materiales utilizados (lista separada por comas)" value={form.materiales_utilizados} onChange={handleChange} 
                  className="w-full h-20 border p-3 rounded" />

        {/* Firmas */}
        <input name="firma_extensionista" placeholder="Firma Extensionista (URL o texto)" value={form.firma_extensionista} onChange={handleChange} 
               className="w-full p-3 border rounded mb-4" />
        <input name="firma_supervisor" placeholder="Firma Supervisor (URL o texto)" value={form.firma_supervisor} onChange={handleChange} 
               className="w-full p-3 border rounded mb-4" />
        <input name="firma_propietario" placeholder="Firma Propietario (URL o texto)" value={form.firma_propietario} onChange={handleChange} 
               className="w-full p-3 border rounded mb-6" />

        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded">
          Enviar Jornada
        </button>
      </form>
    </div>
  )
}