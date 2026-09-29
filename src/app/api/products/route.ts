import { getShopProducts } from "@/lib/catalog";

/** Public live catalog for the cart and checkout: name, main photo, price, reservable units and status. */
export async function GET() {
  const products = await getShopProducts();
  const body = Object.fromEntries(
    products.map((p) => [p.slug, { slug: p.slug, name: p.name, condition: p.condition, image: p.image, price: p.price, available: p.stock, status: p.status }]),
  );
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
