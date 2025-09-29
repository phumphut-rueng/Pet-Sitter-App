import * as React from "react"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router";
import { useState } from "react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import InputText from "@/components/input/InputText"
import { validateEmail, validatePhone, validatePassword } from "@/utils/validate-register"
import { RegisterForm } from "@/types/register.type"
import BookingConfirmation from "@/components/modal/BookingConfirmation";
import SocialLogin from "@/components/login-register/SocialLogin";

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(false)
  const [role, setRole] = useState<number>(2); //2="owner" | 3="sitter"
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [form, setForm] = React.useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    password: ""
  })
  const [error, setError] = React.useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    password: ""
  })

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setForm((prev) => ({ ...prev, [name]: value }))
    },
    []
  )

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, "")
    if (onlyNums.length <= 10) {
      handleChange({
        ...e,
        target: { ...e.target, name: "phone", value: onlyNums },
      })
    }
  }
  const clearData = React.useCallback(() => {
    setError({ name: "", email: "", phone: "", password: "" })
    setForm({ name: "", email: "", phone: "", password: "" })
    router.push("/auth/login")
  }, [router])

  const saveData = async (role_ids: number[]) => {
    let result;
    try {
      result = await axios.post(
        "/api/auth/register",
        {
          ...form,
          role_ids
        }
      );

      if (result?.status === 201) {
        clearData();
      }
    } catch (e) {
      console.error("axios.register", e);
    }
  }

  const addRole = async () => {
    let result;
    try {
      result = await axios.post(
        "/api/user/post-role",
        {
          ...form,
          role_ids: 3
        }
      );
      if (result?.status === 201) {
        clearData();
      }
    } catch (e) {
      console.error("axios.post-role", e);
    }

  }

  const handleOnConfirm = async () => {
    await addRole();
    setIsOpen(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);

    const checkMail = await validateEmail(form.email, role)
    const checkPhone = await validatePhone(form.phone)
    const checkPassword = await validatePassword(form.password)

    const newErrors: RegisterForm = {
      name: "",
      email: checkMail.message || "",
      phone: checkPhone.message || "",
      password: checkPassword.message || "",
    }

    if (form.email.trim() && role === 3) {
      if (!checkMail.data) {
        // user ที่ยังไม่เคย register owner
        saveOwnerData(newErrors, [2, 3]);
      } else if (checkMail.error !== "Conflict") {
        // user ที่ register owner แล้ว และยังไม่เป็น sitter
        setIsOpen(true);
      } else {
        setError(newErrors);
      }
    } else {
      saveOwnerData(newErrors, [2])
    }

    setIsLoading(false)
  }

  const saveOwnerData = (
    newErrors: RegisterForm,
    role_ids: number[]
  ) => {
    if (Object.values(newErrors).every((val) => val === "")) {
      saveData(role_ids);
    } else {
      setError(newErrors);
    }
  }

  const handleChangeRole = (roleId: number) => {
    setRole(roleId)
    setError({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
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
        loading="lazy"
      />

      {/* ตำแหน่งบนขวา */}
      <Image
        src="/icons/register01.svg"
        width={239}
        height={350}
        alt="register"
        className="absolute top-0 right-0"
        priority
      />

      <div className="w-full p-4 max-w-[440px] flex flex-col relative">
        <div className="text-center font-[700]">
          <h1 className="text-black text-[56px] pb-5">
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

        <SocialLogin />

        <p className="mt-6 text-center text-[18px] text-ink font-[500]">
          Already have an account?{" "}
          <Link
            href="auth/login"
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
