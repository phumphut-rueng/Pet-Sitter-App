import axios from "axios";
import { FieldValidation, UserRole, errorType } from "@/types/register.type";

const result = (
    message = "",
    error?: errorType,
    data?: object
): FieldValidation => ({
    message,
    ...(error && { error }),
    ...(data && { data }),
});

async function safePost<T>(url: string, body: unknown): Promise<T | null> {
    try {
        const { data } = await axios.post<T>(url, body);
        return data;
    } catch (e) {
        console.error(`${url} request failed:`, e);
        return null;
    }
}

// Email Validator
export async function validateEmail(
    value: string,
    role_ids?: number,
    checkConflict = false,
): Promise<FieldValidation> {
    if (!value.trim())
        return result("Please input your Email");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value))
        return result("Invalid email format");

    if (checkConflict) {
        try {
            const data = await safePost<{
                exists: boolean;
                data: { user_role: UserRole[] }
            }>(
                "/api/user/get-email",
                { email: value }
            );

            if (data?.exists && role_ids) {
                const hasRole = data.data.user_role.some((ur: UserRole) => ur.role_id === role_ids)
                const msg = "This email is already registered";
                return hasRole
                    ? result(msg, "Conflict", data)
                    : result(msg, undefined, data);
            }
        } catch (e) {
            console.error("Email check failed:", e);
        }
    }

    return { message: "" };
}

// Phone Validator
export async function validatePhone(
    value: string
): Promise<FieldValidation> {
    if (!value.trim())
        return result("Please input your Phone");

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(value))
        return result("Phone must start with 0 and be 10 digits");

    try {
        const data = await safePost<{
            exists: boolean
        }>(`/api/user/check-phone`,
            { phone: value });
        if (data?.exists)
            return result("This phone number is already registered");
    } catch (e) {
        console.error("Phone check failed:", e);
    }

    return { message: "" };
}

// Password Validator
export async function validatePassword(
    value: string
): Promise<FieldValidation> {
    if (!value.trim())
        return result("Please input your Password");

    if (value.length < 8)
        return result("Password must be more than 8 characters");

    return result();
}
