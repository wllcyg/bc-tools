"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-zinc-200 focus-visible:ring-zinc-950 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-zinc-50 data-[state=checked]:border-zinc-900 size-4 shrink-0 rounded-[4px] border shadow-xs transition-all outline-none focus-visible:ring-2 dark:border-zinc-800 dark:focus-visible:ring-zinc-300 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:text-zinc-900 dark:data-[state=checked]:border-zinc-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
