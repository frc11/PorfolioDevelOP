'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { completeOnboardingAction } from '@/actions/onboarding-actions'
import { useRouter } from 'next/navigation'
import { ArrowRight, Lock, CheckCircle, Palette, KeyRound, Sparkles } from 'lucide-react'

const brandSchema = z.object({
  primaryColor: z.string().min(1, 'Requerido'),
  secondaryColor: z.string().optional(),
  toneOfVoice: z.string().min(10, 'Describe el tono de forma un poco más detallada.'),
  targetAudience: z.string().min(10, 'Describe a tu cliente ideal un poco más.'),
})

const accessSchema = z.object({
  domainCredentials: z.string().optional(),
  socialCredentials: z.string().optional(),
})

type BrandFormValues = z.infer<typeof brandSchema>
type AccessFormValues = z.infer<typeof accessSchema>

export function OnboardingWizard({ companyName }: { companyName: string }) {
  const [step, setStep] = useState(1)
  const router = useRouter()

  const brandForm = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { primaryColor: '#06b6d4', secondaryColor: '#10b981', toneOfVoice: '', targetAudience: '' }
  })

  const accessForm = useForm<AccessFormValues>({
    resolver: zodResolver(accessSchema),
    defaultValues: { domainCredentials: '', socialCredentials: '' }
  })

  const proceedToBrand = () => setStep(2)
  
  const handleBrandSubmit = async () => {
    const isValid = await brandForm.trigger()
    if (isValid) setStep(3)
  }

  const handleFinalSubmit = async () => {
    const isValid = await accessForm.trigger()
    if (!isValid) return

    setStep(4)

    const data = {
      ...brandForm.getValues(),
      ...accessForm.getValues()
    }

    try {
      const res = await completeOnboardingAction(data)
      
      if (!res.success) {
        setStep(3)
        alert(res.error || "Hubo un error al guardar los datos.")
        return
      }

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2500)
    } catch {
      setStep(3)
      alert("Hubo un error de conexión al guardar los datos.")
    }
  }

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 relative">
      <AnimatePresence mode="wait">
        
        {/* PASO 1: Bienvenida */}
        {step === 1 && (
          <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <Sparkles className="text-cyan-400" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
              Bienvenido a develOP, <br/>
              <span className="text-cyan-400">{companyName}</span>
            </h1>
            <p className="text-zinc-400 text-base leading-relaxed mb-10 max-w-md mx-auto">
              Estamos emocionados de escalar tu ecosistema B2B. Para operar a la velocidad de la luz y sin correos interminables, hemos preparado esta rápida calibración de 2 minutos.
            </p>
            <button
              onClick={proceedToBrand}
              className="group flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-full font-semibold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              Comenzar Calibración
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* PASO 2: Perfil de Marca */}
        {step === 2 && (
          <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="bg-[#111418] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20"><Palette size={20} /></div>
              <h2 className="text-xl font-bold text-white">Identidad de Marca</h2>
            </div>
            
            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Color Primario (Hex)</label>
                  <input {...brandForm.register('primaryColor')} className="w-full bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" placeholder="#000000" />
                  {brandForm.formState.errors.primaryColor && <p className="text-red-400 text-xs mt-1">{brandForm.formState.errors.primaryColor.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Secundario (Hex)</label>
                  <input {...brandForm.register('secondaryColor')} className="w-full bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" placeholder="#10b981" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Tono de Voz</label>
                <textarea {...brandForm.register('toneOfVoice')} className="w-full h-24 resize-none bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Ej: Corporativo pero cercano, sin lenguaje técnico excesivo..." />
                {brandForm.formState.errors.toneOfVoice && <p className="text-red-400 text-xs mt-1">{brandForm.formState.errors.toneOfVoice.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Cliente Ideal (Buyer Persona)</label>
                <textarea {...brandForm.register('targetAudience')} className="w-full h-24 resize-none bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Ej: Directores de clínicas estéticas de Latam buscando automatizar citas..." />
                {brandForm.formState.errors.targetAudience && <p className="text-red-400 text-xs mt-1">{brandForm.formState.errors.targetAudience.message}</p>}
              </div>

              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="text-zinc-500 hover:text-white px-4 py-2 text-sm transition-colors">Atrás</button>
                <button type="button" onClick={handleBrandSubmit} className="bg-white text-black px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-all">Continuar a Accesos</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* PASO 3: Accesos Técnicos */}
        {step === 3 && (
          <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="bg-[#111418] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20"><KeyRound size={20} /></div>
              <h2 className="text-xl font-bold text-white">Delegación de Accesos</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-6 flex items-center gap-1.5"><Lock size={12}/> Envío cifrado directo a tu Bóveda B2B (AES-256)</p>
            
            <form className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Dominio y Hosting (Opcional)</label>
                <textarea {...accessForm.register('domainCredentials')} className="w-full h-20 resize-none bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700" placeholder="URL: ...&#10;Usuario: ...&#10;Contraseña: ..." />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">Redes Sociales (Opcional)</label>
                <textarea {...accessForm.register('socialCredentials')} className="w-full h-20 resize-none bg-[#080a0c] border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700" placeholder="Instagram y LinkedIn manager..." />
              </div>

              <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 text-xs text-zinc-500 leading-relaxed">
                Puedes saltar este paso y proporcionarlos luego directamente desde el Dashboard o mediante 1Password.
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button type="button" onClick={() => setStep(2)} className="text-zinc-500 hover:text-white px-4 py-2 text-sm transition-colors">Atrás</button>
                <button type="button" onClick={handleFinalSubmit} className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                  Finalizar Calibración
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* PASO 4: Carga y Redirección */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 rounded-full border-t-2 border-r-2 border-emerald-500 mb-6"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Construyendo tu ecosistema...</h2>
            <p className="text-zinc-400 text-sm">Validando hashes criptográficos y aprovisionando tu Dashboard C-Level.</p>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-8 flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle size={18} /> Perfil completado con éxito
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
