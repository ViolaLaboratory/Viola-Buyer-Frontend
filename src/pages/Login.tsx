import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import API_ENDPOINTS from "@/config/api";
import { normalizeProfileImageUrl } from "@/utils/profileImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * LogoMark Component
 * Displays the Viola logo SVG
 */
const LogoMark = () => (
  <svg
    viewBox="0 0 72 55"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-auto"
  >
    <path
      d="M35.1375 54.8993C35.0844 55.8883 32.5205 49.348 31.3059 46.0832C30.7393 44.5589 36.4796 44.8638 38.059 44.4916C43.6789 43.1622 55.2446 38.3589 56.4097 21.2373C56.9727 12.96 47.7159 9.45769 47.7974 5.56189C47.9143 1.0616e-06 55.6802 0.127614 55.6802 0.127614L69.3741 0C71.2723 0.0460832 72.5223 1.98867 71.7857 3.73983L50.9491 53.2438C50.5277 54.2435 49.5503 54.8922 48.4667 54.8922H35.1375V54.8993Z"
      fill="currentColor"
    />
    <path
      d="M16.1494 4.20421L37.6163 51.4359C38.3635 53.0807 37.0604 54.8993 35.1339 54.8993H24.8396C23.7559 54.8993 22.7786 54.2966 22.3572 53.375L1.23368 4.20421"
      fill="currentColor"
    />
    <path
      d="M23.4124 53.5274L0.213799 4.07659C-0.533402 2.38215 0.769773 0.506915 2.69621 0.506915H12.9906C14.0742 0.506915 15.0516 1.12727 15.473 2.08083L37.8324 52.7582"
      fill="currentColor"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials.");
      }

      if (data.user) {
        const u = data.user;
        login({
          id: u.id,
          username: u.username,
          email: u.email,
          profile_image: normalizeProfileImageUrl(u.profile_image),
          plan: "Free plan",
        });
      }
      navigate("/demo/home");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Waveform Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/waveform.png"
          alt="Waveform background"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Fallback to gradient if image doesn't exist
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-600 via-red-500 to-yellow-400 opacity-90"
          style={{ display: 'none' }}
        ></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="text-white">
              <LogoMark />
            </div>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
              <p className="text-gray-400 text-sm">or create a new account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="text"
                  placeholder="Email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-lg"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-full text-white font-medium bg-gradient-to-r from-[#6B21A8] via-[#5B21B6] to-[#1E3A8A] hover:from-[#581C87] hover:via-[#4C1D95] hover:to-[#1E40AF] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? "Entering..." : "Enter"}
              </Button>
            </form>

            {/* Optional: Add link to create account */}
            <div className="text-center">
              <button
                onClick={() => navigate("/signup")}
                className="text-sm text-gray-400 hover:text-gray-300 underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
