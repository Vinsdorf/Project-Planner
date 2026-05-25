'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Přehled', href: '/' },
  { label: 'Gantt', href: '/gantt' },
  { label: 'Board', href: '/board' },
  { label: 'Zdroje', href: '/resources' },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        background: '#1a1d27',
        borderBottom: '1px solid #2a2d37',
        display: 'flex',
        gap: '4px',
        padding: '0 16px',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#3b82f6' : '#9ca3af',
              borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
