import * as React from "react"
import Link from "next/link"
import PrimaryButton from "@/components/buttons/primaryButton"
import InputText from "@/components/input/InputText"
import Image from "next/image"
import { validateRegister } from "@/utils/validate-register"
import axios from "axios"

interface RegisterForm {
  name: string
  email: string
  phone: string
  password: string
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false)

  const [form, setForm] = React.useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [error, setError] = React.useState<RegisterForm>({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);

    let newErrors: RegisterForm = {
      name: "",
      email: "",
      phone: "",
      password: "",
    };

    newErrors = await validateRegister(form);

    // console.log("validateRegister", newErrors);
    if (Object.values(newErrors).every((val) => val === "")) {
      let result;

      try {
        result = await axios.post(
          "/api/user/post-owner",
          form
        );
      } catch (e) {
        console.error("axios.post", e);
      }

      if (result?.status === 201) {
        clearData();
      }
    }
    else {
      setError(newErrors);
    }
    setIsLoading(false)
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
      password: "",
    });
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

          <form onSubmit={handleSubmit} className="space-y-7 pt-15 ">
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
    </div>
  )
}
