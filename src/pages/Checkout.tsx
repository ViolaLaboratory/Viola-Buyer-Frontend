import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "@/config/api";
import { getCart, removeCartItem, type CartItem } from "@/services/cartService";

type CheckoutItem = CartItem;

type QuoteResponse = {
  subtotal: number;
  promo_discount: number;
  tax_amount: number;
  total: number;
  deposit_amount: number;
  remainder_amount: number;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value || 0);

const Checkout = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [message, setMessage] = useState("");
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  const items = useMemo(
    () =>
      cartItems.map((item) => ({
        track_id: item.track_id,
        title: item.title,
        artist: item.artist,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    [cartItems]
  );

  const loadCart = async () => {
    setCartLoading(true);
    try {
      const data = await getCart();
      setCartItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const loadQuote = async () => {
    if (items.length === 0) {
      setQuote(null);
      return;
    }
    const res = await fetch(API_ENDPOINTS.CHECKOUT_QUOTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        items,
        promo_code: promoCode,
        deposit_rate: 0.05,
        tax_rate: 0.01,
      }),
    });
    if (!res.ok) throw new Error("Failed to load quote");
    const data = await res.json();
    setQuote(data);
  };

  const handleSubmit = async () => {
      if (items.length === 0) {
        setMessage("Cart is empty. Please add tracks first.");
        return;
      }
      if (!name || !email) {
        setMessage("Please enter your name and email to continue.");
        return;
      }
    setIsSubmitting(true);
    setMessage("");
    try {
      if (!quote) {
        await loadQuote();
      }
      const res = await fetch(API_ENDPOINTS.CHECKOUT_SUBMIT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          phone,
          payment_provider: "manual",
          items,
          promo_code: promoCode,
          deposit_rate: 0.05,
          tax_rate: 0.01,
        }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const data = await res.json();
      setMessage(`Order created: ${data.order_id} (payment status: ${data.payment_status})`);
      await loadQuote();
      navigate("/demo/license", {
        state: {
          orderId: data.order_id,
          email,
          name,
        },
      });
    } catch {
      setMessage("Checkout request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  return (
    <div className="h-screen overflow-y-auto px-8 py-6 text-white">
      <h1 className="text-5xl font-dm mb-6">Checkout</h1>
      <div className="grid grid-cols-2 gap-10">
        <section>
          <h2 className="text-3xl font-dm mb-4">Information</h2>
          <div className="space-y-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="(e.g.) Jane Doe" className="w-full rounded bg-white/10 border border-white/20 px-4 py-3" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(xxx)-xxx-xxxx" className="w-full rounded bg-white/10 border border-white/20 px-4 py-3" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="(e.g.) xxxxxxx@gmail.com" className="w-full rounded bg-white/10 border border-white/20 px-4 py-3" />
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-dm mb-4">Your Cart</h2>
          <div className="rounded-xl border border-white/20 p-4">
            {cartLoading && <div className="text-white/60">Loading cart...</div>}
            {!cartLoading && cartItems.length === 0 && <div className="text-white/60">Your cart is empty.</div>}
            {cartItems.map((item) => (
              <div key={item.item_key} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                <div>
                  <div className="font-dm">{item.title}</div>
                  <div className="text-white/60 text-sm">{item.artist} · {item.price_option}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span>{money(item.quantity * item.unit_price)}</span>
                  <button
                    type="button"
                    className="text-xs text-red-300 hover:text-red-200"
                    onClick={async () => {
                      const next = await removeCartItem(item.item_key);
                      setCartItems(next.items || []);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-dm mt-8 mb-4">Order Summary</h2>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5 space-y-3">
            <div className="flex justify-between"><span>Track Deposit (5%)</span><span>{money(quote?.deposit_amount ?? subtotal * 0.05)}</span></div>
            <div className="flex justify-between"><span>Tracks x1</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between"><span>Sales Tax</span><span>{money(quote?.tax_amount ?? subtotal * 0.01)}</span></div>
            <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter Promo Code" className="w-full rounded bg-black/40 border border-white/20 px-4 py-2" />
            <button onClick={loadQuote} className="text-sm text-white/70 hover:text-white">Apply/Refresh</button>
            <div className="flex justify-between text-xl font-dm pt-2 border-t border-white/15"><span>Total</span><span>{money(quote?.total ?? subtotal * 1.01)}</span></div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className="w-full rounded-lg bg-[#4b3dbf] py-3 text-lg font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Processing..." : `Pay ${money(quote?.deposit_amount ?? subtotal * 0.05)} Deposit`}
            </button>
            {message && <p className="text-sm text-white/80">{message}</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Checkout;
