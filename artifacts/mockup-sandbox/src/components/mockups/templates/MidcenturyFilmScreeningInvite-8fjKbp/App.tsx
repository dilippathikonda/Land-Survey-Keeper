import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Check, Plus, Asterisk } from 'lucide-react';

// ————————————————————————————————————————————
// PALETTE — single background, varied text & border tones
// ————————————————————————————————————————————
const BG = '#F1E8D6';
const INK = '#2A241B';
const ORANGE = '#C4501F';
const TEAL = '#23615B';
const OLIVE = '#737030';
const MUSTARD = '#BD8E22';
const FAINT = 'rgba(42,36,27,0.16)';
const FAINT2 = 'rgba(42,36,27,0.36)';

const TODAY_IDX = 4; // Friday
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const INITIAL_HABITS = [
  { id: 'pages', name: 'Write three script pages', dept: 'WRITING', color: ORANGE, streak: 12, week: [1, 1, 1, 1, 1, 0, 0] },
  { id: 'dailies', name: 'Review yesterday’s dailies', dept: 'POST', color: TEAL, streak: 23, week: [1, 1, 1, 1, 1, 0, 0] },
  { id: 'board', name: 'Storyboard one sequence', dept: 'WRITING', color: MUSTARD, streak: 4, week: [0, 1, 1, 1, 0, 0, 0] },
  { id: 'scout', name: 'One location scout call', dept: 'PRODUCTION', color: OLIVE, streak: 7, week: [1, 1, 0, 1, 1, 0, 0] },
  { id: 'color', name: 'Thirty minutes of color reference', dept: 'POST', color: ORANGE, streak: 9, week: [1, 0, 1, 1, 0, 0, 0] },
  { id: 'pitch', name: 'Pitch one wild idea at standup', dept: 'PRODUCTION', color: TEAL, streak: 16, week: [1, 1, 1, 1, 1, 0, 0] },
  { id: 'short', name: 'Watch one short, take one note', dept: 'CRAFT', color: MUSTARD, streak: 6, week: [1, 1, 1, 0, 0, 0, 0] },
];

const CREW = [
  { name: 'Inez Maravalle', role: 'Editor', streak: 23, color: TEAL },
  { name: 'Theo Okafor', role: 'Director / Writer', streak: 19, color: ORANGE },
  { name: 'June Castellanos', role: 'Producer', streak: 16, color: OLIVE },
  { name: 'Marcus Lindqvist', role: 'DP', streak: 11, color: MUSTARD },
  { name: 'Priya Raghunath', role: 'Sound', streak: 8, color: TEAL },
];

const DEPTS = ['ALL', 'WRITING', 'PRODUCTION', 'POST', 'CRAFT'];

