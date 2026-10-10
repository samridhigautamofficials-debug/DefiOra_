import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { SiteHeader } from "@/components/SiteHeader";

const principles: Array<{ icon: IconName; title: string; description: string; tone: string }> = [
  {
    icon: "brain",
    title: "AI extracts",
    description: "Finds key information from your documents.",
    tone: "bg-[#e4f3ec] text-[#075b4c]",
  },
  {
    icon: "link",
    title: "Evidence provides context",
    description: "Compares claims across available documents.",
    tone: "bg-[#fff0eb] text-[#c45140]",
  },
  {
    icon: "shieldCheck",
    title: "Rules compare",
    description: "Checks for inconsistencies using deterministic rules.",
    tone: "bg-[#e4f3ec] text-[#075b4c]",
  },
  {
    icon: "warning",
    title: "DefiOra warns",
    description: "Provides clear, actionable guidance before submission.",
    tone: "bg-[#fff0eb] text-[#c45140]",
  },
];

const workflowCards: Array<{ icon: IconName; number: string; title: string; description: string; badge: string; tone: string }> = [
  {
    icon: "upload",
    number: "01",
    title: "Upload Documents",
    description: "Add your application and supporting files.",
    badge: "PDF, PNG, JPG, JPEG",
    tone: "bg-white",
  },
  {
    icon: "brain",
    number: "02",
    title: "Extract & Analyze",
    description: "AI reads and extracts key information.",
    badge: "Structured extraction",
    tone: "bg-[#f9fffb]",
  },
  {
    icon: "shieldCheck",
    number: "03",
    title: "Verify & Compare",
    description: "Compare evidence using deterministic rules.",
    badge: "Find inconsistencies",
    tone: "bg-[#fffdf8]",
  },
  {
    icon: "userCheck",
    number: "04",
    title: "Review & Submit",
    description: "Get a clear checklist and resolve flagged issues.",
    badge: "Human review",
    tone: "bg-[#fffaf8]",
  },
];

