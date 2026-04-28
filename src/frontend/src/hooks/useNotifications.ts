import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useBackend } from "./useBackend";

export function useNotifications() {
  const { actor, isLoading } = useBackend();
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isLoading && isAuthenticated,
    refetchInterval: 30_000,
  });

  const unreadCount = (query.data ?? []).filter((n) => !n.isRead).length;

  return {
    notifications: query.data ?? [],
    unreadCount,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
