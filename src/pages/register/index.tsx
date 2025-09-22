import * as React from "react"
import Link from "next/link"
import PrimaryButton from "@/components/buttons/primaryButton"
import InputText from "@/components/input/InputText"
import Image from "next/image"

interface RegisterForm {
  email: string
  phone: string
  password: string
}

export default function RegisterPage() {
  const [form, setForm] = React.useState<RegisterForm>({
    email: "",
    phone: "",
    password: "",
  })
  const [error, setError] = React.useState<RegisterForm>({
    email: "",
    phone: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let err: RegisterForm = {
      email: "",
      phone: "",
      password: "",
    };

    if (!form.email.trim()) {
      err.email = "Please input your Email";
    }

    if (!form.phone.trim()) {
      err.phone = "Please input your Phone";
    } else if (form.phone.trim().length !== 10) {
      err.phone = "Phone number must be 10 digits";
    }

    if (!form.password.trim()) {
      err.password = "Please input your Password";
    }

    if (Object.values(err).every((val) => val === "")) {
      // ✅ ไม่มี error → เรียก API ได้
      console.log("Submit to backend", form)
    }
    else {
      setError(err);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white">
      {/* ตำแหน่งล่างซ้าย */}
      <Image
        src="/icons/register02.svg"
        width={255}
        height={371}
        alt="register"
        className="absolute bottom-0 left-0 "
      />

      {/* ตำแหน่งบนขวา */}
      <Image
        src="/icons/register01.svg"
        width={239}
        height={350}
        alt="register"
        className="absolute top-0 right-0"
      />

      <div className="flex min-h-screen items-center justify-center bg-white text-[18px]">
        <div className="relative w-[440] max-w-md rounded-lg">
          <div className="text-center font-[700]">
            <h1 className="text-black text-[56px] pb-5">
              Join Us!
            </h1>
            <p className="text-gray-6 text-[24px]">
              Find your perfect pet sitter with us
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 pt-15 ">
            <InputText
              label="Email"
              placeholder="email@company.com"
              type="email"
              variant={!error.email ? "default" : "error"}

            />

            <InputText
              label="Phone"
              placeholder="Your phone number"
              type="text"
              variant={!error.phone ? "default" : "error"}
              inputMode="numeric"
              name="phone"
              value={form.phone}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, "");
                if (onlyNums.length <= 10) {
                  handleChange({
                    ...e,
                    target: { ...e.target, name: "phone", value: onlyNums },
                  });
                }
              }}
            />

            <InputText
              label="Password"
              placeholder="Create your password"
              type="password"
              variant={!error.password ? "default" : "error"}
            />

            <PrimaryButton
              text="Register"
              bgColor="primary"
              textColor="white"
              type="submit"
              className="w-full justify-center"
            />
          </form>

          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-gray-2" />
            <span className="mx-2 text-gray-6">
              Or Continue With
            </span>
            <div className="h-px flex-1 bg-gray-2" />
          </div>

          <div className="flex justify-center gap-4">
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
              className="w-[210px] justify-center"
            />
          </div>

          <p className="mt-6 text-center text-[16px] text-ink">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-5 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