// ————————————————————————————————————————————
// Decorative atomic-age SVGs (stroke only)
// ————————————————————————————————————————————
const Starburst = ({ size = 160, color = INK, strokeWidth = 1.2, style = {}, className = '' }) => {
  const c = size / 2;
  const rays = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    const len = i % 2 === 0 ? c - 6 : c * 0.55;
    rays.push(
      <line
        key={i}
        x1={c + Math.cos(a) * 8}
        y1={c + Math.sin(a) * 8}
        x2={c + Math.cos(a) * len}
        y2={c + Math.sin(a) * len}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    );
    if (i % 2 === 0) {
      rays.push(
        <circle key={`d${i}`} cx={c + Math.cos(a) * len} cy={c + Math.sin(a) * len} r={2.4} fill={color} />
      );
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={style} className={className}>
      {rays}
      <circle cx={c} cy={c} r={4} fill="none" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
};

const Boomerang = ({ width = 220, color = ORANGE, strokeWidth = 1.4, style = {}, className = '' }) => (
  <svg width={width} height={width * 0.55} viewBox="0 0 220 120" fill="none" style={style} className={className}>
    <path d="M 12 104 Q 110 -28 208 104 Q 110 48 12 104 Z" stroke={color} strokeWidth={strokeWidth} />
    <path d="M 36 96 Q 110 0 184 96" stroke={color} strokeWidth={strokeWidth} strokeDasharray="2 6" />
  </svg>
);

const DotArc = ({ size = 200, color = OLIVE, style = {}, className = '' }) => (
  <svg width={size} height={size / 2} viewBox="0 0 200 100" fill="none" style={style} className={className}>
    <path d="M 6 96 Q 100 -60 194 96" stroke={color} strokeWidth="1.2" strokeDasharray="1 9" strokeLinecap="round" />
  </svg>
);

// ————————————————————————————————————————————
// APP
// ————————————————————————————————————————————
export default function App() {
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [dept, setDept] = useState('ALL');
  const [rsvped, setRsvped] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toggleToday = (id) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, week: h.week.map((v, i) => (i === TODAY_IDX ? (v ? 0 : 1) : v)) }
          : h
      )
    );
  };

  const visibleHabits = dept === 'ALL' ? habits : habits.filter((h) => h.dept === dept);

  const stats = useMemo(() => {
    const possible = habits.length * (TODAY_IDX + 1);
    const done = habits.reduce((acc, h) => acc + h.week.slice(0, TODAY_IDX + 1).filter(Boolean).length, 0);
    const todayDone = habits.filter((h) => h.week[TODAY_IDX]).length;
    return {
      pct: Math.round((done / possible) * 100),
      logged: 184 + done,
      todayDone,
      todayTotal: habits.length,
    };
  }, [habits]);

  return (
    <div className="dailies-root" style={{ backgroundColor: BG, color: INK, minHeight: '100vh' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Spline+Sans+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .dailies-root { font-family: 'Jost', sans-serif; -webkit-font-smoothing: antialiased; }
        .dailies-root ::selection { background: ${ORANGE}; color: ${BG}; }
        .mono { font-family: 'Spline Sans Mono', monospace; }
        .hed { text-transform: uppercase; letter-spacing: 0.14em; }
        .hed-tight { text-transform: uppercase; letter-spacing: 0.1em; }
        .hed-wide { text-transform: uppercase; letter-spacing: 0.32em; }
        .ritual-row { transition: background-color .25s ease; }
        .ritual-row:hover { background-color: rgba(42,36,27,0.045); }
        .check-pill { transition: all .25s cubic-bezier(.2,.7,.2,1); }
        .rsvp-btn { transition: all .3s cubic-bezier(.2,.7,.2,1); }
        .rsvp-btn:hover { background: ${INK}; color: ${BG}; }
        .rsvp-btn:hover .rsvp-arrow { transform: translateX(6px); }
        .rsvp-arrow { transition: transform .3s ease; }
        .dept-tab { transition: all .22s ease; }
        .dept-tab:hover { color: ${INK}; }
        .grid-dot { transition: transform .2s ease; }
        .grid-cell:hover .grid-dot { transform: scale(1.35); }
        .crew-row { transition: padding-left .25s ease; }
        .crew-row:hover { padding-left: 10px; }
        .dailies-root::-webkit-scrollbar { width: 10px; }
        @keyframes spinSlow { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .spin-slow { animation: spinSlow 70s linear infinite; }
      `,
        }}
      />

      {/* ————— TOP BAR ————— */}
      <header
        className="flex items-center justify-between px-7 py-3 border-b"
        style={{ borderColor: FAINT2 }}
      >
        <div className="flex items-center gap-3">
          <Asterisk size={18} strokeWidth={1.6} style={{ color: ORANGE }} />
          <span className="hed text-[12px] font-semibold">Meridian &amp; Orbit Pictures</span>
        </div>
        <span className="hed-wide text-[10px] hidden md:block" style={{ color: FAINT2 }}>
          Dailies — a ritual tracker for working filmmakers
        </span>
        <span className="mono text-[11px] tracking-[0.18em]">FRI · MAR 21 · WK 12</span>
      </header>

      {/* ————— ASYMMETRIC GRID  ⅓ + ⅔ ————— */}
      <main className="grid grid-cols-1 lg:grid-cols-12">
        {/* ——— LEFT ⅓ : EVENT ANNOUNCEMENT (sticky) ——— */}
        <aside
          className="lg:col-span-4 lg:sticky lg:top-0 lg:h-screen relative overflow-hidden border-b lg:border-b-0 lg:border-r"
          style={{ borderColor: FAINT2 }}
        >
          {/* parallax decorative layers */}
          <Starburst
            size={300}
            color={`rgba(42,36,27,0.22)`}
            className="absolute -right-24 -top-20 spin-slow pointer-events-none"
            style={{ transform: `translateY(${scrollY * 0.18}px)` }}
          />
          <Boomerang
            width={260}
            color={ORANGE}
            className="absolute -left-12 bottom-40 pointer-events-none"
            style={{ transform: `translateY(${scrollY * -0.07}px) rotate(-14deg)`, opacity: 0.7 }}
          />
          <DotArc
            size={240}
            color={TEAL}
            className="absolute right-4 bottom-10 pointer-events-none"
            style={{ transform: `translateY(${scrollY * 0.1}px) rotate(8deg)`, opacity: 0.8 }}
          />

          <div className="relative px-7 pt-12 pb-9 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-9">
              <span
                className="hed-wide text-[10px] font-medium px-3 py-[6px] border"
                style={{ borderColor: ORANGE, color: ORANGE }}
              >
                Event announcement
              </span>
              <span className="mono text-[10px] tracking-[0.2em]" style={{ color: FAINT2 }}>
                Nº 07
              </span>
            </div>

            <h1 className="hed font-semibold leading-[1.04]" style={{ fontSize: 'clamp(34px, 3.4vw, 52px)' }}>
              The Spring
              <br />
              Screening
              <br />
              <span style={{ color: ORANGE }}>Night</span>
            </h1>

            <p className="mt-6 text-[15px] leading-relaxed max-w-[34ch]" style={{ color: 'rgba(42,36,27,0.82)' }}>
              Six shorts, one rough cut, and an open bar at the Orbit Room. Every ritual you log
              between now and April 18 earns your reel a slot in the lineup.{' '}
              <em>Keep the streak, keep the screen.</em>
            </p>

            {/* event details */}
            <div className="mt-9 border-t" style={{ borderColor: FAINT2 }}>
              {[
                ['Date', 'Friday, April 18'],
                ['Doors', '7:30 PM — Reel rolls 8:15'],
                ['Place', 'The Orbit Room, 414 Echo Park Ave'],
                ['Lineup', 'Six shorts · One rough cut · Q&A'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-6 py-[11px] border-b"
                  style={{ borderColor: FAINT }}
                >
                  <span className="hed text-[10px]" style={{ color: TEAL }}>
                    {k}
                  </span>
                  <span className="text-[14px] text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-10">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="mono text-[42px] leading-none" style={{ color: ORANGE }}>
                    28
                  </div>
                  <div className="hed text-[10px] mt-2" style={{ color: FAINT2 }}>
                    Days to screening
                  </div>
                </div>
                <Starburst size={56} color={MUSTARD} strokeWidth={1.4} className="spin-slow" />
              </div>
              <button
                onClick={() => setRsvped(!rsvped)}
                className="rsvp-btn w-full flex items-center justify-between border px-5 py-4 hed text-[12px] font-semibold"
                style={{ borderColor: INK, background: rsvped ? INK : 'transparent', color: rsvped ? BG : INK }}
              >
                {rsvped ? 'Seat reserved — see you there' : 'Reserve a seat'}
                <ArrowRight size={16} className="rsvp-arrow" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </aside>

        {/* ——— RIGHT ⅔ : THE TRACKER ——— */}
        <section className="lg:col-span-8 relative">
          {/* parallax background ornament */}
          <Boomerang
            width={420}
            color={`rgba(42,36,27,0.14)`}
            className="absolute right-10 top-[520px] pointer-events-none hidden lg:block"
            style={{ transform: `translateY(${scrollY * -0.12}px) rotate(166deg)` }}
          />

          {/* STATS STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b" style={{ borderColor: FAINT2 }}>
            {[
              { label: 'Week completion', value: `${stats.pct}%`, color: ORANGE, sub: 'of rituals kept' },
              { label: 'Longest streak', value: '23', color: TEAL, sub: 'Inez · dailies review' },
              { label: 'Rituals logged', value: stats.logged, color: OLIVE, sub: 'since pre-production' },
              { label: 'Today', value: `${stats.todayDone}/${stats.todayTotal}`, color: MUSTARD, sub: 'rituals complete' },
            ].map((s, i) => (
              <div
                key={s.label}
                className="px-6 pt-7 pb-6 border-r last:border-r-0"
                style={{ borderColor: FAINT, borderRightWidth: i === 3 ? 0 : 1 }}
              >
                <div className="hed text-[10px] mb-3" style={{ color: FAINT2 }}>
                  {s.label}
                </div>
                <div className="mono text-[34px] leading-none" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-[12px] mt-2" style={{ color: 'rgba(42,36,27,0.6)' }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* TODAY'S RITUALS */}
          <div className="px-7 pt-10 pb-12 border-b" style={{ borderColor: FAINT2 }}>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="hed text-[15px] font-semibold">Today’s rituals</h2>
              <span className="mono text-[11px] tracking-[0.15em]" style={{ color: FAINT2 }}>
                FRI · MAR 21
              </span>
            </div>

            <div className="border-t" style={{ borderColor: FAINT2 }}>
              {habits.map((h) => {
                const done = !!h.week[TODAY_IDX];
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleToday(h.id)}
                    className="ritual-row w-full flex items-center gap-5 py-[14px] px-2 border-b text-left"
                    style={{ borderColor: FAINT }}
                  >
                    <span
                      className="check-pill flex items-center justify-center shrink-0"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        border: `1.5px solid ${done ? h.color : FAINT2}`,
                        background: done ? h.color : 'transparent',
                        color: BG,
                      }}
                    >
                      {done ? <Check size={14} strokeWidth={2.4} /> : <Plus size={13} strokeWidth={1.6} style={{ color: FAINT2 }} />}
                    </span>
                    <span
                      className="text-[15px] flex-1"
                      style={{
                        textDecoration: done ? 'line-through' : 'none',
                        textDecorationColor: h.color,
                        color: done ? 'rgba(42,36,27,0.55)' : INK,
                      }}
                    >
                      {h.name}
                    </span>
                    <span className="hed text-[9px] hidden sm:block" style={{ color: h.color }}>
                      {h.dept}
                    </span>
                    <span className="mono text-[11px] w-16 text-right" style={{ color: FAINT2 }}>
                      {h.streak + (done ? 1 : 0)} day{h.streak + (done ? 1 : 0) === 1 ? '' : 's'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-[12px]" style={{ color: 'rgba(42,36,27,0.55)' }}>
              Tap a ritual to mark it kept. Logged rituals count toward your seat at the Spring Screening.
            </p>
          </div>

          {/* WEEK GRID */}
          <div className="px-7 pt-10 pb-14 border-b relative" style={{ borderColor: FAINT2 }}>
            <DotArc
              size={180}
              color={MUSTARD}
              className="absolute right-8 -top-5 pointer-events-none"
              style={{ transform: `translateY(${scrollY * 0.05}px)`, opacity: 0.9 }}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-7">
              <h2 className="hed text-[15px] font-semibold">The week in dailies</h2>
              <div className="flex gap-5">
                {DEPTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDept(d)}
                    className="dept-tab hed text-[10px] pb-1"
                    style={{
                      color: dept === d ? ORANGE : FAINT2,
                      borderBottom: `2px solid ${dept === d ? ORANGE : 'transparent'}`,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* header row */}
            <div className="grid items-center" style={{ gridTemplateColumns: 'minmax(160px, 1fr) repeat(7, 44px) 64px' }}>
              <span className="hed text-[9px]" style={{ color: FAINT2 }}>
                Ritual
              </span>
              {DAYS.map((d, i) => (
                <span
                  key={i}
                  className="mono text-[11px] text-center pb-3"
                  style={{
                    color: i === TODAY_IDX ? ORANGE : FAINT2,
                    fontWeight: i === TODAY_IDX ? 500 : 300,
                  }}
                >
                  {d}
                </span>
              ))}
              <span className="hed text-[9px] text-right" style={{ color: FAINT2 }}>
                Streak
              </span>
            </div>

            <div className="border-t" style={{ borderColor: FAINT2 }}>
              {visibleHabits.map((h) => (
                <div
                  key={h.id}
                  className="grid items-center border-b"
                  style={{ gridTemplateColumns: 'minmax(160px, 1fr) repeat(7, 44px) 64px', borderColor: FAINT, height: 52 }}
                >
                  <div className="pr-4">
                    <div className="text-[14px] leading-tight">{h.name}</div>
                    <div className="hed text-[8px] mt-[2px]" style={{ color: h.color }}>
                      {h.dept}
                    </div>
                  </div>
                  {h.week.map((v, i) => {
                    const future = i > TODAY_IDX;
                    return (
                      <div
                        key={i}
                        className="grid-cell flex items-center justify-center h-full"
                        style={{
                          borderLeft: i === TODAY_IDX ? `1px solid ${FAINT2}` : 'none',
                          borderRight: i === TODAY_IDX ? `1px solid ${FAINT2}` : 'none',
                        }}
                      >
                        {future ? (
                          <span style={{ width: 8, height: 1.5, background: FAINT }} />
                        ) : v ? (
                          <span className="grid-dot" style={{ width: 11, height: 11, borderRadius: '50%', background: h.color }} />
                        ) : (
                          <span className="grid-dot" style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${FAINT2}` }} />
                        )}
                      </div>
                    );
                  })}
                  <span className="mono text-[12px] text-right" style={{ color: 'rgba(42,36,27,0.65)' }}>
                    {h.streak + (h.week[TODAY_IDX] ? 1 : 0)}d
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-7 mt-5">
              <span className="flex items-center gap-2 text-[11px]" style={{ color: FAINT2 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: INK, display: 'inline-block' }} /> kept
              </span>
              <span className="flex items-center gap-2 text-[11px]" style={{ color: FAINT2 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', border: `1.5px solid ${FAINT2}`, display: 'inline-block' }} /> missed
              </span>
              <span className="flex items-center gap-2 text-[11px]" style={{ color: FAINT2 }}>
                <span style={{ width: 9, height: 1.5, background: FAINT, display: 'inline-block' }} /> upcoming
              </span>
            </div>
          </div>

          {/* CREW STREAKS */}
          <div className="px-7 pt-10 pb-12 relative">
            <Starburst
              size={120}
              color={`rgba(42,36,27,0.18)`}
              className="absolute -left-10 top-24 spin-slow pointer-events-none"
              style={{ transform: `translateY(${scrollY * 0.08}px)` }}
            />
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="hed text-[15px] font-semibold">Crew streak board</h2>
              <span className="hed text-[10px]" style={{ color: TEAL }}>
                Top 5 take front row · April 18
              </span>
            </div>

            <div className="border-t" style={{ borderColor: FAINT2 }}>
              {CREW.map((c, i) => (
                <div
                  key={c.name}
                  className="crew-row grid items-center gap-4 py-[13px] border-b"
                  style={{ gridTemplateColumns: '28px 1fr 130px 200px 56px', borderColor: FAINT }}
                >
                  <span className="mono text-[12px]" style={{ color: FAINT2 }}>
                    0{i + 1}
                  </span>
                  <span className="text-[15px]">{c.name}</span>
                  <span className="hed text-[9px]" style={{ color: FAINT2 }}>
                    {c.role}
                  </span>
                  <span className="hidden md:flex items-center gap-[3px]">
                    {Array.from({ length: 23 }).map((_, j) => (
                      <span
                        key={j}
                        style={{
                          width: 5,
                          height: 14,
                          background: j < c.streak ? c.color : 'transparent',
                          border: j < c.streak ? 'none' : `1px solid ${FAINT}`,
                        }}
                      />
                    ))}
                  </span>
                  <span className="mono text-[14px] text-right" style={{ color: c.color }}>
                    {c.streak}d
                  </span>
                </div>
              ))}
            </div>

            {/* footer note */}
            <div className="mt-12 pt-6 border-t flex flex-wrap items-center justify-between gap-4" style={{ borderColor: FAINT2 }}>
              <span className="hed-wide text-[9px]" style={{ color: FAINT2 }}>
                Meridian &amp; Orbit Pictures · Echo Park · Est. 2017
              </span>
              <span className="mono text-[10px] tracking-[0.18em]" style={{ color: FAINT2 }}>
                DAILIES v2.4 — RITUALS OVER RESOLUTIONS
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}