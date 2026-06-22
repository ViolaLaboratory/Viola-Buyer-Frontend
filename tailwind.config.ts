import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        dm: ['"DM Sans"', 'Zen Dots'],
        zen: ['"Zen Dots"', 'sans-serif'],
        exo: ['"Exo 2"', 'sans-serif'],
      },
      colors: {
        /* Pass 2 brand palette — pulled from the real app gradient (source of truth) */
        amber: "#FFD65C",
        orange: "#F76213",
        "red-orange": "#E0481F",
        magenta: "#C81FB5",
        violet: "#7A23CC",
        "purple-deep": "#2D0351",
        ink: "#16042F",
        "ink-900": "#100020",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        player: {
          DEFAULT: "hsl(var(--player-background))",
        },
        hover: {
          row: "hsl(var(--hover-row))",
        },
        badge: {
          genre: "hsl(var(--badge-genre))",
          mood: "hsl(var(--badge-mood))",
          licensing: "hsl(var(--badge-licensing))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      transitionTimingFunction: {
        /* Pass 2 motion — crisper than the built-in CSS curves */
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px) scale(0.95)",
            filter: "blur(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
            filter: "blur(0)",
          },
        },
        "glow-rotate": {
          "0%": {
            boxShadow: "0 0 0px rgba(255,255,255,0)",
          },
          "100%": {
            boxShadow: "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.25)",
          },
        },
        "flip-up": {
          "0%": {
            opacity: "0",
            transform: "perspective(1000px) rotateX(-90deg)",
            transformOrigin: "bottom",
          },
          "100%": {
            opacity: "1",
            transform: "perspective(1000px) rotateX(0deg)",
            transformOrigin: "bottom",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "accordion-up": "accordion-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-up": "fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-rotate": "glow-rotate 0.4s ease-out forwards",
        "flip-up": "flip-up 2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
