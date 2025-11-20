import { useMutation } from "@tanstack/react-query";
import { optimizeFC } from "../api";

export const useOptimize = () => {
  return useMutation({
    mutationFn: async (formData) => {
      return await optimizeFC(formData);
    },
  });
};
