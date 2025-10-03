export const formatIdNumber = (value: string): string =>
    value.replace(/\D/g, "").slice(0, 13);