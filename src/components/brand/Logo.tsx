import Image from "next/image";
import Link from "next/link";
import logo from "../../../public/brand/logo-horizontal.png";

export function Logo({ className = "h-8 w-auto", priority }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center rounded-sm" aria-label="CTRL ALT DEL home">
      <Image src={logo} alt="" className={className} sizes="200px" priority={priority} />
    </Link>
  );
}
