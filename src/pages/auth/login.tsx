import Image from "next/image";
import InputText from "@/components/input/InputText";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import SocialLogin from "@/components/login-register/SocialLogin";
import { useLogin } from "@/hooks/login/useLogin";
import { PetPawLoading } from "@/components/loading/PetPawLoading";

export default function Login() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    emailError,
    passwordError,
    loginError,
    loading,
    handleSubmit,
  } = useLogin();

  // Show loading while checking authentication
  if (loading) {
    return (
      <PetPawLoading
        message="Loading Pet Sitter Login"
        size="lg"
      />
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
        style={{ width: 'auto', height: 'auto' }}
      />

      {/* ตำแหน่งบนขวา */}
      <Image
        src="/icons/register01.svg"
        width={239}
        height={350}
        alt="register"
        className="absolute top-0 right-0"
        loading="lazy"
        style={{ width: 'auto', height: 'auto' }}

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
                <Link href="/auth/forgot-password">Forget Password</Link>
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
