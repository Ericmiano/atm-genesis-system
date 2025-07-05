import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
      colors: {
        // Modern ATM Genesis Brand Colors
        primary: {
          DEFAULT: "#E91E63", // Wildberry Pink
          light: "#F48FB1",
          dark: "#C2185B",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#9C27B0", // Purple
          light: "#CE93D8",
          dark: "#7B1FA2",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FF5722", // Orange
          light: "#FFAB91",
          dark: "#E64A19",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#4CAF50",
          light: "#81C784",
          dark: "#388E3C",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FF9800",
          light: "#FFB74D",
          dark: "#F57C00",
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#F44336",
          light: "#E57373",
          dark: "#D32F2F",
          foreground: "#FFFFFF",
        },
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EEEEEE",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
          950: "#121212",
        },
        // Dark mode specific colors
        dark: {
          primary: "#1A1A2E", // Deep Navy
          secondary: "#16213E", // Dark Blue
          accent: "#0F3460", // Darker Blue
          surface: "#16213E",
          surfaceVariant: "#1A1A2E",
          onSurface: "#E8E8E8",
          onSurfaceVariant: "#B8B8B8",
        },
        // Shadcn UI Colors with wildberry theme
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 5px #E91E63, 0 0 10px #E91E63, 0 0 15px #E91E63",
          },
          "50%": {
            boxShadow: "0 0 2px #E91E63, 0 0 5px #E91E63, 0 0 8px #E91E63",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "bounce-in": {
          "0%": {
            transform: "scale(0.3)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.05)",
          },
          "70%": {
            transform: "scale(0.9)",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "slide-up": {
          from: {
            transform: "translateY(100%)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.9)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        tilt: {
          "0%, 50%, 100%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(1deg)",
          },
          "75%": {
            transform: "rotate(-1deg)",
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        "pulse-glow": "pulse-glow 2s infinite",
        float: "float 3s ease-in-out infinite",
        "bounce-in": "bounce-in 0.6s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        tilt: "tilt 10s infinite linear",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "banking": "0 4px 20px rgba(233, 30, 99, 0.15)",
        "accent": "0 4px 20px rgba(156, 39, 176, 0.15)",
        "success": "0 4px 20px rgba(76, 175, 80, 0.15)",
        "glow": "0 0 20px rgba(233, 30, 99, 0.3)",
        "glow-accent": "0 0 20px rgba(156, 39, 176, 0.3)",
        "soft": "0 2px 8px rgba(0, 0, 0, 0.08)",
        "medium": "0 4px 16px rgba(0, 0, 0, 0.12)",
        "strong": "0 8px 32px rgba(0, 0, 0, 0.16)",
        "dark": "0 4px 20px rgba(0, 0, 0, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "700": "700ms",
        "800": "800ms",
        "900": "900ms",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
