import { useState, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeProfileImageUrl } from "@/utils/profileImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import API_ENDPOINTS from "@/config/api";

/** User-friendly message when server/network fails */
const SERVER_ERROR_MESSAGE = "There is a problem with the server. Please try again later.";

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

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "verify" | "complete">("email");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.SEND_VERIFICATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        setError(SERVER_ERROR_MESSAGE);
        return;
      }
      const data = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        throw new Error((data.error as string) || (data.email as string[])?.[0] || 'Failed to send verification code');
      }

      setEmailSent(true);
      setStep("verify");
      
      // In development, show the code if provided
      if (data.code) {
        console.log('Verification code (dev mode):', data.code);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send verification code';
      setError(
        msg.includes('JSON') || msg.includes('Unexpected token') || msg.includes('fetch') || msg.includes('Network')
          ? SERVER_ERROR_MESSAGE
          : msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!verificationCode || !username || !password) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_EMAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
          username,
          password,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        setError(SERVER_ERROR_MESSAGE);
        return;
      }
      let data: Record<string, unknown>;
      try {
        data = (await response.json()) as Record<string, unknown>;
      } catch {
        setError(SERVER_ERROR_MESSAGE);
        return;
      }

      if (!response.ok) {
        throw new Error(
          (data.error as string) ||
          (data.code as string[])?.[0] ||
          (data.username as string[])?.[0] ||
          (data.password as string[])?.[0] ||
          'Failed to verify code'
        );
      }

      setStep("complete");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to verify code';
      setError(
        msg.includes('JSON') || msg.includes('Unexpected token') || msg.includes('fetch') || msg.includes('Network')
          ? SERVER_ERROR_MESSAGE
          : msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('username', username);
      formData.append('password', password);
      if (profileImageFile) {
        formData.append('profile_image', profileImageFile);
      }

      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        setError(SERVER_ERROR_MESSAGE);
        return;
      }
      let data: Record<string, unknown>;
      try {
        data = (await response.json()) as Record<string, unknown>;
      } catch {
        setError(SERVER_ERROR_MESSAGE);
        return;
      }

      if (!response.ok) {
        throw new Error(
          (data.error as string) ||
          (data.email as string[])?.[0] ||
          (data.username as string[])?.[0] ||
          (data.password as string[])?.[0] ||
          'Failed to create account'
        );
      }

      // Log in with created user and go to demo
      const u = data.user;
      if (u && typeof u === "object") {
        const rec = u as Record<string, unknown>;
        login({
          id: Number(rec.id),
          username: (rec.username as string) || username,
          email: (rec.email as string) || email,
          profile_image: normalizeProfileImageUrl(rec.profile_image as string | undefined),
          plan: "Free plan",
          account_type: (rec.account_type as "buyer" | "seller") ?? "buyer",
          seller_verified: Boolean(rec.seller_verified),
          portal: "buyer",
        });
      }
      navigate("/demo/marketplace");
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create account';
      setError(
        msg.includes('JSON') || msg.includes('Unexpected token') || msg.includes('fetch') || msg.includes('Network')
          ? SERVER_ERROR_MESSAGE
          : msg
      );
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

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="text-white">
              <LogoMark />
            </div>
          </div>

          {/* Signup Form */}
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Signup</h1>
              <p className="text-gray-400 text-sm">or login to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Step 1: Email Verification */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-lg"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-full text-white font-medium bg-gradient-to-r from-[#6B21A8] via-[#5B21B6] to-[#1E3A8A] hover:from-[#581C87] hover:via-[#4C1D95] hover:to-[#1E40AF] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            )}

            {/* Step 2: Verify Email Code */}
            {step === "verify" && (
              <form onSubmit={handleVerificationSubmit} className="space-y-5">
                {emailSent && (
                  <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-3 text-sm text-white">
                    Verification code sent to {email}
                  </div>
                )}

                <div className="space-y-2">
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="h-12 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </Button>
              </form>
            )}

            {/* Step 3: Complete Profile */}
            {step === "complete" && (
              <form onSubmit={handleCompleteSignup} className="space-y-5">
                <div className="flex flex-col items-center space-y-4">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-400">Add a profile picture</p>
                </div>

                <div className="space-y-2">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                  {isLoading ? "Creating Account..." : "Complete Signup"}
                </Button>
              </form>
            )}

            {/* Login Link */}
            <div className="text-center">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-400 hover:text-gray-300 underline"
              >
                Already have an account? Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
