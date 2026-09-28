import { Plus } from "@phosphor-icons/react/dist/ssr";

export function FaqList({ items, group }: { items: readonly { q: string; a: string }[]; group: string }) {
  return (
    <div className="border-t border-line">
      {items.map((item, i) => (
        <details key={item.q} name={`faq-${group}`} className="faq" data-reveal style={{ "--i": i } as React.CSSProperties}>
          <summary>
            {item.q}
            <Plus size={20} className="faq-icon text-signal" aria-hidden />
          </summary>
          <p className="max-w-3xl pb-6 text-fog">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
