/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in':       'fade-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
  			'fade-in-up':    'fade-in-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
  			'slide-right':   'slide-in-right 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
  			'scale-in':      'scale-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
  			'float':         'float 6s ease-in-out infinite',
  			'shimmer':       'shimmer 2s linear infinite',
  			'spin-slow':     'spin-slow 12s linear infinite',
  			'gradient-x':    'gradient-x 8s ease infinite',
  			'slide-up-fade': 'slide-up-fade 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
  			'glow-ring':     'glow-ring 2s ease-in-out infinite',
  			'ticker':        'ticker-scroll 30s linear infinite',
  			'count-up':      'count-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
  			'ping-slow':     'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
  		},
  		fontFamily: {
  			'display': ['Instrument Serif', 'Georgia', 'serif'],
  			'sans':    ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  			'mono':    ['Fira Code', 'JetBrains Mono', 'Cascadia Code', 'monospace'],
  		},
  		boxShadow: {
  			'brand': '0 0 0 1px rgba(59,130,246,0.5), 0 4px 16px rgba(59,130,246,0.2)',
  			'glow-blue': '0 0 20px rgba(59,130,246,0.25), 0 0 60px rgba(59,130,246,0.10)',
  			'glow-violet': '0 0 20px rgba(139,92,246,0.25), 0 0 60px rgba(139,92,246,0.10)',
  			'glow-gold': '0 0 20px rgba(245,158,11,0.25), 0 0 60px rgba(245,158,11,0.10)',
  			'glow-emerald': '0 0 20px rgba(16,185,129,0.25), 0 0 60px rgba(16,185,129,0.10)',
  		},
  		backgroundImage: {
  			'gradient-brand': 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
  			'gradient-gold': 'linear-gradient(135deg, #F59E0B, #EF4444)',
  			'gradient-emerald': 'linear-gradient(135deg, #10B981, #059669)',
  			'dot-pattern': 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};