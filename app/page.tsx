'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  LogOut,
  Shield,
  Activity,
  AlertTriangle,
  Sun,
  Moon,
  Zap,
} from 'lucide-react'

const THREAT_KEYWORDS = [
  'SCAM AIRDROP',
  'WIN 1 BTC',
  'ACCOUNT LOCKED',
  'FRAUD NFT',
  'PHISHING LINK',
  'JOIN VIP SIGNAL',
  'RUG PULL',
  'FREE TOKEN',
  '恭喜中奖',
  '实名认证超期',
  '加我V看美女',
  '项目内部额度',
  'REWARDS PENDING',
  'URGENT SECURITY',
  'BUY SHIB NOW',
  'DEX HACK',
]

const ThreatPacket: React.FC<{ index: number }> = ({ index }) => {
  const style = useMemo(() => {
    // Determine style on client side only to avoid hydration mismatch
    // But since this is inside useMemo with random, it's tricky.
    // The safest way for random values in React is to generate them in useEffect or use a deterministic seed.
    // However, for this task, I will stick to the user's logic but acknowledge potential hydration issues.
    // To minimize hydration mismatch errors, we can suppress warning or use a mounted check.
    // The parent component has a mounted check, so this component will only render on client.

    const angle = Math.random() * Math.PI * 2
    const spawnDistance = 600 + Math.random() * 200
    const startX = Math.cos(angle) * spawnDistance
    const startY = Math.sin(angle) * spawnDistance

    const impactRadius = 220
    const impactX = Math.cos(angle) * impactRadius
    const impactY = Math.sin(angle) * impactRadius

    const reboundRadius = 400
    const reboundX =
      Math.cos(angle + (Math.random() * 0.4 - 0.2)) * reboundRadius
    const reboundY =
      Math.sin(angle + (Math.random() * 0.4 - 0.2)) * reboundRadius

    const duration = 2.5 + Math.random() * 2
    const delay = Math.random() * 10

    return {
      '--start-x': `${startX}px`,
      '--start-y': `${startY}px`,
      '--impact-x': `${impactX}px`,
      '--impact-y': `${impactY}px`,
      '--rebound-x': `${reboundX}px`,
      '--rebound-y': `${reboundY}px`,
      animation: `projectile-deflect ${duration}s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s backwards`,
      left: '50%',
      top: '50%',
    } as React.CSSProperties
  }, [])

  const word = useMemo(
    () => THREAT_KEYWORDS[index % THREAT_KEYWORDS.length],
    [index]
  )

  return (
    <div
      className="threat-packet absolute pointer-events-none text-[10px] font-mono text-red-500 whitespace-nowrap"
      style={style}
    >
      <span className="flex items-center gap-1 opacity-70">
        <AlertTriangle size={10} /> {word}
      </span>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState({
    isConnected: false,
    address: null as string | null,
  })
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
    } else {
      setIsDarkMode(false)
    }

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  const formatAddress = (addr: string | null) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleDisconnect = () => {
    setUser({
      isConnected: false,
      address: null,
    })
  }

  if (!mounted) {
    return <div className="min-h-screen bg-black" />
  }

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-cyan-500 selection:text-black text-slate-900 dark:text-slate-100 transition-colors duration-300 bg-zinc-50 dark:bg-black">
      <div className="h-1 bg-cyan-500 shadow-[0_0_15px_#00ffff] fixed top-0 left-0 right-0 z-50 opacity-40" />

      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-cyan-500/20 py-2'
            : 'py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <Zap size={20} className="fill-white" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg tracking-tighter heading-font neon-text-cyan text-slate-900 dark:text-white">
                S.H.I.E.L.D.
              </span>
              <span className="text-[8px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-widest">
                Attention_Defense
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-cyan-500 transition-colors rounded-full bg-zinc-100 dark:bg-zinc-900"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user.isConnected && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-white dark:bg-zinc-900 border border-cyan-500/30 flex items-center gap-3 hover:border-cyan-500 transition-all rounded-sm"
                >
                  <Activity
                    size={12}
                    className="text-cyan-600 dark:text-cyan-400 animate-pulse"
                  />
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                    {formatAddress(user.address)}
                  </span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="min-h-screen flex flex-col justify-center items-center text-center relative px-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-40">
            <div className="relative w-[500px] h-[500px] flex items-center justify-center">
              {/* Shield Container with Vibration */}
              <div className="absolute inset-0 w-full h-full shield-vibrate">
                {/* Hexagon Shape */}
                <div className="absolute inset-0 bg-cyan-500/5 dark:bg-cyan-400/5 border border-cyan-500/30 shield-shape backdrop-blur-[2px]">
                  {/* Hex Grid Pattern */}
                  <div className="absolute inset-0 shield-hex-grid opacity-30" />
                </div>
                {/* Inner Rotating Ring */}
                <div className="absolute inset-[15%] border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                {/* Crosshairs */}
                <div className="shield-cross absolute inset-0" />
              </div>

              {/* Central Icon */}
              <Shield
                size={80}
                className="relative z-10 text-cyan-600 dark:text-cyan-400 animate-pulse drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              />
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <ThreatPacket key={i} index={i} />
            ))}
          </div>

          <div className="max-w-4xl relative z-10">
            <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter leading-none heading-font text-slate-900 dark:text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              V ME 50 <br />
              <span className="text-cyan-600 dark:text-cyan-400 neon-text-cyan">
                OR BE GONE.
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-zinc-500 dark:text-zinc-400 text-sm md:text-lg font-bold leading-relaxed mb-12 uppercase tracking-[0.3em]">
              <span className="text-slate-800 dark:text-white code-font">
                Only with enough sincerity can they reach your interesting soul.
              </span>
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="group flex items-center justify-center space-x-3 bg-cyan-500 hover:bg-cyan-400 text-white py-4 px-10 rounded-md shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] transition-all duration-300 border border-cyan-300/50 heading-font"
              >
                <Zap
                  size={20}
                  className="fill-white group-hover:scale-110 transition-transform duration-300"
                />
                <span className="font-bold text-lg tracking-wide uppercase italic">
                  DEPLOY SHIELD
                </span>
              </button>
              <button
                onClick={() => router.push('/advertise')}
                className="group flex items-center justify-center space-x-3 bg-transparent hover:bg-cyan-500/10 dark:hover:bg-cyan-400/10 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 py-4 px-10 rounded-md shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all duration-300 border-2 border-cyan-500/50 dark:border-cyan-400/50 hover:border-cyan-500 dark:hover:border-cyan-400 heading-font"
              >
                <Activity
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <span className="font-bold text-lg tracking-wide uppercase italic">
                  ADVERTISE HUB
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#020202] py-6 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-cyan-600 text-white font-black flex items-center justify-center text-xl italic shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              V
            </div>
            <span className="font-bold text-zinc-800 dark:text-zinc-300 text-sm tracking-widest heading-font">
              S.H.I.E.L.D._SYSTEM
            </span>
          </div>
          <p className="text-zinc-400 dark:text-zinc-600 text-[8px] font-black uppercase tracking-[0.6em]">
            © 2025 BUREAU OF S.H.I.E.L.D. // NOISE_IS_A_TAXABLE_RESOURCE
          </p>
        </div>
      </footer>

      <style jsx global>{`
        /* Shield Animations */
        @keyframes shield-vibrate {
          0% {
            transform: translate(0, 0);
          }
          20% {
            transform: translate(-1px, 1px);
          }
          40% {
            transform: translate(1px, -1px);
          }
          60% {
            transform: translate(-1px, -1px);
          }
          80% {
            transform: translate(1px, 1px);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        @keyframes hex-pulse {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        /* Projectile Animation */
        @keyframes projectile-deflect {
          0% {
            transform: translate(var(--start-x), var(--start-y)) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translate(
                calc(var(--start-x) * 0.9),
                calc(var(--start-y) * 0.9)
              )
              scale(1);
          }
          70% {
            transform: translate(var(--impact-x), var(--impact-y)) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
          85% {
            transform: translate(
                calc(
                  var(--impact-x) + (var(--rebound-x) - var(--impact-x)) * 0.5
                ),
                calc(
                  var(--impact-y) + (var(--rebound-y) - var(--impact-y)) * 0.5
                )
              )
              scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translate(var(--rebound-x), var(--rebound-y)) scale(2)
              rotate(180deg);
            opacity: 0;
            filter: blur(4px);
          }
        }

        .shield-vibrate {
          animation: shield-vibrate 0.2s infinite linear;
        }

        .shield-shape {
          clip-path: polygon(
            50% 0%,
            100% 25%,
            100% 75%,
            50% 100%,
            0% 75%,
            0% 25%
          );
        }

        .shield-hex-grid {
          background-image: url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10s-10 4.477-10 10v20c0 5.523 4.477 10 10 10zM12 40c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10S2 4.477 2 10v20c0 5.523 4.477 10 10 10z' fill='%2306b6d4' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
          animation: hex-pulse 4s ease-in-out infinite;
        }

        .shield-cross::before,
        .shield-cross::after {
          content: '';
          position: absolute;
          background: rgba(6, 182, 212, 0.4);
          pointer-events: none;
        }

        .shield-cross::before {
          top: 10%;
          bottom: 10%;
          left: 50%;
          width: 1px;
          transform: translateX(-50%);
        }

        .shield-cross::after {
          left: 10%;
          right: 10%;
          top: 50%;
          height: 1px;
          transform: translateY(-50%);
        }

        .threat-packet {
          position: absolute;
          left: 50%;
          top: 50%;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  )
}
