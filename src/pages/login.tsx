import Image from "next/image";
import { Input } from "@/components/ui/input";

export default function Login() {
  return (
    <>
      <div className="flex items-center justify-center h-screen overflow-hidden relative">
        {/* main container */}
        <div className="w-full p-4 max-w-[440px] gap-14 flex flex-col">
          {/* Welcome header */}
          <div className="text-center gap-2">
            <h1 className="font-bold font-weight-700 text-[56px] text-center text-black">
              Welcome back!
            </h1>
            <h3 className="font-bold text-[24px] text-center text-gray-400">
              Find your perfect pet sitter with us
            </h3>
          </div>

          {/* login form */}
          <div className="gap-8 flex flex-col">
            {/* email field */}
            <div className="gap-1 flex flex-col">
              <label
                htmlFor="email"
                className="text-[16px] font-weight-500 font-medium text-black"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@company.com"
                autoComplete="email"
                variant="success"
              />
            </div>

            {/* password field */}
            <div className="gap-1 flex flex-col">
              <label
                htmlFor="password"
                className="text-[16px] font-weight-500 font-medium text-black"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                variant="success"
              />
              
            </div>

            {/* remember and forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-6 w-6 border border-gray-200 rounded-[6px] "
                />
                <label
                  htmlFor="remember-me"
                  className="text-[16px] font-weight-500 font-medium text-gray-600"
                >
                  Remember?
                </label>
              </div>

              <div className="text-center">
                <span className="text-[16px] font-weight-700 font-bold text-orange-500 cursor-pointer">
                  Forget Password
                </span>
              </div>
            </div>

            {/* signin button */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[16px] font-bold py-3 px-4 rounded-[99px] text-sm transition-colors duration-200 cursor-pointer"
            >
              Login
            </button>

            {/* register prompt */}
            <div className="text-center">
              <p className="text-[18px] font-weight-500 font-medium text-[#060D18]">
                Don't have any account?
                <span className=" text-orange-500 hover:text-orange-600 cursor-pointer ml-2">
                  Register
                </span>
              </p>
            </div>
          </div>
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
              src="/icons/Vector.svg"
              alt="Decorative element"
              width={250}
              height={250}
              className="rotate-280"
            />
          </div>
        </div>
      </div>
    </>
  );
}
