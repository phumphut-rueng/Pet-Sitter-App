import { FieldValidation } from "./field-validation";

export interface RegisterForm {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface ResetPasswordForm {
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export interface RegisterValidation {
    name: FieldValidation
    email: FieldValidation
    phone: FieldValidation
    password: FieldValidation
}

export interface UserRole {
    role_id: number;
    role_name?: string; // จะใส่ก็ได้ถ้าใน object มี role_name ด้วย
}

