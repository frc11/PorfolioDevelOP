'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, FileText, Database, ChevronRight, Briefcase } from 'lucide-react'
import { ProjectManager } from './ProjectManager'
import { VaultManager } from './VaultManager'

// Simplified type for the frontend
type ClientData = any

export function CommandCenterClient({ initialClients }: { initialClients: ClientData[] }) {
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)]">
      {/* Left Sidebar: Client List */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-4">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2 mb-2">
          <Users size={16} /> CLIENTES ACTIVOS
        </h2>
        {initialClients.map((client) => {
          const activeProject = client.projects[0]
          const pendingApprovalCount = activeProject?.tasks?.length || 0

          return (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`text-left p-4 rounded-xl border transition-all duration-300 ${
                selectedClient?.id === client.id
                  ? 'border-cyan-500/50 bg-cyan-500/10'
                  : 'border-white/5 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-zinc-200 truncate">{client.companyName}</span>
                <ChevronRight size={16} className={selectedClient?.id === client.id ? 'text-cyan-400' : 'text-zinc-600'} />
              </div>
              <div className="flex flex-col gap-1.5 mt-3">
                <div className="flex items-center gap-2 text-xs">
                  <Briefcase size={12} className={activeProject ? 'text-emerald-400' : 'text-zinc-500'} />
                  <span className={activeProject ? 'text-emerald-400/80' : 'text-zinc-500'}>
                    {activeProject ? 'Proyecto activo' : 'Sin proyectos'}
                  </span>
                </div>
                {pendingApprovalCount > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <FileText size={12} className="text-amber-400" />
                    <span className="text-amber-400/80">
                      {pendingApprovalCount} entregable(s) pdte. rev.
                    </span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
        {initialClients.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-10">No hay clientes activos.</p>
        )}
      </div>

      {/* Main Area: Detail & Forms */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0e12] p-6 relative">
        <AnimatePresence mode="wait">
          {!selectedClient ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-zinc-500"
            >
              <Database size={48} className="mb-4 opacity-20" />
              <p>Selecciona un cliente para gestionar sus aprobaciones y bóveda.</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedClient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-8"
            >
              <div className="border-b border-white/5 pb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedClient.companyName}</h2>
                <div className="flex gap-4 text-sm text-zinc-400">
                  <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    ID: {selectedClient.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Project Manager Form */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
                    <Briefcase size={18} className="text-cyan-400" /> Gestor de Entregables
                  </h3>
                  <p className="text-xs text-zinc-500">Crea tareas para enviar al cliente para su aprobación en la vista de su dashboard.</p>
                  
                  {selectedClient.projects[0] ? (
                    <ProjectManager projectId={selectedClient.projects[0].id} organizationId={selectedClient.id} />
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-red-500/20 bg-red-500/5 text-sm text-red-400">
                      Este cliente no tiene un proyecto en curso (`IN_PROGRESS`). Se debe crear un proyecto primero.
                    </div>
                  )}
                </div>

                {/* Vault Manager Form */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
                    <Database size={18} className="text-emerald-400" /> Bóveda del Cliente
                  </h3>
                  <p className="text-xs text-zinc-500">Sube links como guías de marca, archivos RAW, diseños de Figma, etc.</p>
                  
                  <VaultManager organizationId={selectedClient.id} />
                  
                  {/* Visual list of created assets could go here */}
                  {selectedClient.clientAssets?.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Añadidos recientemente</h4>
                      {selectedClient.clientAssets.slice(0, 3).map((asset: any) => (
                        <div key={asset.id} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                          <span className="text-sm text-zinc-300 truncate">{asset.name}</span>
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{asset.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
