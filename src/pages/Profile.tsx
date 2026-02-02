/**
 * Profile Page - Displays logged-in user information
 */

import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, LogOut, ChevronDown, Camera, CreditCard } from "lucide-react";
import { normalizeProfileImageUrl } from "@/utils/profileImage";
import { useToast } from "@/hooks/use-toast";

const PLAN_OPTIONS = ["Free plan", "Pro plan", "Enterprise plan"] as const;

const PLAN_PRICES: Record<string, string> = {
  "Free plan": "$0/month",
  "Pro plan": "$9.99/month",
  "Enterprise plan": "$29.99/month",
};

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardholderName: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateUser({ profile_image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handlePlanSelect = (plan: string) => {
    if (plan === "Free plan") {
      updateUser({ plan });
      return;
    }
    setSelectedPlan(plan);
    setCardForm({ cardNumber: "", expiry: "", cvv: "", cardholderName: "" });
    setPaymentDialogOpen(true);
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleCardInputChange = (field: keyof typeof cardForm, value: string) => {
    if (field === "cardNumber") {
      setCardForm((prev) => ({ ...prev, [field]: formatCardNumber(value) }));
    } else if (field === "expiry") {
      setCardForm((prev) => ({ ...prev, [field]: formatExpiry(value) }));
    } else if (field === "cvv") {
      setCardForm((prev) => ({ ...prev, [field]: value.replace(/\D/g, "").slice(0, 4) }));
    } else {
      setCardForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePaymentSubmit = async () => {
    const { cardNumber, expiry, cvv, cardholderName } = cardForm;
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 16) {
      toast({ title: "Invalid card number", variant: "destructive" });
      return;
    }
    if (expiry.replace(/\D/g, "").length < 4) {
      toast({ title: "Invalid expiry date (MM/YY)", variant: "destructive" });
      return;
    }
    if (cvv.length < 3) {
      toast({ title: "Invalid CVV (3–4 digits)", variant: "destructive" });
      return;
    }
    if (!cardholderName.trim()) {
      toast({ title: "Enter cardholder name", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    // Simulate payment processing – replace with Stripe/payment API in production
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);

    if (selectedPlan) {
      updateUser({ plan: selectedPlan });
      toast({ title: "Payment successful", description: `You are now on ${selectedPlan}.` });
      setPaymentDialogOpen(false);
      setSelectedPlan(null);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <p className="text-white/70 mb-4">You are not logged in.</p>
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-6">
      <Button
        variant="ghost"
        size="sm"
        className="text-white/70 hover:text-white mb-6 -ml-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.75),rgba(10,10,12,0.65))] p-8 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          {/* Avatar - clickable to upload new image */}
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-[0_0_24px_rgba(255,255,255,0.15)]">
              <img
                src={normalizeProfileImageUrl(user.profile_image)}
                alt={`${user.username} profile`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/michael.png";
                }}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white transition-colors cursor-pointer shadow-lg"
              aria-label="Change profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Name */}
          <h1 className="text-2xl font-dm font-semibold text-white mb-1">
            {user.username}
          </h1>

          {/* Email */}
          <p className="text-white/60 text-sm mb-4">{user.email}</p>

          {/* Plan badge - clickable dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-dm mb-8 hover:bg-white/15 transition-colors cursor-pointer"
              >
                {user.plan || "Pro plan"}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-48 bg-black/95 border-white/20 text-white"
            >
              {PLAN_OPTIONS.map((plan) => (
                <DropdownMenuItem
                  key={plan}
                  className="focus:bg-white/10 focus:text-white cursor-pointer"
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Payment Dialog */}
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogContent className="bg-black/95 border-white/20 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <CreditCard className="h-5 w-5" />
                  Subscribe to {selectedPlan}
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  {selectedPlan && PLAN_PRICES[selectedPlan]} · Billed monthly
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-white/90">
                    Card number
                  </Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardForm.cardNumber}
                    onChange={(e) => handleCardInputChange("cardNumber", e.target.value)}
                    maxLength={19}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry" className="text-white/90">
                      Expiry (MM/YY)
                    </Label>
                    <Input
                      id="expiry"
                      placeholder="12/28"
                      value={cardForm.expiry}
                      onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                      maxLength={5}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-white/90">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      type="password"
                      placeholder="123"
                      value={cardForm.cvv}
                      onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                      maxLength={4}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardholderName" className="text-white/90">
                    Cardholder name
                  </Label>
                  <Input
                    id="cardholderName"
                    placeholder="Ryan Chan"
                    value={cardForm.cardholderName}
                    onChange={(e) => handleCardInputChange("cardholderName", e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <p className="text-xs text-white/50">
                  Your payment is secure. Card details are encrypted and never stored.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setPaymentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                  onClick={handlePaymentSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing…" : `Subscribe · ${selectedPlan && PLAN_PRICES[selectedPlan]}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Logout */}
          <Button
            variant="outline"
            className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
