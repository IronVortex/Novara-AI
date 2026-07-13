import { useCallback, useContext, useRef, useState } from "react";
import { MyContext } from "../context/MyContext.jsx";
import {
  continueMessage,
  editMessage,
  getThreads,
  regenerateMessage,
  sendMessageStream,
  uploadFile,
} from "../services/api.js";
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
  } = useContext(MyContext);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState([]);
  const abortRef = useRef(null);

  const refreshThreads = useCallback(async () => {
    try {
      const threads = await getThreads();
      setAllThreads(normalizeThreads(threads));
    } catch (refreshError) {
      console.warn("Failed to refresh thread list", refreshError);
    }
  }, [setAllThreads]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
    setToast({ type: "success", message: "Generation stopped" });
  }, [setToast]);

  const sendChat = useCallback(
    async (overrideMessage) => {
      const message = (overrideMessage ?? prompt).trim();
      if (!message || isGenerating) return;

      setIsGenerating(true);
      setError("");
      setNewChat(false);
      setPrevChats((prev) => [...prev, { role: "user", content: message }]);
      setPrompt("");

      const controller = new AbortController();
      abortRef.current = controller;

      let streamedContent = "";
      setPrevChats((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
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
      } catch (sendError) {
        if (sendError.name === "AbortError") return;
        setError(sendError.message || "Unable to send the message right now.");
        setPrevChats((prev) => prev.slice(0, -2));
        setToast({ type: "error", message: sendError.message || "Request failed" });
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [
      attachments,
      currThreadId,
      isGenerating,
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
    [currThreadId, setPrevChats, setToast]
  );

  const continueResponse = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await continueMessage({ threadId: currThreadId });
      setPrevChats(response.messages || []);
    } catch (continueError) {
      setToast({ type: "error", message: continueError.message });
    } finally {
      setIsGenerating(false);
    }
  }, [currThreadId, setPrevChats, setToast]);

  const editUserPrompt = useCallback(
    async (messageIndex, content) => {
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
    [currThreadId, setPrevChats, setToast]
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
    addFiles,
    setAttachments,
    refreshThreads,
  };
}
