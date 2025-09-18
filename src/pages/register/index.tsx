import * as React from "react"
import Link from "next/link"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Register data:", form)
    // TODO: ส่งข้อมูลไป backend
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow">
          {/* Decoration */}
          <div className="absolute top-10 right-10 text-6xl text-yellow-300">🐾</div>
          <div className="absolute bottom-10 left-10 text-6xl text-green-400">⭐</div>

          <h1 className="h1 text-center">
            Join Us!
          </h1>
          <p className="mb-6 h3">
            Find your perfect pet sitter with us
          </p>

          {/* <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Your phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Create your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Register
          </Button>
        </form> */}

          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="mx-2 text-gray-400">Or Continue With</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          {/* <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="flex-1 border border-gray-300 bg-gray-100"
          >
            Facebook
          </Button>
          <Button
            variant="outline"
            className="flex-1 border border-gray-300 bg-gray-100"
          >
            Gmail
          </Button>
        </div> */}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
