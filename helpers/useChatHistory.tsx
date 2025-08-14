import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAiHistory } from "../endpoints/ai/history_GET.schema";
import { postAiMessage as postMessage, InputType as PostMessageInputType } from "../endpoints/ai/message_POST.schema";

export const CHAT_HISTORY_QUERY_KEY = (conversationId?: number) => ["chat", "history", conversationId ?? "latest"];

/**
 * Hook to fetch and manage paginated chat history for a specific conversation.
 * If no conversationId is provided, it fetches the latest conversation.
 */
export const useChatHistory = (conversationId?: number) => {
  return useInfiniteQuery({
    queryKey: CHAT_HISTORY_QUERY_KEY(conversationId),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) => 
      getAiHistory({ cursor: pageParam, conversationId, limit: 20 }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as number | undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent unnecessary refetches
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
};

/**
 * Hook to save a new user/assistant message pair.
 * It handles invalidating the relevant chat history query to trigger a refetch.
 */
export const useSaveChatMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PostMessageInputType) => postMessage(data),
        onSuccess: (data, variables) => {
            // Use optimistic update instead of invalidation to prevent duplicate fetches
            const queryKey = CHAT_HISTORY_QUERY_KEY(data.conversationId);
            
            queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData?.pages) return oldData;
                
                const userMessage = {
                    id: data.userMessageId,
                    role: 'user' as const,
                    content: variables.userMessage,
                    createdAt: new Date(),
                };
                
                const assistantMessage = {
                    id: data.assistantMessageId,
                    role: 'assistant' as const,
                    content: variables.assistantMessage,
                    createdAt: new Date(),
                };
                
                const updatedPages = [...oldData.pages];
                if (updatedPages[0]?.messages) {
                    // Replace any temporary messages and add the saved ones
                    const existingMessages = updatedPages[0].messages.filter((msg: any) => 
                        !msg.id.toString().startsWith('temp-')
                    );
                    
                    updatedPages[0] = {
                        ...updatedPages[0],
                        conversationId: data.conversationId,
                        messages: [...existingMessages, userMessage, assistantMessage]
                    };
                }
                
                return {
                    ...oldData,
                    pages: updatedPages
                };
            });
            
            // Also update the "latest" query if this was a new conversation
            if (!variables.conversationId) {
                queryClient.setQueryData(CHAT_HISTORY_QUERY_KEY(), (oldData: any) => {
                    return queryClient.getQueryData(queryKey);
                });
            }
        },
    });
};