import * as React from "react"
import axios from "axios"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router";
import { useState } from "react";
import PrimaryButton from "@/components/buttons/primaryButton"
import InputText from "@/components/input/InputText"
import { validateEmail, validatePhone, validatePassword } from "@/utils/validate-register"
import { RegisterForm } from "@/types/register.type"
import RegisterConfirmation from "@/components/modal/RegisterConfirmation";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);

    const checkMail = await validateEmail(form.email, role)
    const checkPhone = await validatePhone(form.phone)
    const checkPassword = await validatePassword(form.password)

    console.log("checkMail", checkMail);

    const newErrors: RegisterForm = {
      name: "",
      email: checkMail.message,
      phone: checkPhone.message,
      password: checkPassword.message,
    }
    console.log("email", form.email.trim(), !form.email.trim(), role === 3);

    if (form.email.trim() && role === 3) {
      console.log("if (form.email.trim() && role === 3)");
      console.log("data", checkMail.data);
      if (!checkMail.data) {
        console.log(" if (!checkMail.data)");
        // ถ้ายังไม่มี user
        saveOwnerData(newErrors, [2, 3]);
      } else if (checkMail.error !== "Conflict") {
        console.log("!== Conflict");
        // ถ้ายังมี user แล้ว และยังไม่เป็น sitter
        setIsOpen(true);
      } else {
        console.log("else (Object.values(newErrors)");
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
    console.log("else");
    if (Object.values(newErrors).every((val) => val === "")) {
      console.log("if (Object.values(newErrors)");
      //owner
      saveData(role_ids);
    } else {
      console.log("else newErrors");
      setError(newErrors);
    }
  }

  const handleOnConfirm = async () => {
    await addRole();
    setIsOpen(false);
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
    } catch (e) {
      console.error("axios.register", e);
    }

    if (result?.status === 201) {
      clearData();
    }
  }

  const addRole = async () => {
    console.log("addRole", form);

    let result;
    try {
      result = await axios.post(
        "/api/user/post-role",
        {
          ...form,
          role_ids: 3
        }
      );
    } catch (e) {
      console.error("axios.post-role", e);
    }

    if (result?.status === 201) {
      clearData();
    }
  }

  const clearData = () => {
    setError({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
    setForm({
      name: "",
      email: "",
      phone: "",
      password: ""
    });
    router.push("/auth/login");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white">
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

      <div className="flex min-h-screen items-center justify-center bg-white text-[18px]">
        <div className="relative w-[440px] max-w-md rounded-lg">
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
            <button
              className={`px-4 py-2 font-medium ${role === 2
                ? "border-b-2 border-orange-5 text-orange-5"
                : "text-gray-5 cursor-pointer"
                }`}
              onClick={() => handleChangeRole(2)}
            >
              Owner
            </button>
            <button
              className={`px-4 py-2 font-medium ${role === 3
                ? "border-b-2 border-orange-5 text-orange-5"
                : "text-gray-5 cursor-pointer"
                }`}
              onClick={() => handleChangeRole(3)}
            >
              Sitter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 pt-7 ">
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
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, "");
                  if (onlyNums.length <= 10) {
                    handleChange({
                      ...e,
                      target: { ...e.target, name: "phone", value: onlyNums },
                    });
                  }
                }}
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

          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-gray-2" />
            <span className="mx-2 text-gray-6">
              Or Continue With
            </span>
            <div className="h-px flex-1 bg-gray-2" />
          </div>

          <div className="flex gap-4">
            <PrimaryButton
              text="Facebook"
              srcImage="/icons/fbIcon.svg"
              bgColor="gray"
              textColor="black"
              className="w-[210px]"
            />
            <PrimaryButton
              text="Gmail"
              srcImage="/icons/gmaiIicon.svg"
              bgColor="gray"
              textColor="black"
              className="w-[210px] "
            />
          </div>

          <p className="mt-6 text-center text-[16px] text-ink">
            Already have an account?{" "}
            <Link
              href="auth/login"
              className="text-orange-5 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      <RegisterConfirmation
        open={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={handleOnConfirm}
      />
    </div>
  )
}
