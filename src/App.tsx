import { lazy, Suspense, useEffect, useState } from 'react';
import { Frame } from './components/Frame';
import { Reveal } from './components/Reveal';
import { useTheme } from './hooks/useTheme';
import { profile } from './content/profile';
import { projects } from './content/projects';
import { practice } from './content/practice';
import { tools } from './content/tools';
import { links, availability } from './content/contact';

// three.js is the heaviest thing on the page; keep it out of the first paint.
const HeroKeypad = lazy(() =>
  import('./components/HeroKeypad').then((m) => ({ default: m.HeroKeypad })),
);

const NAV = [
  { href: '#work', label: 'Work' },
  { href: '#tools', label: 'Tools' },
  { href: '#contact', label: 'Contact' },
];

const shell = 'mx-auto w-full max-w-[1120px] px-6';
const dim = 'text-[color-mix(in_srgb,var(--color-text)_60%,transparent)]';
const rule = 'border-t border-[var(--color-divider)]';

function SectionLabel({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className={`label ${dim}`}>
      {children}
    </h2>
  );
}

export default function App() {
  const [theme, toggleTheme] = useTheme();

  // Only mount the 3D object once the page has settled, so it never competes
  // with first paint on a phone.
  const [showKeypad, setShowKeypad] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowKeypad(true), 200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen">
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-[var(--color-accent)] focus:px-4 focus:py-2.5 focus:text-[var(--color-bg)]"
      >
        Skip to work
      </a>

      <header className={`${shell} flex items-center justify-between gap-4 py-5`}>
        <a
          href="#top"
          className="label whitespace-nowrap text-[var(--color-text)] no-underline"
        >
          {profile.name.replace('Alexander ', '')}
        </a>
        <nav aria-label="Sections" className="flex items-center gap-1">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="label flex min-h-[44px] items-center px-2.5 py-1.5 text-[13px] tracking-[0.1em] text-[var(--color-text)] no-underline hover:text-[var(--color-accent)]"
            >
              {n.label}
            </a>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="label min-h-[44px] min-w-[64px] cursor-pointer border border-[var(--color-divider)] bg-transparent px-3 py-2 text-[12px] tracking-[0.12em] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </nav>
      </header>

      <main id="top">
        <section
          aria-labelledby="hero-name"
          className={`${shell} grid grid-cols-1 items-center gap-12 pb-16 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]`}
        >
          <div className="flex max-w-[640px] flex-col gap-5">
            <Reveal>
              <p className={`label ${dim} m-0`}>
                {profile.role} · {profile.company}
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h1
                id="hero-name"
                className="m-0 text-[clamp(52px,13vw,104px)] uppercase leading-[0.92] tracking-[-0.02em]"
              >
                Franz
                <br />
                Alexander
                <br />
                Velarde
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <div aria-hidden="true" className="h-px bg-[var(--color-accent-mark)]" />
            </Reveal>
            <Reveal delay={0.16}>
              <p className="m-0 max-w-[52ch] text-[17px] leading-[1.62] [text-wrap:pretty]">
                {profile.intro}
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
                {links
                  .filter((l) => l.label !== 'Phone')
                  .map((l, i) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...(l.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                        className={`label flex min-h-[44px] items-center px-4 no-underline ${
                          i === 0
                            ? 'bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,black)]'
                            : 'border border-[var(--color-divider)] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]'
                        }`}
                      >
                        {l.label === 'Email' ? 'Email me' : l.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </Reveal>
          </div>

          <figure className="relative m-0">
            <Frame className="relative aspect-square w-full bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
              <Suspense fallback={null}>{showKeypad ? <HeroKeypad theme={theme} /> : null}</Suspense>
            </Frame>
          </figure>
        </section>

        <section id="work" aria-labelledby="work-h" className={rule}>
          <div className={`${shell} pb-6 pt-14`}>
            <SectionLabel id="work-h">Selected work</SectionLabel>
          </div>
          <ul className="m-0 list-none p-0">
            {projects.map((p, i) => (
              <Reveal as="li" key={p.num} delay={i * 0.05} className={rule}>
                <div className={`${shell} group grid grid-cols-1 gap-3.5 py-7`}>
                  <div className="flex items-baseline gap-3.5">
                    <span aria-hidden="true" className="label min-w-[26px] text-[var(--color-accent)]">
                      {p.num}
                    </span>
                    <h3 className="m-0 text-[clamp(26px,6vw,38px)] leading-[1.05] transition-colors duration-200 group-hover:text-[var(--color-accent)]">
                      {p.title}
                    </h3>
                  </div>
                  <p className="m-0 ml-10 max-w-[56ch] [text-wrap:pretty] text-[color-mix(in_srgb,var(--color-text)_80%,transparent)]">
                    {p.summary}
                  </p>
                  <div className="ml-10 flex flex-wrap items-center gap-2">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="label border border-[var(--color-divider)] px-2 py-1 text-[12px] tracking-[0.08em]"
                      >
                        {s}
                      </span>
                    ))}
                    <span className="label ml-1 text-[12px] tracking-[0.12em] text-[var(--color-accent)]">
                      {p.status}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </section>

        <section aria-labelledby="do-h" className={rule}>
          <div className={`${shell} py-14`}>
            <SectionLabel id="do-h">What I do</SectionLabel>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {practice.map((c, i) => (
                <Reveal as="article" key={c.title} delay={i * 0.06}>
                  <h3 className="m-0 mb-2.5 text-[22px]">{c.title}</h3>
                  <p className="m-0 max-w-[44ch] [text-wrap:pretty] text-[color-mix(in_srgb,var(--color-text)_80%,transparent)]">
                    {c.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="tools" aria-labelledby="tools-h" className={rule}>
          <div className={`${shell} py-14`}>
            <SectionLabel id="tools-h">Tools</SectionLabel>
            <dl className="m-0 mt-8 grid grid-cols-1">
              {tools.map((t) => (
                <div
                  key={t.label}
                  className={`${rule} grid grid-cols-1 items-start gap-3 py-5 sm:grid-cols-[minmax(150px,190px)_1fr]`}
                >
                  <dt className={`label m-0 ${dim}`}>{t.label}</dt>
                  <dd className="m-0 flex flex-wrap gap-2">
                    {t.items.map((i) => (
                      <span
                        key={i}
                        className="label border border-[var(--color-divider)] px-2 py-1 text-[12px] tracking-[0.08em]"
                      >
                        {i}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="bg-h" className={rule}>
          <div className={`${shell} grid grid-cols-1 gap-3 py-14`}>
            <SectionLabel id="bg-h">Background</SectionLabel>
            <div>
              <p className="m-0 mb-1 font-['Barlow_Condensed',system-ui,sans-serif] text-[25px] font-semibold leading-[1.15]">
                {profile.education.degree}
              </p>
              <p className="m-0 text-[color-mix(in_srgb,var(--color-text)_70%,transparent)]">
                {profile.education.school} · {profile.education.detail}
              </p>
            </div>
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-h" className={rule}>
          <div className={`${shell} grid grid-cols-1 items-start gap-11 pb-20 pt-14 md:grid-cols-[minmax(0,1fr)_200px]`}>
            <div>
              <SectionLabel id="contact-h">Contact</SectionLabel>
              <p className="m-0 mb-7 mt-6 max-w-[18ch] text-[clamp(30px,7vw,46px)] font-semibold leading-[1.05] [font-family:'Barlow_Condensed',system-ui,sans-serif] [text-wrap:pretty]">
                {availability}
              </p>
              <ul className="m-0 grid max-w-[520px] list-none p-0">
                {links.map((l) => (
                  <li key={l.label} className={rule}>
                    <a
                      href={l.href}
                      {...(l.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                      className="flex min-h-[56px] items-center justify-between gap-4 py-2 text-[var(--color-text)] no-underline hover:text-[var(--color-accent)]"
                    >
                      <span className={`label ${dim} tracking-[0.14em]`}>{l.label}</span>
                      <span className="break-all text-right text-[15px]">{l.value}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <Frame className="w-[200px] self-start">
              <img
                src={profile.photo.src}
                alt={profile.photo.alt}
                width={400}
                height={500}
                className="aspect-[4/5] w-full object-cover"
              />
            </Frame>
          </div>
        </section>
      </main>

      <footer className={rule}>
        <div className={`${shell} label flex flex-wrap justify-between gap-3 py-6 text-[12px] tracking-[0.12em] ${dim}`}>
          <span>Franz Velarde — Lucena City, Quezon</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
