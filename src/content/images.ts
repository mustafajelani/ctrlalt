// Stock photography (Unsplash). Swap any `src` for your own photos in /public, e.g. "/photos/bench.jpg".
// Unsplash originals can be 6000px+; cap the source so the image optimizer fetches it quickly.
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const images = {
  phoneBench: { src: u("photo-1746005718004-1f992c399428"), alt: "A disassembled iPhone and repair tools laid out on a work mat" },
  phoneRepair: { src: u("photo-1550041473-d296a3a8a18a"), alt: "Technician repairing an Android smartphone" },
  laptopRepair: { src: u("photo-1721333089073-215a56fd710c"), alt: "Technician opening a laptop with a precision screwdriver" },
  technician: { src: u("photo-1654593114209-d915f46be333"), alt: "A friendly technician repairing a laptop in the shop" },
  shopFloor: { src: u("photo-1742989667140-c69adadf556b"), alt: "Two technicians working in an electronics repair shop" },
  electronicsDisplay: { src: u("photo-1698226929845-b29f31278c1a"), alt: "A display of electronics and video games for sale" },
  motherboard: { src: u("photo-1742477012583-804ba592b2c8"), alt: "Close-up of a computer motherboard in low light" },
  soldering: { src: u("photo-1581090465980-58ea88b43443"), alt: "Hands soldering a component on a circuit board" },
  console: { src: u("photo-1606144042614-b2417e99c4e3"), alt: "A game console with a matching wireless controller" },
  dataDrive: { src: u("photo-1601737487795-dab272f52420"), alt: "An opened hard disk drive" },
  crackedScreen: { src: u("photo-1746006084492-24a8fd02710a"), alt: "A smartphone with a shattered screen" },
  tablet: { src: u("photo-1561154464-82e9adf32764"), alt: "A black iPad on a table" },
} as const;
