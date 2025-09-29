// hooks/useLoginForm.ts
import { useState, useEffect } from "react";
import { validateEmail, validatePassword } from "@/utils/validate-register";

export function useLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginError, setLoginError] = useState("");

    // auto-fill email if remembered
    useEffect(() => {
        const rememberedEmail = localStorage.getItem("rememberedEmail");
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    const validate = async () => {
        const emailErr = await validateEmail(email);
        const passwordErr = await validatePassword(password);

        setEmailError(emailErr.message);
        setPasswordError(passwordErr.message);
        setLoginError("");

        return {
            emailValid: !emailErr.message,
            passwordValid: !passwordErr.message,
        };
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        rememberMe,
        setRememberMe,
        emailError,
        passwordError,
        loginError,
        setLoginError,
        validate,
    };
}
