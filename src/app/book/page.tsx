import type { Metadata } from "next";
import { BookingForm } from "@/components/booking/BookingForm";
import { PageHero } from "@/components/sections/PageHero";
import { deviceTypes, issueTypes, type DeviceKey, type IssueKey } from "@/lib/repairs";

export const metadata: Metadata = {
  title: "Book a Repair",
  description: "Book a phone, laptop, tablet or console repair at CTRL ALT DEL in Kensington, Philadelphia. Pick a time and get a ticket to track your repair online.",
  alternates: { canonical: "/book" },
};

export default async function BookPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { device, issue, repair } = await searchParams;
  const initialDevice = deviceTypes.find((d) => d.key === device)?.key as DeviceKey | undefined;
  const initialIssue = issueTypes.find((i) => i.key === issue)?.key as IssueKey | undefined;

  return (
    <>
      <PageHero
        crumb="Book a repair"
        title="Book a repair"
        intro="Takes about a minute. Pick a time, tell us what's wrong, and you'll get a ticket ID to track your repair online."
      />
      <section className="container-x py-12 sm:py-16">
        <BookingForm initialDevice={initialDevice} initialIssue={initialIssue} initialDetails={typeof repair === "string" ? repair.slice(0, 80) : ""} />
      </section>
    </>
  );
}
