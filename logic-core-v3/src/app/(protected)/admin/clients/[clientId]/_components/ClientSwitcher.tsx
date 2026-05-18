'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, Check, ChevronsUpDown, Search } from 'lucide-react'

interface ClientOption {
  id: string
  name: string
  slug: string
}

interface ClientSwitcherProps {
  currentClientId: string
  currentClientName: string
  clients: ClientOption[]
}

export function ClientSwitcher({
  currentClientId,
  currentClientName,
  clients,
}: ClientSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      } else if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filtered = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.slug.toLowerCase().includes(search.toLowerCase()),
  )

  function handleSelect(client: ClientOption) {
    setOpen(false)
    setSearch('')
    router.push(`/admin/clients/${client.id}`)
  }

  return (
    <div className="relative max-w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 transition-colors hover:bg-white/[0.05]"
      >
        <Building2 className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={1.5} />
        <span className="truncate font-medium">{currentClientName}</span>
        <ChevronsUpDown
          className="h-3.5 w-3.5 shrink-0 text-zinc-500"
          strokeWidth={1.5}
        />
        <kbd className="ml-1 hidden rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline-block">
          Ctrl K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
          >
            <div className="border-b border-white/10 p-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
                  strokeWidth={1.5}
                />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full rounded-xl bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:bg-white/[0.06] focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-zinc-500">
                  Sin resultados
                </p>
              ) : (
                filtered.map((client) => {
                  const isActive = client.id === currentClientId

                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelect(client)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? 'bg-cyan-400/15 text-cyan-300'
                          : 'text-zinc-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{client.name}</p>
                        <p className="truncate font-mono text-xs text-zinc-500">
                          {client.slug}
                        </p>
                      </div>
                      {isActive && (
                        <Check
                          className="h-4 w-4 shrink-0 text-cyan-400"
                          strokeWidth={2}
                        />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] p-2 text-[10px] text-zinc-500">
              <span>Ctrl/Cmd K para abrir</span>
              <span>Esc para cerrar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
