import { useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { backendInterface } from "../backend.d.ts";

export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return {
    actor: actor as backendInterface | null,
    isLoading: isFetching,
  };
}
