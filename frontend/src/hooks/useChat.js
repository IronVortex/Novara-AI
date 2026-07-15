import { useCallback, useContext, useRef, useState } from "react";
import { MyContext } from "../context/MyContext.jsx";
import {
  branchThread,
  continueMessage,
  editMessage,
  getThreads,
  regenerateMessage,
  sendGuestMessageStream,
  sendMessageStream,
  uploadFile,
} from "../services/api.js";
import { getGuestThreads, saveGuestThread } from "../services/guestStorage.js";
import { normalizeThreads } from "../utils/helpers.js";

export function useChat() {
  const {
    prompt,
    setPrompt,
    currThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
    setAllThreads,
    setToast,
    isAuthenticated,
  } = useContext(MyContext);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState([]);
  const abortRef = useRef(null);

  const refreshThreads = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const threads = await getThreads();
        setAllThreads(normalizeThreads(threads));
      } else {
        setAllThreads(normalizeThreads(getGuestThreads()));
      }
    } catch {
      // Keep UI stable when refresh fails.
    }
  }, [isAuthenticated, setAllThreads]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
    setToast({ type: "success", message: "Generation stopped" });
  }, [setToast]);

  const persistGuest = useCallback(
    (messages) => {
      saveGuestThread({
        threadId: currThreadId,
        title: messages.find((m) => m.role === "user")?.content?.slice(0, 60),
        messages,
      });
    },
    [currThreadId]
  );

  const sendChat = useCallback(
    async (overrideMessage) => {
      const message = (overrideMessage ?? prompt).trim();
      if (!message || isGenerating) return;

      setIsGenerating(true);
      setError("");
      setNewChat(false);

      const historyBefore = [...prevChats];
      const withUser = [...historyBefore, { role: "user", content: message }];
      setPrevChats([...withUser, { role: "assistant", content: "" }]);
      setPrompt("");

      const controller = new AbortController();
      abortRef.current = controller;

      let streamedContent = "";

      try {
        if (isAuthenticated) {
          await sendMessageStream(
            { message, threadId: currThreadId, attachments },
            {
              signal: controller.signal,
              onChunk: (chunk) => {
                streamedContent += chunk;
                setPrevChats((prev) => {
                  const next = [...prev];
                  const lastIndex = next.length - 1;
                  next[lastIndex] = { ...next[lastIndex], content: streamedContent };
                  return next;
                });
              },
              onDone: async () => {
                setAttachments([]);
                await refreshThreads();
              },
              onError: (streamError) => {
                throw streamError;
              },
            }
          );
        } else {
          await sendGuestMessageStream(
            {
              message,
              history: historyBefore.map((item) => ({ role: item.role, content: item.content })),
              attachments,
            },
            {
              signal: controller.signal,
              onChunk: (chunk) => {
                streamedContent += chunk;
                setPrevChats((prev) => {
                  const next = [...prev];
                  const lastIndex = next.length - 1;
                  next[lastIndex] = { ...next[lastIndex], content: streamedContent };
                  return next;
                });
              },
              onDone: () => {
                const finalMessages = [
                  ...withUser,
                  { role: "assistant", content: streamedContent.trim() },
                ];
                setPrevChats(finalMessages);
                persistGuest(finalMessages);
                setAttachments([]);
                refreshThreads();
              },
              onError: (streamError) => {
                throw streamError;
              },
            }
          );
        }
      } catch (sendError) {
        if (sendError.name === "AbortError") return;
        setError(sendError.message || "Unable to send the message right now.");
        setPrevChats(historyBefore);
        setToast({ type: "error", message: sendError.message || "Request failed" });
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [
      attachments,
      currThreadId,
      isAuthenticated,
      isGenerating,
      persistGuest,
      prevChats,
      prompt,
      refreshThreads,
      setNewChat,
      setPrevChats,
      setPrompt,
      setToast,
    ]
  );

  const retryLast = useCallback(() => {
    const lastUser = [...prevChats].reverse().find((message) => message.role === "user");
    if (!lastUser) return;
    setPrevChats((prev) => {
      const lastUserIndex = prev.map((m) => m.role).lastIndexOf("user");
      return prev.slice(0, lastUserIndex);
    });
    sendChat(lastUser.content);
  }, [prevChats, sendChat, setPrevChats]);

  const regenerate = useCallback(
    async (messageIndex) => {
      if (!isAuthenticated) {
        const sliced = prevChats.slice(0, messageIndex);
        const lastUser = [...sliced].reverse().find((m) => m.role === "user");
        if (!lastUser) return;
        setPrevChats(sliced.slice(0, sliced.map((m) => m.role).lastIndexOf("user") + 1));
        await sendChat(lastUser.content);
        return;
      }

      setIsGenerating(true);
      setError("");
      try {
        const response = await regenerateMessage({ threadId: currThreadId, messageIndex });
        setPrevChats(response.messages || []);
        setToast({ type: "success", message: "Response regenerated" });
      } catch (regenError) {
        setError(regenError.message);
        setToast({ type: "error", message: regenError.message });
      } finally {
        setIsGenerating(false);
      }
    },
    [currThreadId, isAuthenticated, prevChats, sendChat, setPrevChats, setToast]
  );

  const continueResponse = useCallback(async () => {
    if (!isAuthenticated) {
      setToast({ type: "error", message: "Sign in to continue cloud conversations" });
      return;
    }
    setIsGenerating(true);
    try {
      const response = await continueMessage({ threadId: currThreadId });
      setPrevChats(response.messages || []);
    } catch (continueError) {
      setToast({ type: "error", message: continueError.message });
    } finally {
      setIsGenerating(false);
    }
  }, [currThreadId, isAuthenticated, setPrevChats, setToast]);

  const editUserPrompt = useCallback(
    async (messageIndex, content) => {
      if (!isAuthenticated) {
        const next = prevChats.slice(0, messageIndex);
        setPrevChats(next);
        await sendChat(content);
        return;
      }

      setIsGenerating(true);
      try {
        const response = await editMessage({ threadId: currThreadId, messageIndex, content });
        setPrevChats(response.messages || []);
      } catch (editError) {
        setToast({ type: "error", message: editError.message });
      } finally {
        setIsGenerating(false);
      }
    },
    [currThreadId, isAuthenticated, prevChats, sendChat, setPrevChats, setToast]
  );

  const branchConversation = useCallback(
    async (messageIndex) => {
      if (!isAuthenticated) {
        setToast({ type: 'error', message: 'Sign in to branch conversations' });
        return;
      }
      try {
        const response = await branchThread({ threadId: currThreadId, messageIndex });
        setToast({ type: 'success', message: 'Conversation branched!' });
        await refreshThreads();
        return response.threadId;
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      }
    },
    [currThreadId, isAuthenticated, refreshThreads, setToast]
  );

  const addFiles = useCallback(
    async (files) => {
      const uploaded = [];
      for (const file of files) {
        try {
          const response = await uploadFile(file);
          uploaded.push(response.attachment);
        } catch (uploadError) {
          setToast({ type: "error", message: uploadError.message });
        }
      }
      setAttachments((prev) => [...prev, ...uploaded]);
    },
    [setToast]
  );

  return {
    isGenerating,
    error,
    attachments,
    sendChat,
    stopGeneration,
    retryLast,
    regenerate,
    continueResponse,
    editUserPrompt,
    branchConversation,
    addFiles,
    setAttachments,
    refreshThreads,
  };
}
