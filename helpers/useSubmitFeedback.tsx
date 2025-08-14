import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postSubmitFeedback, OutputType } from '../endpoints/feedback/submit_POST.schema';

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<OutputType, Error, FormData>({
    mutationFn: (formData: FormData) => postSubmitFeedback(formData),
    onSuccess: () => {
      // Invalidate any queries that might display feedback tickets, if they exist.
      // For example: queryClient.invalidateQueries({ queryKey: ['feedback', 'list'] });
    },
  });
};