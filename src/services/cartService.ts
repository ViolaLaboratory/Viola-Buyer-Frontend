import API_ENDPOINTS from "@/config/api";

export type CartPriceOption = "30_sec" | "1_min" | "contact_sales";

export type CartItem = {
  item_key: string;
  track_id: string;
  title: string;
  artist: string;
  price_option: CartPriceOption;
  unit_price: number;
  quantity: number;
};

type CartResponse = {
  items: CartItem[];
  count: number;
  subtotal: number;
};

export const getCart = async (): Promise<CartResponse> => {
  const res = await fetch(API_ENDPOINTS.CART_GET, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load cart");
  return res.json();
};

export const addCartItem = async (payload: {
  track_id: string;
  title: string;
  artist: string;
  price_option: CartPriceOption;
  unit_price: number;
  quantity?: number;
}): Promise<CartResponse> => {
  const res = await fetch(API_ENDPOINTS.CART_ADD_ITEM, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add cart item");
  return res.json();
};

export const removeCartItem = async (itemKey: string): Promise<CartResponse> => {
  const res = await fetch(API_ENDPOINTS.CART_REMOVE_ITEM(itemKey), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to remove cart item");
  return res.json();
};

export const hasTrackInCart = async (trackId: string): Promise<boolean> => {
  const cart = await getCart();
  const normalizedTrackId = String(trackId);
  return (cart.items || []).some((item) => String(item.track_id) === normalizedTrackId);
};
