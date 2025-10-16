import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import PrimaryButton from "@/components/buttons/PrimaryButton";
import InputText from "@/components/input/InputText"
import BookingConfirmation from "@/components/modal/BookingConfirmation";
import { useRegister } from "@/hooks/register/useRegister"

export default function RegisterPage() {
  const {
    form,
    error,
    role,
    isLoading,
    isOpen,
    setIsOpen,
    handleChange,
    handlePhoneChange,
    handleSubmit,
    handleChangeRole,
    handleOnConfirm,
  } = useRegister()

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* ตำแหน่งล่างซ้าย */}
      <Image
        src="/icons/register02.svg"
        width={255}
        height={371}
        alt="register"
        className="absolute bottom-0 left-0"
        loading="lazy"
        style={{ width: 'auto', height: 'auto' }}
      />

      {/* ตำแหน่งบนขวา */}
      <Image
        src="/icons/register01.svg"
        width={239}
        height={350}
        alt="register"
        className="absolute top-0 right-0"
        priority
        style={{ width: 'auto', height: 'auto' }}
      />

      <div className="w-full p-4 max-w-[440px] flex flex-col relative">
        <div className="text-center font-[700]">
          <h1 className="text-black text-[56px]">
            Join Us!
          </h1>
          <p className="text-gray-6 text-[24px]">
            Find your perfect pet sitter with us
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 pt-7">
          {["Owner", "Sitter"].map((label, i) => {
            const roleId = i + 2
            return (
              <button
                key={roleId}
                className={`px-4 py-2 font-medium ${role === roleId ? "border-b-2 border-orange-5 text-orange-5" : "text-gray-5 cursor-pointer"
                  }`}
                onClick={() => handleChangeRole(roleId)}
              >
                {label}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <InputText
              label="Email"
              id="email"
              name="email"
              value={form.email}
              placeholder="email@company.com"
              type="text"
              variant={!error.email ? "default" : "error"}
              onChange={handleChange}
              errorText={error.email}
            />
          </div>

          <div>
            <InputText
              label="Phone"
              id="phone"
              name="phone"
              value={form.phone}
              placeholder="Your phone number"
              type="text"
              variant={!error.phone ? "default" : "error"}
              inputMode="numeric"
              onChange={handlePhoneChange}
              errorText={error.phone}
            />
          </div>

          <div>
            <InputText
              label="Password"
              id="password"
              name="password"
              value={form.password}
              placeholder="Create your password"
              type="password"
              variant={!error.password ? "default" : "error"}
              onChange={handleChange}
              errorText={error.password}
            />
          </div>

          <PrimaryButton
            text={isLoading ? "Registering..." : "Register"}
            bgColor="primary"
            textColor="white"
            type="submit"
            disabled={isLoading}
            className="w-full"
          />
        </form>

        {/* <SocialLogin
          callbackUrl={`/admin?role=${role}`} /> */}

        <p className="mt-6 text-center text-[18px] text-ink font-[500]">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-orange-5 hover:underline    text-[16px] font-[700]"
          >
            Login
          </Link>
        </p>
      </div>

      <BookingConfirmation
        title="Register as a Sitter"
        description={`This email is already registered.\nDo you want to sign up as a sitter too?`}
        open={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={handleOnConfirm}
      />
    </div>
  )
}
