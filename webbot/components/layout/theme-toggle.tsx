'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/cn'

const OPTIONS = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'system', label: 'Sistem', icon: Monitor },
] as const

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // The resolved theme is unknown until after hydration; rendering the icon
  // before then would produce a server/client mismatch.
  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('text-muted-foreground', className)}
          aria-label="Ubah tema warna"
        >
          {mounted ? (
            isDark ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )
          ) : (
            <span className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Tampilan</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(theme === option.value && 'text-primary')}
          >
            <option.icon />
            {option.label}
            {theme === option.value ? (
              <span className="ml-auto text-label uppercase text-primary">aktif</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
