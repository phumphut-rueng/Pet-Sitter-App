import { useSession } from "next-auth/react";
export function useHasAnyRole(roles: string[]) {
  const { data } = useSession();
  const userRoles = data?.user?.roles ?? [];
  return roles.length === 0 ? true : roles.some(r => userRoles.includes(r));
}