import { Icon } from "@/components/Icon";
import type { ChecklistItem } from "@/lib/types";

export function ActionChecklist({ items }: { items: ChecklistItem[] }) {
  return (
    <section className="rounded-[28px] border border-[#bcdccc] bg-[#e4f3ec] p-6 shadow-[0_14px_45px_rgba(20,63,59,0.06)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Before you submit</p>
          <h2 className="font-display mt-2 text-4xl text-[#143f3b]">Your review checklist.</h2>
        </div>
        <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#075b4c] sm:flex"><Icon name="check" width={20} height={20} /></div>
      </div>
      <div className="mt-6 space-y-2">
        {items.map((item) => (
          <div key={item.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${item.emphasis && !item.complete ? "border-[#e9d6a9] bg-[#fff9e9]" : "border-[#c9dfd2] bg-white/75"}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${item.complete ? "border-[#acd9c4] bg-[#effaf4] text-[#075b4c]" : "border-[#d8c58e] bg-[#fffdf7] text-[#8b6718]"}`} aria-label={item.complete ? "Complete" : "Needs review"}>
              {item.complete ? <Icon name="check" width={13} height={13} /> : ""}
            </span>
            <span className={`text-sm ${item.complete ? "text-[#607a78]" : "font-semibold text-[#143f3b]"}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
