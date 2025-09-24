export interface RegisterForm {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export type errorType = "" | "Conflict";

export interface FieldValidation {
    error?: errorType
    message: string
    data?: object;
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

