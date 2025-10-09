import { numRegex } from "@/lib/validators/validation";

export const formatIdNumber = (value: string): string =>
    value.replace(numRegex, "").slice(0, 13);