function HeroIllustration() {
  return (
    <div className="relative mx-auto min-h-[470px] w-full max-w-[560px] lg:min-h-[560px]">
      <div className="absolute inset-5 rounded-[42%] bg-[#d9ede1] opacity-85" />
      <div className="absolute left-2 top-12 h-24 w-24 rounded-full border-[18px] border-[#c3e3d1] opacity-80" />
      <div className="absolute bottom-12 right-2 h-32 w-32 rounded-full bg-[#c7e8d4] opacity-70" />
      <div className="absolute right-8 top-5 h-5 w-24 rotate-45 rounded-full bg-[#b5dcc5] opacity-80" />
      <div className="absolute bottom-10 left-14 h-4 w-24 -rotate-45 rounded-full bg-[#b5dcc5] opacity-80" />

      <div className="floating-card absolute left-[8%] top-[12%] w-[84%] rounded-[25px] border border-white/80 bg-white p-5 shadow-[0_28px_70px_rgba(7,91,76,0.16)] sm:p-7">
        <div className="flex items-center justify-between border-b border-[#e2eae4] pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#075b4c] text-white">
              <Icon name="shieldCheck" width={20} height={20} />
            </span>
            <div>
              <p className="font-display text-lg text-[#143f3b]">DefiOra</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#607a78]">Security checkpoint</p>
            </div>
          </div>
          <span className="status-pill status-pill-green">Illustrative preview</span>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-[#f7fbf8] p-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e4f3ec] text-[#075b4c]"><Icon name="document" width={17} height={17} /></span>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#143f3b]">Extract &amp; analyze</p>
              <p className="mt-1 text-[11px] text-[#607a78]">Read key information</p>
            </div>
            <span className="text-xs font-bold text-[#13866b]">01</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#f7fbf8] p-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0eb] text-[#c45140]"><Icon name="link" width={17} height={17} /></span>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#143f3b]">Verify evidence</p>
              <p className="mt-1 text-[11px] text-[#607a78]">Compare available sources</p>
            </div>
            <span className="text-xs font-bold text-[#13866b]">02</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#f7fbf8] p-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eceafa] text-[#695a9a]"><Icon name="userCheck" width={17} height={17} /></span>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#143f3b]">Human review</p>
              <p className="mt-1 text-[11px] text-[#607a78]">Resolve flagged issues</p>
            </div>
            <span className="text-xs font-bold text-[#607a78]">03</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[8%] right-[1%] w-[68%] rounded-[22px] border border-white bg-white p-4 shadow-[0_22px_55px_rgba(7,91,76,0.17)] sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0eb] text-[#ff725e]"><Icon name="clipboard" width={19} height={19} /></span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#607a78]">Your evidence report</p>
            <p className="mt-1 font-display text-lg text-[#143f3b]">Comparison complete</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f7fbf8] px-3 py-2.5">
          <span className="text-xs font-semibold text-[#607a78]">Review findings before submitting</span>
          <Icon name="arrowUpRight" width={17} height={17} className="text-[#075b4c]" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fcfaf5] text-[#143f3b]">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="hero-grid pointer-events-none absolute inset-x-0 top-0 h-[630px] opacity-60" />
        <div className="shell relative grid items-center gap-12 pb-20 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#bcdccc] bg-[#f1faf5] px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#075b4c]">
              <Icon name="shieldCheck" width={14} height={14} />
              AI-Powered · Evidence Verification · Human Review
            </div>
            <h1 className="font-display mt-7 max-w-[660px] text-[clamp(3.2rem,5.7vw,5.35rem)] leading-[0.99] text-[#143f3b]">
              Put a security checkpoint between your information and the <span className="text-[#ff725e]">Submit button.</span>
            </h1>
            <p className="mt-7 max-w-[570px] text-lg leading-8 text-[#607a78] sm:text-xl">
              Check your application, supporting evidence, and submission risks before you click Submit.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/check" className="button button-primary justify-center sm:justify-start">
                <Icon name="shieldCheck" width={18} height={18} />
                Check My Application <Icon name="arrow" width={17} height={17} />
              </Link>
              <Link href="/check#demo" className="button button-secondary justify-center sm:justify-start">
                Explore Demo Case <Icon name="arrowUpRight" width={16} height={16} />
              </Link>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#607a78]">AI extraction <span className="mx-2 text-[#ff725e]">•</span> Evidence verification <span className="mx-2 text-[#ff725e]">•</span> Explainable warnings</p>
          </div>
          <HeroIllustration />
        </div>
      </section>

      <section className="border-y border-[#e2eae4] bg-white/75" aria-label="DefiOra principles">
        <div className="shell grid gap-0 py-4 md:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, index) => (
            <div key={principle.title} className={`flex gap-3 px-0 py-5 sm:px-5 lg:py-6 ${index > 0 ? "lg:border-l lg:border-[#e2eae4]" : ""}`}>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${principle.tone}`}><Icon name={principle.icon} width={19} height={19} /></span>
              <div>
                <h2 className="text-sm font-extrabold text-[#143f3b]">{principle.title}</h2>
                <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#607a78]">{principle.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="shell py-20 sm:py-24">
        <div className="overflow-hidden rounded-[32px] bg-[#e4f3ec] p-5 sm:p-8 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.6fr] lg:items-center">
            <div className="max-w-sm">
              <p className="eyebrow">How it works</p>
              <h2 className="font-display mt-4 text-4xl leading-[1.03] text-[#143f3b] sm:text-5xl">A safer way to submit your application.</h2>
              <p className="mt-5 text-sm leading-7 text-[#607a78]">DefiOra acts as your AI-powered security checkpoint, helping you spot inconsistencies, review supporting evidence, and understand what needs attention before submitting.</p>
              <p className="mt-6 font-display text-xl italic text-[#075b4c]">Less guesswork. More confidence.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {workflowCards.map((card, index) => (
                <div key={card.number} className={`relative rounded-2xl border border-[#d6e5dc] p-5 ${card.tone} shadow-[0_8px_24px_rgba(7,91,76,0.04)]`}>
                  {index < workflowCards.length - 1 && <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#c9dfd2] bg-[#e4f3ec] text-[#075b4c] xl:flex"><Icon name="arrow" width={13} height={13} /></span>}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#13866b]">{card.number}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4f3ec] text-[#075b4c]"><Icon name={card.icon} width={18} height={18} /></span>
                  </div>
                  <h3 className="mt-7 text-sm font-extrabold text-[#143f3b]">{card.title}</h3>
                  <p className="mt-2 min-h-10 text-xs leading-5 text-[#607a78]">{card.description}</p>
                  <span className="mt-5 inline-flex rounded-full bg-[#f1faf5] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#075b4c]">{card.badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-[#06483f] px-5 py-5 text-[#e4f3ec] sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-start gap-3">
              <Icon name="lock" width={19} height={19} className="mt-0.5 shrink-0 text-[#a7ddc1]" />
              <p className="text-xs leading-5"><strong className="text-white">Prototype privacy note:</strong> DefiOra uses synthetic/demo data for the hackathon. Never upload real identity documents to the demo.</p>
            </div>
            <p className="max-w-xs text-xs leading-5 text-[#a7ddc1] sm:text-right">DefiOra is a review aid, not a final verification or fraud decision.</p>
          </div>
        </div>
      </section>

      <section id="about" className="shell pb-20 sm:pb-24">
        <div className="grid gap-7 rounded-[28px] border border-[#e2eae4] bg-white p-7 shadow-[0_14px_45px_rgba(20,63,59,0.05)] sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">About DefiOra</p>
            <h2 className="font-display mt-3 text-3xl text-[#143f3b] sm:text-4xl">A thoughtful pause before the final click.</h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-[#607a78]">DefiOra is an AI-powered pre-submission security layer that compares application information against supporting evidence, identifies inconsistencies, and explains what needs review before submission.</p>
        </div>
      </section>

      <footer className="border-t border-[#e2eae4] bg-white/70">
        <div className="shell flex flex-col gap-3 py-7 text-xs text-[#607a78] sm:flex-row sm:items-center sm:justify-between">
          <p>AI extracts. Evidence provides context. Rules compare. DefiOra warns.</p>
          <Link href="/check" className="font-bold text-[#075b4c] hover:text-[#ff725e]">Open your checkpoint <span aria-hidden="true">→</span></Link>
        </div>
      </footer>
    </main>
  );
}
