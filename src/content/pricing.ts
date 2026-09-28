import type { DeviceKey, IssueKey } from "@/lib/repairs";

// PLACEHOLDER PRICES: replace with the shop's real starting prices before launch.
export type PriceRow = { name: string; note?: string; from: number | null; plusParts?: boolean; issue: IssueKey };

export const pricing: { device: DeviceKey; label: string; rows: PriceRow[] }[] = [
  {
    device: "phone",
    label: "Phones",
    rows: [
      { name: "Screen replacement", note: "Android & iPhone. Price depends on model.", from: 69, issue: "screen" },
      { name: "Battery replacement", from: 49, issue: "battery" },
      { name: "Charging port repair", from: 59, issue: "charging" },
      { name: "Back glass replacement", from: 79, issue: "screen" },
      { name: "Camera or lens repair", from: 59, issue: "other" },
      { name: "Water damage treatment", note: "Cleaning and assessment.", from: 49, issue: "water" },
      { name: "Data transfer to new phone", from: 29, issue: "data" },
    ],
  },
  {
    device: "laptop",
    label: "Laptops",
    rows: [
      { name: "Screen replacement", note: "MacBook, Windows & Chromebook.", from: 119, issue: "screen" },
      { name: "Broken key repair", note: "Single key or keycap.", from: 25, issue: "keys" },
      { name: "Full keyboard replacement", from: 89, issue: "keys" },
      { name: "Battery replacement", from: 89, issue: "battery" },
      { name: "Charging port / DC jack", from: 89, issue: "charging" },
      { name: "SSD upgrade & data migration", from: 79, plusParts: true, issue: "upgrade" },
      { name: "RAM upgrade", from: 39, plusParts: true, issue: "upgrade" },
      { name: "Virus removal & tune-up", from: 69, issue: "software" },
      { name: "Operating system reinstall", from: 79, issue: "software" },
    ],
  },
  {
    device: "tablet",
    label: "Tablets",
    rows: [
      { name: "Glass / screen replacement", from: 99, issue: "screen" },
      { name: "Battery replacement", from: 89, issue: "battery" },
      { name: "Charging port repair", from: 79, issue: "charging" },
    ],
  },
  {
    device: "console",
    label: "Consoles",
    rows: [
      { name: "HDMI port replacement", from: 99, issue: "other" },
      { name: "Disc drive repair", from: 89, issue: "other" },
      { name: "Deep clean & thermal paste", note: "Fixes most overheating & fan noise.", from: 59, issue: "other" },
      { name: "Controller stick drift", from: 39, issue: "other" },
    ],
  },
  {
    device: "desktop",
    label: "Desktops & Data",
    rows: [
      { name: "Diagnostic", note: "We'll tell you the cost before we start.", from: null, issue: "power" },
      { name: "Power supply replacement", from: 49, plusParts: true, issue: "power" },
      { name: "Custom PC build", from: 99, plusParts: true, issue: "upgrade" },
      { name: "Data recovery", note: "Depends on drive condition.", from: 99, issue: "data" },
    ],
  },
];
