import PrimaryButton from "@/components/buttons/PrimaryButton"
import InputText from "@/components/input/InputText"
import { useForgotPassword } from "@/hooks/useForgotPassword"

export default function ForgotPasswordPage() {
    const {
        form,
        error,
        errorToken,
        isLoading,
        handleChange,
        handleSubmit,
    } = useForgotPassword()

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="max-w-md w-full space-y-6 p-8 shadow-lg rounded-2xl">
                <h2 className="text-2xl font-bold text-center">
                    Forgot Password?
                </h2>
                <p className="text-center text-gray-500">
                    Enter your email to reset your password
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <PrimaryButton
                        type="submit"
                        disabled={isLoading}
                        bgColor="primary"
                        textColor="white"
                        className="w-full"
                        text={isLoading ? "Sending..." : "Send Reset Link"}
                    />
                </form>

                {errorToken && (
                    <p className="text-center text-sm text-gray-9 mt-3">{errorToken}</p>
                )}
            </div>
        </div>
    )
}
