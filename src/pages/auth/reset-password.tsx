import PrimaryButton from "@/components/buttons/PrimaryButton";
import InputText from "@/components/input/InputText";
import { useResetPassword } from "@/hooks/useResetPassword";

export default function ResetPasswordPage() {
  const {
    form,
    error,
    errorToken,
    success,
    isLoading,
    handleChange,
    handleSubmit,
  } = useResetPassword()

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-2xl font-semibold text-success mb-2">
          Password Reset Successful!
        </h1>
        <p>You will be redirected to login page shortly.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold text-center mb-4">Reset Password</h1>

        {errorToken && (
          <p className="bg-red-100 text-error px-3 py-2 rounded-md mb-4 text-sm">
            {errorToken}
          </p>
        )}

        <div className="mb-4">
          <InputText
            label="New Password"
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

        <div className="mb-6">
          <InputText
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            placeholder="Create your password"
            type="password"
            variant={!error.confirmPassword ? "default" : "error"}
            onChange={handleChange}
            errorText={error.confirmPassword}
          />
        </div>

        <PrimaryButton
          type="submit"
          disabled={isLoading}
          bgColor="primary"
          textColor="white"
          className="w-full"
          text={isLoading ? "Resetting..." : "Reset Password"}
        />

      </form>
    </div>
  )
}
