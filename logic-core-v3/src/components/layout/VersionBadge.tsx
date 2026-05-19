const APP_VERSION = 'v1.0.0'

export function VersionBadge() {
  return (
    <span className="font-mono text-[10px] text-zinc-700 transition-colors hover:text-zinc-500 select-none">
      {APP_VERSION}
    </span>
  )
}
