import Image from 'next/image'
import Link from 'next/link'

const flowSteps = [
  { name: 'Capture', value: '1,284 events', accent: 'bg-cyan-300' },
  { name: 'Synthesize', value: '38 AI briefs', accent: 'bg-fuchsia-300' },
  { name: 'Deploy', value: '12 live routes', accent: 'bg-emerald-300' },
]

const metrics = [
  { value: '42', label: 'Automations' },
  { value: '18ms', label: 'Queue delay' },
  { value: '99.8%', label: 'Uptime' },
]

export function AuthExperience({
  badge,
  title,
  description,
  children,
  footerText,
  footerHref,
  footerLinkText,
}) {
  return (
    <main className="relative min-h-screen max-w-full isolate overflow-x-hidden bg-[#06070a] text-white xl:h-screen xl:overflow-hidden">
      <div className="absolute inset-0 -z-30 bg-[linear-gradient(135deg,#06070a_0%,#0a1010_42%,#120b10_100%)]" />
      <div className="absolute inset-0 -z-20 bg-dotted-grid opacity-[0.18]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-24 border-b border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent" />
      <div className="absolute -left-24 top-24 -z-10 h-[520px] w-[85vw] rotate-[-10deg] bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.12),rgba(244,114,182,0.08),transparent)] blur-2xl" />
      <div className="absolute bottom-0 right-0 -z-10 h-[420px] w-[72vw] rotate-[-8deg] bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.1),rgba(59,130,246,0.08),transparent)] blur-2xl" />

      <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1.08fr)_minmax(410px,0.72fr)]">
        <section className="relative flex w-full min-w-0 max-w-full flex-col overflow-x-hidden px-5 py-6 sm:px-8 lg:px-10 xl:min-h-screen">
          <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-klyvora.png"
                alt="KlyVora"
                width={48}
                height={48}
                priority
                className="h-12 w-12 rounded-lg border border-white/10 bg-white/[0.05] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
              />
              <div>
                <div className="text-lg font-semibold tracking-tight">KlyVora</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-100/55">Neural Workspace</div>
              </div>
            </div>

            <div className="hidden rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-100 sm:block">
              Secure node
            </div>
          </header>

          <div className="mx-auto grid w-full max-w-[350px] flex-1 items-center gap-8 py-12 sm:max-w-6xl lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.72fr)] lg:py-8">
            <div className="min-w-0 max-w-full space-y-8">
              <div className="inline-flex rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
                {badge}
              </div>

              <div className="space-y-5">
                <h1 className="max-w-[11ch] text-4xl font-semibold leading-[0.98] tracking-tight text-white sm:max-w-[12ch] sm:text-6xl sm:leading-[0.94] lg:text-7xl">
                  {title}
                </h1>
                <p className="max-w-[31ch] text-base leading-8 text-slate-300 sm:max-w-xl">
                  {description}
                </p>
              </div>

              <div className="grid w-full max-w-[350px] gap-3 sm:max-w-2xl sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.055] px-4 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                    <div className="text-2xl font-semibold tracking-tight">{metric.value}</div>
                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden min-w-0 lg:block">
              <div className="absolute inset-x-7 -top-8 h-6 rounded-lg border border-white/10 bg-white/[0.04]" />
              <div className="relative overflow-hidden rounded-lg border border-white/12 bg-[#0b0f14]/88 p-4 shadow-[0_34px_120px_rgba(0,0,0,0.52)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-sm font-semibold">Command cockpit</div>
                    <div className="mt-1 text-xs text-slate-500">Live orchestration map</div>
                  </div>
                  <div className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                    Active
                  </div>
                </div>

                <div className="grid gap-3">
                  {flowSteps.map((step, index) => (
                    <div key={step.name} className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-1 rounded-full ${step.accent}`} />
                          <div>
                            <div className="text-sm font-semibold">{step.name}</div>
                            <div className="mt-1 text-xs text-slate-500">{step.value}</div>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-500">0{index + 1}</div>
                      </div>
                      <div className="mt-4 grid grid-cols-5 gap-1.5">
                        {Array.from({ length: 10 }).map((_, itemIndex) => (
                          <span
                            key={itemIndex}
                            className={`h-1.5 rounded-full ${itemIndex <= index + 5 ? step.accent : 'bg-white/10'}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-[1fr_0.8fr] gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Throughput</span>
                      <span className="text-xs text-emerald-200">+18%</span>
                    </div>
                    <div className="flex h-20 items-end gap-2">
                      {[36, 54, 42, 68, 58, 82, 74].map((height, index) => (
                        <div key={index} className="flex-1 rounded-t bg-gradient-to-t from-cyan-400/25 to-cyan-200" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Priority</div>
                    <div className="mt-4 space-y-2">
                      {['Vision', 'Tasks', 'Network'].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded border border-white/10 bg-black/20 px-2 py-2 text-xs">
                          <span>{item}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.75)]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex min-w-0 items-center justify-center border-white/10 bg-[#050609]/72 px-5 py-10 shadow-[-30px_0_90px_rgba(0,0,0,0.38)] sm:px-8 xl:min-h-screen xl:border-l">
          <div className="w-full max-w-[350px] min-w-0 sm:max-w-[440px]">
            {children}

            <p className="mt-6 text-center text-sm text-slate-400">
              {footerText}{' '}
              <Link href={footerHref} className="font-semibold text-white underline decoration-cyan-300/35 underline-offset-8 transition-colors hover:text-cyan-200">
                {footerLinkText}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
