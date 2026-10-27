import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-violet-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_8px_30px_-8px_var(--accent-glow)] hover:bg-violet-400 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_10px_40px_-6px_var(--accent-glow)]",
        secondary: "bg-ink-50 text-ink-950 hover:bg-white",
        outline: "border border-line-strong bg-white/[0.02] text-foreground hover:border-violet-400/60 hover:bg-violet-500/10",
        ghost: "text-muted hover:bg-white/5 hover:text-foreground",
      },
      size: {
        sm: "h-9 rounded-lg px-3.5 text-sm",
        md: "h-11 rounded-xl px-5 text-sm",
        lg: "h-13 rounded-xl px-7 text-[15px]",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
