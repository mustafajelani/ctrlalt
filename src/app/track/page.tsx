import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { TrackForm } from "@/components/track/TrackForm";

export const metadata: Metadata = {
  title: "Tracking",
  description: "Check the status of your repair or shop order at CTRL ALT DEL with your ticket or order number and the last four digits of your phone number.",
  alternates: { canonical: "/track" },
};

export default async function TrackPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await searchParams;
  return (
    <>
      <PageHero
        crumb="Tracking"
        title="Track a repair or order"
        intro="Enter the ticket ID from your repair booking (CAD-…) or the order number from checkout (ORD-…), plus the last 4 digits of your phone number."
      />
      <section className="container-x py-12 sm:py-16">
        <TrackForm initialId={typeof id === "string" ? id.slice(0, 20) : ""} />
      </section>
    </>
  );
}
