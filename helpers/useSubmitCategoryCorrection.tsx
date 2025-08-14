import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { postShoppingCategoryCorrection, InputType } from "../endpoints/shopping/category_correction_POST.schema";

export const useSubmitCategoryCorrection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InputType) => postShoppingCategoryCorrection(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        // Optionally, invalidate queries that might be affected by category changes
        // For example, if there's a query for item suggestions:
        // queryClient.invalidateQueries({ queryKey: ['shopping', 'suggestions'] });
      } else {
        // This case should ideally be handled by onError, but as a fallback:
        toast.error(data.error || "Failed to submit correction.");
      }
    },
    onError: (error: Error) => {
      console.error("Error submitting category correction:", error);
      toast.error(error.message || "An unexpected error occurred.");
    },
  });
};