import axios from "axios";

export interface RegisterForm {
    name: string;
    email: string;
    phone: string;
    password: string;
}

// 🔎 Email Validator
export async function validateEmail(value: string): Promise<string> {
    if (!value.trim())
        return "Please input your Email";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value))
        return "Invalid email format";

    try {
        const { data } = await axios.post(
            "/api/user/check-email",
            { email: value },
        );
        if (data.exists)
            return "This email is already registered";
    } catch (e) {
        console.error("Email check failed:", e);
    }

    return "";
}

// 🔎 Phone Validator
export async function validatePhone(value: string): Promise<string> {
    if (!value.trim())
        return "Please input your Phone";

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(value))
        return "Phone must start with 0 and be 10 digits";

    try {
        const { data } = await axios.post(
            `/api/user/check-phone`,
            { phone: value },
        );
        if (data.exists)
            return "This phone number is already registered";
    } catch (e) {
        console.error("Phone check failed:", e);
    }

    return "";
}

// 🔎 Password Validator
export async function validatePassword(value: string): Promise<string> {
    if (!value.trim())
        return "Please input your Password";
    if (value.length < 8)
        return "Password must be more than 8 characters";
    return "";
}

// ✅ ฟังก์ชันรวม
export async function validateRegister(form: RegisterForm): Promise<RegisterForm> {
    return {
        name: "",
        email: await validateEmail(form.email),
        phone: await validatePhone(form.phone),
        password: await validatePassword(form.password),
    };
}
