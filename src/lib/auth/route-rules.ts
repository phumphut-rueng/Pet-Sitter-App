import { ROLES, Role } from "./roles";

export type Rule = { pattern: RegExp; anyOf?: Role[]; allOf?: Role[] };

export const routeRules: Rule[] = [
  // Admin area
  { pattern: /^\/admin(?:\/|$)/,          anyOf: [ROLES.ADMIN] },
  { pattern: /^\/admin-management(?:\/|$)/, anyOf: [ROLES.ADMIN] },

  // Sitter area (canonical path)
  { pattern: /^\/sitter(?:\/|$)/,         anyOf: [ROLES.SITTER] },

  // Owner account area
  { pattern: /^\/account(?:\/|$)/,        anyOf: [ROLES.OWNER, ROLES.ADMIN] },
];