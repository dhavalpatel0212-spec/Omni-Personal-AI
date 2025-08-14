import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { getPasswordInfo } from '../endpoints/auth/password_info_GET.schema';
import { postChangePassword } from '../endpoints/auth/change_password_POST.schema';

// Password complexity validation function to match the endpoint
const passwordComplexityRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters long")
  .max(128, "Password must not exceed 128 characters")
  .refine((password) => passwordComplexityRegex.test(password), {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)",
  });

// Schema for password change - updated to match endpoint requirements
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: passwordSchema,
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// Type for password info from the endpoint
type PasswordInfo = {
  lastPasswordChange: Date;
  canChangePassword: boolean;
  nextChangeDate: Date;
};

// Fetch password information from the real endpoint
const fetchPasswordInfo = async (): Promise<PasswordInfo> => {
  const passwordInfo = await getPasswordInfo();
  
  return {
    lastPasswordChange: passwordInfo.lastPasswordChange,
    canChangePassword: passwordInfo.canChangePassword,
    nextChangeDate: passwordInfo.nextChangeDate
  };
};

// Change password function using the real endpoint
const changePassword = async (data: PasswordChangeFormData) => {
  try {
    const result = await postChangePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword,
    });
    
    console.log('Password changed successfully:', result.message);
    
    return {
      success: result.success,
      message: result.message,
      lastPasswordChange: result.newPasswordChangeDate
    };
  } catch (error) {
    console.error('Password change failed:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to change password. Please try again.');
  }
};

export const usePasswordSecurity = () => {
  const queryClient = useQueryClient();

  const passwordInfoQuery = useQuery({
    queryKey: ['password-info'],
    queryFn: fetchPasswordInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['password-info'] });
    },
    onError: (error) => {
      console.error('Password change mutation failed:', error);
    },
  });

  // Helper function to check if 90 days have passed
  const canChangePassword = (lastChangeDate: Date): boolean => {
    const now = new Date();
    const daysSinceLastChange = Math.floor((now.getTime() - lastChangeDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastChange >= 90;
  };

  // Helper function to get next available change date
  const getNextAvailableChangeDate = (lastChangeDate: Date): Date => {
    const nextChange = new Date(lastChangeDate);
    nextChange.setDate(nextChange.getDate() + 90);
    return nextChange;
  };

  // Helper function to get days remaining until next change
  const getDaysUntilNextChange = (lastChangeDate: Date): number => {
    const nextChange = getNextAvailableChangeDate(lastChangeDate);
    const now = new Date();
    const daysRemaining = Math.ceil((nextChange.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  };

  return {
    passwordInfoQuery,
    changePasswordMutation,
    canChangePassword,
    getNextAvailableChangeDate,
    getDaysUntilNextChange,
  };
};