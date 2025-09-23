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

// 🔎 Email Validator
export async function validateEmail(
    value: string,
    role_ids: number,
): Promise<FieldValidation> {
    if (!value.trim())
        return { message: "Please input your Email" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value))
        return { message: "Invalid email format" };

    try {
        const { data } = await axios.post(
            "/api/user/get-email",
            { email: value },
        );
        console.log("validateEmail", data);

        if (data.exists) {
            if (data.data.user_role.some((ur: UserRole) => ur.role_id === role_ids)) {
                console.log("includes", data.data.user_role, role_ids,);
                return {
                    error: "Conflict",
                    message: "This email is already registered",
                    data: data
                };
            } else {
                return {
                    message: "This email is already registered",
                    data: data
                };
            }
        }
    } catch (e) {
        console.error("Email check failed:", e);
    }

    return { message: "" };
}

// 🔎 Phone Validator
export async function validatePhone(
    value: string
): Promise<FieldValidation> {
    if (!value.trim())
        return { message: "Please input your Phone" };

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(value))
        return { message: "Phone must start with 0 and be 10 digits" };

    try {
        const { data } = await axios.post(
            `/api/user/check-phone`,
            { phone: value },
        );
        if (data.exists)
            return { message: "This phone number is already registered" };
    } catch (e) {
        console.error("Phone check failed:", e);
    }

    return { message: "" };
}

// 🔎 Password Validator
export async function validatePassword(
    value: string
): Promise<FieldValidation> {
    if (!value.trim())
        return { message: "Please input your Password" };
    if (value.length < 8)
        return { message: "Password must be more than 8 characters" };
    return { message: "" };
}
