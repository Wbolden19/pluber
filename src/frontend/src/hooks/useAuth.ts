import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const { identity, loginStatus, login, clear } = useInternetIdentity();

  const isAuthenticated = loginStatus === "success" && identity !== null;
  const isLoading =
    loginStatus === "initializing" || loginStatus === "logging-in";

  const principal = identity?.getPrincipal();
  const principalText = principal?.toText() ?? null;

  return {
    isAuthenticated,
    isLoading,
    identity,
    principal,
    principalText,
    login,
    logout: clear,
    loginStatus,
  };
}
