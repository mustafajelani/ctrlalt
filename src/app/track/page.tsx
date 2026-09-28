import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { TrackForm } from "@/components/track/TrackForm";

export const metadata: Metadata = {
  title: "Track Your Repair",
  description: "Check the status of your repair at CTRL ALT DEL with your ticket ID and the last four digits of your phone number.",
  alternates: { canonical: "/track" },
};

export default async function TrackPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await searchParams;
  return (
    <>
      <PageHero
        crumb="Track repair"
        title="Track your repair"
        intro="Enter the ticket ID from your booking confirmation or receipt, plus the last 4 digits of your phone number."
      />
      <section className="container-x py-12 sm:py-16">
        <TrackForm initialId={typeof id === "string" ? id.slice(0, 20) : ""} />
      </section>
    </>
  );
}
