import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postChangePassword,
  InputType,
} from "../endpoints/auth/change_password_POST.schema";
import { PASSWORD_INFO_QUERY_KEY } from "./usePasswordInfo";

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InputType) => postChangePassword(data),
    onSuccess: () => {
      // After a successful password change, invalidate the password info query
      // to refetch the latest password change date and cooldown status.
      queryClient.invalidateQueries({ queryKey: PASSWORD_INFO_QUERY_KEY });
    },
  });
};