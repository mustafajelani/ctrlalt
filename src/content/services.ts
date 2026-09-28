import { images } from "./images";

export const coreServices = [
  {
    id: "repair",
    code: "01",
    title: "Hardware Repair",
    summary: "Screen replacements, broken keys, or repairing any other piece of hardware.",
    image: images.phoneBench,
    href: "/services#repair",
    points: ["Cracked screens & back glass", "Batteries & charging ports", "Keyboards & broken keys", "Board-level & water damage"],
  },
  {
    id: "sales",
    code: "02",
    title: "Sales",
    summary: "Laptops, phones, and other electronics are available for purchase.",
    image: images.electronicsDisplay,
    href: "/shop",
    points: ["Laptops & phones", "Game consoles & controllers", "Chargers, cables & cases", "Reserve online, pick up in store"],
  },
  {
    id: "advice",
    code: "03",
    title: "Advice & Other Services",
    summary: "If you need help upgrading your device or need an answer to a tech problem, we can help you get what you need.",
    image: images.technician,
    href: "/services#advice",
    points: ["SSD & RAM upgrades", "Virus removal & tune-ups", "Data transfer & recovery", "Honest buying advice"],
  },
] as const;

export const deviceServices = [
  {
    device: "phone",
    title: "Phones",
    blurb: "iPhone, Samsung Galaxy, Google Pixel, Motorola and more.",
    image: images.phoneRepair,
    repairs: ["Screen replacement", "Battery replacement", "Charging port", "Back glass", "Camera & lens", "Speaker & microphone", "Water damage", "Data transfer"],
  },
  {
    device: "laptop",
    title: "Laptops",
    blurb: "MacBook, Dell, HP, Lenovo, ASUS, Acer, Microsoft Surface.",
    image: images.laptopRepair,
    repairs: ["Screen replacement", "Keyboard & broken keys", "Battery", "Charging port / DC jack", "Hinges & housing", "SSD & RAM upgrades", "Overheating & fan cleaning", "OS reinstall"],
  },
  {
    device: "tablet",
    title: "Tablets",
    blurb: "iPad, Samsung Galaxy Tab, Amazon Fire and more.",
    image: images.tablet,
    repairs: ["Glass & LCD replacement", "Battery", "Charging port", "Buttons & cameras"],
  },
  {
    device: "console",
    title: "Game Consoles",
    blurb: "PlayStation, Xbox, Nintendo Switch and controllers.",
    image: images.console,
    repairs: ["HDMI port", "Disc drive", "Overheating & cleaning", "Controller stick drift", "Power issues"],
  },
  {
    device: "desktop",
    title: "Desktops & Data",
    blurb: "Custom builds, upgrades, diagnostics and recovery.",
    image: images.dataDrive,
    repairs: ["Diagnostics", "Power supply replacement", "Upgrades & custom builds", "Virus & malware removal", "Data recovery"],
  },
] as const;

export const processSteps = [
  { title: "Book or walk in", body: "Reserve a time online or stop by the shop during business hours." },
  { title: "Diagnose & quote", body: "We find the fault and give you an upfront price before any work starts." },
  { title: "Expert repair", body: "Quality parts, careful hands, and a full test once the repair is done." },
  { title: "Back in action", body: "Track progress online and pick up your device as soon as it's ready." },
] as const;
