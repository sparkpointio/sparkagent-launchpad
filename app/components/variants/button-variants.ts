import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: "inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  variants: {
    variant: {
      default: "bg-primary text-white hover:bg-primary-dark",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border border-black text-black hover:bg-[#EBEBEB]",
      ghost: "bg-[#EBEBEB] text-black hover:bg-gray-200",
    },
    size: {
      sm: "h-8 px-4 rounded-full",
      md: "h-10 px-6 rounded-full",
      lg: "h-12 px-8 rounded-full",
      xl: "h-14 px-10 rounded-full",
      "2xl": "h-16 px-12 rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});
