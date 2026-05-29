import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type BrandMarkProps = {
  href?: string
  tagline?: string
  className?: string
  size?: 'sm' | 'md'
  onClick?: () => void
}

const sizeMap = {
  sm: { box: 'h-8 w-8', title: 'text-sm', tagline: 'text-[10px]' },
  md: { box: 'h-9 w-9', title: 'text-base', tagline: 'text-[10px]' },
} as const

export function BrandMark({
  href,
  tagline,
  className,
  size = 'md',
  onClick,
}: BrandMarkProps) {
  const s = sizeMap[size]

  const content = (
    <>
      <div className={cn('relative shrink-0', s.box)}>
        <Image
          src="/logodevelOP.svg"
          alt="develOP"
          fill
          sizes="36px"
          priority
          className="object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>
      <div className="min-w-0 leading-tight">
        <p className={cn('truncate font-medium tracking-tight text-white', s.title)}>
          devel<span className="text-cyan-400">OP</span>
        </p>
        {tagline && (
          <p className={cn('truncate text-zinc-500', s.tagline)}>{tagline}</p>
        )}
      </div>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn('group flex items-center gap-3', className)}
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>{content}</div>
  )
}
