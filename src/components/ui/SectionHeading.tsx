export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  align = "left",
  as: Tag = "h2",
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p data-reveal className="eyebrow">
        {index && <span className="opacity-70">{index} /</span>}
        {eyebrow}
      </p>
      <Tag data-reveal style={{ "--i": 1 } as React.CSSProperties} className="display mt-4 text-4xl sm:text-5xl lg:text-6xl">
        {title}
      </Tag>
      {intro && (
        <p data-reveal style={{ "--i": 2 } as React.CSSProperties} className="mt-5 text-base leading-relaxed sm:text-lg">
          <span className="opacity-75">{intro}</span>
        </p>
      )}
    </div>
  );
}
