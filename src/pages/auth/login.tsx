import Image from "next/image";
import InputText from "@/components/input/InputText";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedRoute from "@/components/auth/AuthenticatedRoute";

export default function Login() {

  const {login} = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Invalid password format";
    return "";
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const emailErr = validateEmail(email);
  const passwordErr = validatePassword(password);

  setEmailError(emailErr);
  setPasswordError(passwordErr);
  setLoginError("");

  if (emailErr || passwordErr) return;

  try {
    await login({email, password});

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  } catch (error: unknown) {
    setLoginError("Login failed. Please check your credentials.");
  }
}

useEffect(() => {
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    setEmail(rememberedEmail);
    setRememberMe(true);
  }
}, []);


  return (
    <AuthenticatedRoute>
      <div className="flex items-center justify-center h-screen overflow-hidden relative">
        {/* login container */}
        <div className="w-full p-4 max-w-[440px] gap-14 flex flex-col">
          {/* login header */}
          <div className="text-center gap-2">
            <h1 className="font-bold text-[56px] text-black">
              Welcome back!
            </h1>
            <h3 className="font-bold text-[24px] text-gray-6 tracking-tight">
              Find your perfect pet sitter with us
            </h3>
          </div>

          {/* login form */}
          <form onSubmit={handleSubmit} className="gap-8 flex flex-col">
              {/* email input */}
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{loginError}</p>
                </div>
              )}

              <div>
                <InputText
                  label="Email"
                  type="email"
                  placeholder="email@company.com"
                  variant={emailError ? "error" : "default"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                  <p className="text-red text-sm mt-1">{emailError}</p>
                )}
              </div>

              {/* password input */}
              <div>
                <InputText
                  label="Password"
                  type="password"
                  placeholder="Password"
                  variant={passwordError ? "error" : "default"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-red text-sm mt-1">{passwordError}</p>
                )}
              </div>

            {/* remember me and forget password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">

                <Checkbox
                  id="remember-me"
                  name="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === "indeterminate" ? false : checked)}
                  className="h-6 w-6 border border-border hover:cursor-pointer hover:border-orange-5"
                />
                <label
                  htmlFor="remember-me"
                  className="text-[16px] font-medium text-gray-9"
                >
                  Remember?
                </label>
              </div>

              {/* forget password */}
              <div>
                <span className="text-[16px] font-bold text-orange-5 cursor-pointer">
                  <Link href="/forget-password">Forget Password</Link>
                </span>
              </div>
            </div>

            {/* login button */}
            <PrimaryButton text="Login" bgColor="primary" textColor="white" className="w-full justify-center" type="submit"/>

            {/* register prompt */}
            <div className="text-center">
              <p className="text-[18px] font-medium text-ink">
                Don&apos;t have any account?
                <span className="text-orange-5 hover:text-orange-6 cursor-pointer ml-2">
                  <Link href="/register">Register</Link>
                  
                </span>
              </p>
            </div>
          </form>
        </div>

        {/* decorative elements container*/}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute bottom-90 left-27 hidden md:block">
            <Image
              src="/icons/Ellipse-15.svg"
              alt="Decorative element"
              width={117}
              height={117}
              className="rotate-45"
            />
          </div>
          <div className="absolute bottom-8 left-3 hidden md:block">
            <Image
              src="/icons/Star-1.svg"
              alt="Decorative element"
              width={310}
              height={310}
              className="rotate-35"
            />
          </div>
          <div className="absolute top-[-100px] right-[-20px] md:top-24 md:right-24">
            <Image
              src="/icons/PinkPaw.svg"
              alt="Decorative element"
              width={250}
              height={250}
              className="rotate-280"
            />
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
