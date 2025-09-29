import Image from "next/image";
import InputText from "@/components/input/InputText";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import SocialLogin from "@/components/login-register/SocialLogin";
import { validateEmail, validatePassword } from "@/utils/validate-register";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit");
    console.log(email, password);

    const emailErr = await validateEmail(email);
    const passwordErr = await validatePassword(password);

    console.log(emailErr, passwordErr);

    setEmailError(emailErr.message);
    setPasswordError(passwordErr.message);
    setLoginError("");

    if (emailErr || passwordErr) return;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setLoginError("Login failed. Please check your credentials.");
      } else if (result?.ok) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        // Redirect to home page after successful login
        router.push('/');
      }
    } catch {
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

  // Redirect authenticated users to homepage
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/');
    }
  }, [status, session, router]);


  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* ตำแหน่งล่างซ้าย */}
      <Image
        src="/icons/register02.svg"
        width={255}
        height={371}
        alt="register"
        className="absolute bottom-0 left-0"
        priority
      />

      {/* ตำแหน่งบนขวา */}
      <Image
        src="/icons/register01.svg"
        width={239}
        height={350}
        alt="register"
        className="absolute top-0 right-0"
        loading="lazy"

      />

      <div className="w-full p-4 max-w-[440px] flex flex-col relative">
        {/* login header */}
        <div className="text-center font-[700]">
          <h1 className="text-black text-[56px]">
            Welcome back!
          </h1>
          <h3 className="text-gray-6 text-[24px]">
            Find your perfect pet sitter with us
          </h3>
        </div>

        {/* login form */}
        <form onSubmit={handleSubmit} className="space-y-8 pt-10">
          {/* email input */}
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-error text-sm">{loginError}</p>
            </div>
          )}

          <div>
            <InputText
              label="Email"
              id="email"
              name="email"
              type="text"
              placeholder="email@company.com"
              variant={emailError ? "error" : "default"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              errorText={emailError}
            />
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
              errorText={passwordError}
            />
          </div>

          {/* remember me and forget password */}
          <div className="flex items-center justify-between py-6">
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
                <Link href="/auth/reset-password">Forget Password</Link>
              </span>
            </div>
          </div>

          {/* login button */}
          <PrimaryButton
            text="Login"
            bgColor="primary"
            textColor="white"
            className="w-full justify-center"
            type="submit"
          />
        </form>



        <SocialLogin />

        {/* register prompt */}
        <p className="mt-6 text-center text-[18px] text-ink font-[500]">
          Don&apos;t have any account?{" "}
          <Link
            href="/auth/register"
            className="text-orange-5 hover:underline text-[16px] font-[700]"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
