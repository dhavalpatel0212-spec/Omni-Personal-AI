import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, Loader, Mic, Target, ShoppingCart, Plane } from "lucide-react";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { ImageUpload } from "./ImageUpload";
import { ImagePreview } from "./ImagePreview";
import { MessageContent } from "./MessageContent";
import { useAuth } from "../helpers/useAuth";
import { useChatHistory, useSaveChatMessage } from "../helpers/useChatHistory";

import { shoppingQueryKeys } from "../helpers/useShopping";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./AIChatWidget.module.css";

interface AIChatWidgetProps {
  className?: string;
}

interface ImageData {
  file: File;
  dataUrl: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
  createdAt?: Date;
}

interface DraftMessage {
  id: string;
  role: 'assistant';
  content: string;
  isStreaming: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  message: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'new-goal',
    label: 'New Goal',
    icon: <Target size={16} />,
    message: 'Help me create a new goal'
  },
  {
    id: 'shopping-list',
    label: 'Shopping List',
    icon: <ShoppingCart size={16} />,
    message: 'Help me with my shopping list'
  },
  {
    id: 'travel-plans',
    label: 'Travel Plans',
    icon: <Plane size={16} />,
    message: 'Help me plan a trip'
  }
];

export const AIChatWidget = ({ className }: AIChatWidgetProps) => {
  const { authState } = useAuth();
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>();
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [input, setInput] = useState("");
  const [draftMessage, setDraftMessage] = useState<DraftMessage | null>(null);
  const queryClient = useQueryClient();
  
  const { 
    data: historyData, 
    isLoading: isLoadingHistory, 
    isFetching: isFetchingHistory 
  } = useChatHistory(currentConversationId);
  
  const saveChatMessage = useSaveChatMessage();

  const messages: Message[] = React.useMemo(() => {
    if (!historyData?.pages) return [];
    
    const historicalMessages = historyData.pages.flatMap(page => page?.messages || []);
    
    const seenIds = new Set<string>();
    const deduplicatedMessages = historicalMessages.filter(msg => {
      if (!msg?.id) return false;
      const idStr = msg.id.toString();
      if (seenIds.has(idStr)) return false;
      seenIds.add(idStr);
      return true;
    });
    
    return deduplicatedMessages.map(msg => ({
      id: msg.id.toString(),
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: msg.createdAt ?? undefined,
    }));
  }, [historyData]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, draftMessage]);

  useEffect(() => {
    if (historyData?.pages?.[0]?.conversationId && !currentConversationId) {
      setCurrentConversationId(historyData.pages[0].conversationId);
    }
  }, [historyData, currentConversationId]);

  const user = authState.type === "authenticated" ? authState.user : null;

  const convertFileToDataUrl = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleImagesSelected = useCallback(async (files: File[]) => {
    setIsProcessingImages(true);
    try {
      const imageDataPromises = files.map(async (file) => ({
        file,
        dataUrl: await convertFileToDataUrl(file),
      }));
      
      const imageData = await Promise.all(imageDataPromises);
      setUploadedImages(prev => [...prev, ...imageData]);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessingImages(false);
    }
  }, [convertFileToDataUrl]);

  const handleRemoveImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleQuickAction = useCallback((action: QuickAction) => {
    setInput(action.message);
  }, []);

  const handleMicrophoneClick = useCallback(() => {
    console.log('Voice input clicked - feature coming soon');
  }, []);

  const sendMessage = useCallback(async (messageContent: Message['content']) => {
    if (draftMessage?.isStreaming) return;

    const conversationId = currentConversationId;

    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      createdAt: new Date(),
    };

    const assistantMessageId = `temp-assistant-${Date.now()}`;
    const assistantDraft: DraftMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setDraftMessage(assistantDraft);

    try {
      const queryKey = ["chat", "history", conversationId];

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        const newMessage = {
          id: Date.now(),
          role: 'user',
          content: typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent),
          createdAt: new Date(),
        };
        
        const updatedPages = [...oldData.pages];
        if (updatedPages[0]?.messages) {
          updatedPages[0] = {
            ...updatedPages[0],
            messages: [...updatedPages[0].messages, newMessage]
          };
        }
        
        return {
          ...oldData,
          pages: updatedPages
        };
      });

      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/_api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAssistantText = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const content = JSON.parse(line.substring(2));
                if (typeof content === 'string') {
                  fullAssistantText += content;
                  
                  setDraftMessage(prev => prev ? {
                    ...prev,
                    content: fullAssistantText
                  } : null);
                }
              } catch (e) {
                console.error('Error parsing streaming chunk:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (fullAssistantText) {
        try {
          const userContent = typeof userMessage.content === 'string' 
            ? userMessage.content 
            : JSON.stringify(userMessage.content);

          const result = await saveChatMessage.mutateAsync({
            conversationId: conversationId,
            userMessage: userContent,
            assistantMessage: fullAssistantText,
          });
          
          setDraftMessage(null);
          
          queryClient.invalidateQueries({ queryKey: ['shopping'] });
          console.log('Invalidated shopping queries after AI response');
        } catch (error) {
          console.error('Failed to save chat message:', error);
          setDraftMessage({
            id: assistantMessageId,
            role: 'assistant',
            content: 'Sorry, I encountered an error saving the message. Please try again.',
            isStreaming: false,
          });
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      setDraftMessage({
        id: assistantMessageId,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isStreaming: false,
      });
      
      const queryKey = ["chat", "history", conversationId];
      queryClient.invalidateQueries({ queryKey });
    }
  }, [draftMessage, messages, currentConversationId, saveChatMessage, queryClient]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!draftMessage?.isStreaming && (input.trim() || uploadedImages.length > 0)) {
        handleFormSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (draftMessage?.isStreaming || (!input.trim() && uploadedImages.length === 0)) {
      return;
    }

    const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];
    
    if (input.trim()) {
      content.push({
        type: 'text',
        text: input.trim(),
      });
    }
    
    uploadedImages.forEach(({ dataUrl }) => {
      content.push({
        type: 'image_url',
        image_url: {
          url: dataUrl,
        },
      });
    });

    setInput("");
    setUploadedImages([]);
    
    await sendMessage(content.length === 1 && content[0].type === 'text' ? content[0].text! : content);
  }, [input, uploadedImages, draftMessage, sendMessage]);

  const isInitialLoading = isLoadingHistory && messages.length === 0;
  const isStreaming = draftMessage?.isStreaming ?? false;
  const canSend = !isStreaming && !isInitialLoading && (input.trim() || uploadedImages.length > 0);

  const displayMessages = React.useMemo(() => {
    const allMessages = [...messages];
    if (draftMessage) {
      allMessages.push({
        id: draftMessage.id,
        role: draftMessage.role,
        content: draftMessage.content,
        createdAt: new Date(),
      });
    }
    return allMessages;
  }, [messages, draftMessage]);

  return (
    <div className={`${styles.chatWidget} ${className || ""}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>AI Assistant</h3>
        <p className={styles.subtitle}>Your personal productivity partner</p>
        {isFetchingHistory && !isInitialLoading && (
          <div className={styles.loadingIndicator}>
            <Loader size={14} className={styles.loader} />
            <span>Loading history...</span>
          </div>
        )}
      </div>
      
      <div className={styles.messageContainer}>
        <ImageUpload
          onImagesSelected={handleImagesSelected}
          disabled={isInitialLoading || isProcessingImages}
        />
        
        <div className={styles.messageList} ref={scrollRef}>
          {isInitialLoading ? (
            <div className={styles.loadingState}>
              <Loader size={48} className={styles.loader} />
              <p>Loading your chat history...</p>
            </div>
          ) : displayMessages.length === 0 ? (
            <div className={styles.emptyState}>
              <Bot size={48} />
              <p>Ask me anything about your productivity!</p>
              <span>e.g., "Help me plan my week" or upload a photo</span>
            </div>
          ) : (
            displayMessages.map((m) => (
              <div
                key={m.id}
                className={`${styles.message} ${
                  m.role === "user" ? styles.userMessage : styles.assistantMessage
                }`}
              >
                <Avatar className={styles.avatar}>
                  {m.role === "user" ? (
                    <>
                      <AvatarImage src={user?.avatarUrl ?? ""} />
                      <AvatarFallback>
                        {user?.displayName?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback>
                      <Bot size={20} />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className={styles.messageContent}>
                  <MessageContent 
                    content={typeof m.content === 'string' ? m.content : JSON.stringify(m.content)} 
                    isUser={m.role === "user"} 
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className={styles.inputForm}>
        {uploadedImages.length > 0 && (
          <div className={styles.imagePreviewContainer}>
            {uploadedImages.map((imageData, index) => (
              <ImagePreview
                key={index}
                file={imageData.file}
                dataUrl={imageData.dataUrl}
                onRemove={() => handleRemoveImage(index)}
                size="sm"
              />
            ))}
          </div>
        )}
        
        <div className={styles.inputRow}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleMicrophoneClick}
            className={styles.micButton}
            disabled={isInitialLoading}
          >
            <Mic size={18} />
          </Button>
          
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={uploadedImages.length > 0 ? "Add a message (optional)..." : "Ask for help with your goals..."}
            className={styles.textarea}
            rows={1}
            disableResize
            disabled={isInitialLoading}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            className={styles.sendButton}
          >
            {isStreaming ? <Loader className={styles.loader} /> : <Send size={18} />}
          </Button>
        </div>
        
        {isProcessingImages && (
          <div className={styles.processingIndicator}>
            <Loader size={14} className={styles.loader} />
            <span>Processing images...</span>
          </div>
        )}

        <div className={styles.quickActions}>
          {quickActions.map((action) => (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              className={styles.quickActionButton}
              disabled={isInitialLoading || isStreaming}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </form>
    </div>
  );
};