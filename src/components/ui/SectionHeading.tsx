export type HeadingTier = "primary" | "secondary";

const tierClass: Record<HeadingTier, string> = {
  primary: "text-[2rem] sm:text-5xl lg:text-[3.5rem]",
  secondary: "text-[1.625rem] sm:text-4xl lg:text-[2.5rem]",
};

/** Section header with a PCB silkscreen label: `code` is the reference designator chip (e.g. "U1"). */
export function SectionHeading({
  code,
  eyebrow,
  title,
  intro,
  tier = "primary",
  align = "left",
  as: Tag = "h2",
}: {
  code: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  tier?: HeadingTier;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p data-reveal className="silk">
        <span className="silk-ref">{code}</span>
        {eyebrow}
      </p>
      <Tag className={`display mt-4 ${tierClass[tier]}`}>{title}</Tag>
      {intro && (
        <p className="mt-5 text-base leading-relaxed sm:text-lg">
          <span className="opacity-75">{intro}</span>
        </p>
      )}
    </div>
  );
}
