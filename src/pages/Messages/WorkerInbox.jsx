import {
    Box,
    Typography,
    Avatar,
    InputBase,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Badge,
    CircularProgress,
    Skeleton,
  } from "@mui/material";
  import { useState, useEffect, useRef } from "react";
  import { Send, Add, ArrowBack, Close, AttachFile, Image, Description, Download, CheckCircle, Mic, Stop, PlayArrow, Pause } from "@mui/icons-material";
  import SearchIcon from "@mui/icons-material/Search";
import CustomText, { textStyles } from "../../components/CustomText";
import chatimage from "../../Assets/chatimage.jpeg";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import url, { socketurl } from "../../url";
import { io } from "socket.io-client";
import {
  updateThreadCount,
  incrementThreadCount,
  clearThreadCount,
  clearAllCounts,
  setUnreadCounts,
} from "../../store/slices/messageCountSlice";
  
  const WorkerInbox = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
  
    const [searchTerm, setSearchTerm] = useState("");
    const [chatList, setChatList] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showWorkerList, setShowWorkerList] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [isLoadingThreads, setIsLoadingThreads] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [showThreads, setShowThreads] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    // Audio states (match SuperAdmin)
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isUploadingAudio, setIsUploadingAudio] = useState(false);
    const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);
    const [playingAudioId, setPlayingAudioId] = useState(null);
    const [audioProgressById, setAudioProgressById] = useState({});
    const [messageDeliveryStatus, setMessageDeliveryStatus] = useState({});
    const [onlineUsers, setOnlineUsers] = useState({});
  
    const { company } = useSelector((state) => state.auth);
    const companyId = company?.id;
    const token = useSelector((state) => state.auth.token);
    const messageCountState = useSelector((state) => state.messageCount || { total: 0, threads: {}, roleBased: {} });
    const totalUnreadCount = messageCountState.total || 0;
    const threadCounts = messageCountState.threads || {};
    const inboxCount = totalUnreadCount;
  
    // Function to convert database timestamp to user's local time
    const formatMessageTime = (dbTimestamp) => {
      // Create a Date object from the database timestamp
      const messageDate = new Date(dbTimestamp);
      
      // Format according to user's timezone
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      return messageDate.toLocaleString('en-US', options);
    };
  
    // Image upload function
    const uploadImage = async (file) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch(`${socketurl}api/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const result = await response.json();
      
      if (!result.error && result.data?.url) {
        return result.data.url;
      } else {
        throw new Error(result.message || t("messages.imageUploadFailed"));
      }
    };
  
    // File upload function for PDF/Word documents
    const uploadFile = async (file) => {
      console.log("📤 Starting file upload:", { fileName: file.name, fileSize: file.size, fileType: file.type });
      
      const formData = new FormData();
      formData.append("pdf", file);
      
      console.log("📤 Uploading to:", `${socketurl}api/upload/pdf`);
      
      const response = await fetch(`${socketurl}api/upload/pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      console.log("📤 Upload response status:", response.status);
      
      const result = await response.json();
      console.log("📤 Upload response data:", result);
      
      if (!result.error && result.data?.url) {
        console.log("✅ File upload successful, URL:", result.data.url);
        return result.data.url;
      } else if (!result.error && result.url) {
        console.log("✅ File upload successful (alternative URL format), URL:", result.url);
        return result.url;
      } else {
        console.error("❌ File upload failed:", result);
        console.error("❌ Response structure:", { error: result.error, data: result.data, url: result.url });
        throw new Error(result.message || t("messages.fileUploadFailed"));
      }
    };
  
    // Function to format time for thread list (shorter format)
    const formatThreadTime = (dbTimestamp) => {
      try {
        // Parse the UTC timestamp
        const messageDate = new Date(dbTimestamp);
        
        if (isNaN(messageDate.getTime())) {
          console.warn("Invalid timestamp:", dbTimestamp);
          return t("messages.invalidTime");
        }
        
        // Get the current time to compare
        const now = new Date();
        const timeDiff = Math.abs(now.getTime() - messageDate.getTime());
        
        // If the message is very recent (within 1 minute), show current time
        if (timeDiff < 60000) { // 1 minute = 60000ms
          const currentTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          console.log("Using current time for recent message:", { dbTimestamp, currentTime });
          return currentTime;
        }
        
        // For older messages, use direct timezone conversion
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Use toLocaleTimeString with timezone directly
        const formatted = messageDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: userTimezone
        });
        
        console.log("Time formatting:", { 
          dbTimestamp, 
          formatted, 
          utcTime: messageDate.toString(),
          userTimezone: userTimezone,
          timeDiff: timeDiff / 1000 / 60 + " minutes ago"
        });
        
        return formatted;
      } catch (error) {
        console.error("Error formatting time:", error, "for timestamp:", dbTimestamp);
        return t("messages.error");
      }
    };
  
    // Extract logged-in user id from JWT
    const userId = token
      ? JSON.parse(atob(token.split(".")[1])).id
      : null;
  
    const [socket, setSocket] = useState(null);
    const processedMessageIdsRef = useRef(new Set());
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const audioRefs = useRef({});
    const audioBlobUrlsRef = useRef({});
  const selectedChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
    // Cleanup audio refs on unmount
    useEffect(() => {
      return () => {
        Object.keys(audioRefs.current).forEach((id) => {
          const a = audioRefs.current[id];
          if (a) { a.pause(); a.src = ""; }
          if (audioBlobUrlsRef.current[id]) { window.URL.revokeObjectURL(audioBlobUrlsRef.current[id]); delete audioBlobUrlsRef.current[id]; }
        });
        if (audioUrl) window.URL.revokeObjectURL(audioUrl);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };
    }, []);
  
    // Audio helpers (mirror SuperAdmin)
    const uploadAudio = async (blob) => {
      const formData = new FormData();
      formData.append("audio", blob, "audio.webm");
      const response = await fetch(`${socketurl}api/upload/audio`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (!result.error && result.data?.url) return result.data.url;
      if (!result.error && result.url) return result.url;
      throw new Error(result.message || t("messages.audioUploadFailed"));
    };
  
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        audioChunksRef.current = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mr.onstop = async () => {
          const created = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const local = window.URL.createObjectURL(created);
          setAudioBlob(created);
          setAudioUrl(local);
          setIsUploadingAudio(true);
          try {
            const remote = await uploadAudio(created);
            setUploadedAudioUrl(remote);
          } finally {
            setIsUploadingAudio(false);
          }
        };
        mr.start();
        setIsRecording(true);
        setRecordingDuration(0);
        recordingTimerRef.current = setInterval(() => setRecordingDuration((p) => p + 1), 1000);
      } catch (e) {
        alert(t("messages.microphoneAccessDenied"));
      }
    };
  
    const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
      }
    };
  
    const cancelRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);
      setRecordingDuration(0);
      setAudioBlob(null);
      if (audioUrl) window.URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setUploadedAudioUrl(null);
      audioChunksRef.current = [];
      if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    };
  
    const formatDuration = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    };
  
    const toggleAudioPlayback = async (messageId, remoteUrl) => {
      if (!remoteUrl) return;
      const existing = audioRefs.current[messageId];
      if (!existing) {
        const resp = await fetch(remoteUrl, { headers: { Authorization: `Bearer ${token}`, Accept: 'audio/webm, audio/*' }, mode: 'cors' });
        if (!resp.ok) { alert(t("messages.failedToLoadAudio")); return; }
        const blob = await resp.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        audioBlobUrlsRef.current[messageId] = blobUrl;
        const audio = new Audio(blobUrl);
        audioRefs.current[messageId] = audio;
        audio.onloadedmetadata = () => {
          const duration = isFinite(audio.duration) ? Math.floor(audio.duration) : 0;
          setAudioProgressById((prev) => ({ ...prev, [messageId]: { current: 0, duration } }));
        };
        audio.ontimeupdate = () => {
          setAudioProgressById((prev) => ({ ...prev, [messageId]: { current: Math.floor(audio.currentTime || 0), duration: Math.floor(audio.duration || prev[messageId]?.duration || 0) } }));
        };
        audio.onended = () => {
          setPlayingAudioId(null);
          if (audioBlobUrlsRef.current[messageId]) { window.URL.revokeObjectURL(audioBlobUrlsRef.current[messageId]); delete audioBlobUrlsRef.current[messageId]; }
          audioRefs.current[messageId] = null;
          setAudioProgressById((prev) => ({ ...prev, [messageId]: { current: 0, duration: prev[messageId]?.duration || 0 } }));
        };
        try { await audio.play(); setPlayingAudioId(messageId); } catch { alert(t("messages.failedToPlayAudio")); }
      } else {
        if (playingAudioId === messageId) { existing.pause(); setPlayingAudioId(null); }
        else { if (playingAudioId) audioRefs.current[playingAudioId]?.pause(); existing.currentTime = 0; await existing.play(); setPlayingAudioId(messageId); }
      }
    };
  
    const clearUploadedAudio = () => {
      setUploadedAudioUrl(null);
      setAudioBlob(null);
      if (audioUrl) { window.URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
    };
    // ✅ Initialize socket only once
    useEffect(() => {
      if (!token) return;

      const newSocket = io(socketurl, { transports: ["websocket"], autoConnect: true });
  
  
  
  // keep latest selectedChat
  
  
  
    const handleIncoming = (data, evt) => {
      console.log(`📩 Event [${evt}] received:`, data);
  
      const newMsg = data.message || data;
      const threadId = data.threadId || data.thread_id;
  
      // Check if this is our own message or from another user
      const isOwnMessage = newMsg.sender_id == userId;
      console.log("isOwnMessage", isOwnMessage);
  
      // ✅ Update right-side chat if it's the current one (avoid duplicates)
      if (selectedChatRef.current && String(threadId) === String(selectedChatRef.current.id)) {
        setMessages((prev) => {
          // If this is a server confirmation, replace optimistic temp by tempId
          if (evt === 'message_sent' && data.tempId) {
            const filtered = prev.filter(m => m.tempId !== data.tempId);
            // Avoid duplicate by ID
            if (filtered.some(m => m.id === newMsg.id)) return filtered;
            return [...filtered, newMsg];
          }
  
          // Only add real messages from server (not optimistic messages)
          const isRealMessage = !newMsg.tempId || !newMsg.tempId.startsWith('temp_');
          if (!isRealMessage) return prev;
  
          // Simple duplicate check by ID or tempId
          const isDuplicate = prev.some(msg => msg.id === newMsg.id || (data.tempId && msg.tempId === data.tempId));
          if (isDuplicate) return prev;
  
          return [...prev, newMsg];
        });
      }
  
      // Unread count behavior: only messages from others affect unread counts
      if (!isOwnMessage && socket && socket.connected) {
        const isActive = selectedChatRef.current && String(selectedChatRef.current.id) === String(threadId);
        if (isActive) {
          // If viewing the thread, mark this specific message delivered and read
          if (newMsg?.id && !(typeof newMsg.id === 'string' && newMsg.id.startsWith('temp_'))) {
            const tId = Number(threadId);
            socket.emit("mark_message_delivered", { messageId: Number(newMsg.id) || newMsg.id, threadId: isNaN(tId) ? threadId : tId });
            socket.emit("mark_message_read", { messageId: Number(newMsg.id) || newMsg.id, threadId: isNaN(tId) ? threadId : tId });
          }
          // Ensure server resets thread count and updates total
          socket.emit("get_thread_unread_count", { threadId });
          socket.emit("get_total_unread_count");
          // Local immediate clear for responsiveness
          dispatch(updateThreadCount({ threadId: String(threadId), count: 0 }));
        } else {
          // Not active → ask server for accurate unread count
          socket.emit("get_thread_unread_count", { threadId });
        }
      }
  
      // ✅ Always update left-side thread list
      setChatList((prev) => {
        const updated = prev.map((c) => {
          if (String(c.id) === String(threadId)) {
            // Format message content for display
            let displayMsg = newMsg.content;
            if (newMsg.message_type === t("image")) {
              // For image messages, show content with image icon
              if (newMsg.content && newMsg.content !== "File shared") {
                displayMsg = `${newMsg.content} 📷`;
              } else {
                displayMsg = `📷 ${t("messages.image")}`;
              }
            } else if (newMsg.message_type === "system" || newMsg.message_type === "file") {
              // For file messages, show content with document icon
              if (newMsg.content && newMsg.content !== "File shared") {
                displayMsg = `${newMsg.content} 📄`;
              } else {
                displayMsg = `📄 ${t("messages.document")}`;
              }
            }
            
            return {
              ...c,
              msg: displayMsg,
              time: formatThreadTime(newMsg.created_at),
              last_message_at: newMsg.created_at,
              message_type: newMsg.message_type,
              file_url: newMsg.file_url,
            };
          }
          return c;
        });
  
        // Sort threads in descending order (newest first) after update
        const sorted = updated.sort((a, b) => {
          const aTime = new Date(a.last_message_at || a.created_at);
          const bTime = new Date(b.last_message_at || b.created_at);
          return bTime - aTime; // Descending order
        });
  
        return sorted;
      });
    };
  
    ["new_message", "receive_message", "new_image_message", "message_sent"].forEach(
      (evt) => {
        newSocket.on(evt, (data) => handleIncoming(data, evt));
      }
    );
      newSocket.on("connect", () => {
        console.log("🔌 Socket connected");
        newSocket.emit("authenticate", { token: token });
      });
  
      // Auth success → join personal room, fetch counts and statuses
      newSocket.on("authenticated", ({ user }) => {
        try {
          const uid = user?.id || userId;
          if (uid) newSocket.emit("join_user_room", uid);
        } catch {}
        newSocket.emit("get_total_unread_count");
        newSocket.emit("get_user_statuses");
      });
  
      // Delivery/read receipts
      newSocket.on("message_delivery_status", (data) => {
        const { messageId, status, timestamp } = data;
        setMessageDeliveryStatus((prev) => ({
          ...prev,
          [messageId]: { status, timestamp: timestamp || new Date().toISOString() },
        }));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  delivery_status: status,
                  delivered_at:
                    status === "delivered"
                      ? timestamp || m.delivered_at || new Date().toISOString()
                      : m.delivered_at,
                  read_at:
                    status === "read"
                      ? timestamp || m.read_at || new Date().toISOString()
                      : m.read_at,
                }
              : m
          )
        );
      });
  
      newSocket.on("message_read_receipt", ({ messageId, threadId }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, delivery_status: "read", read_at: new Date().toISOString() } : m
          )
        );
        // Optional: refresh thread unread count
        newSocket.emit("get_thread_unread_count", { threadId });
      });
  
      // Bulk read in thread → update UI messages to read in real-time
      newSocket.on("messages_read", ({ threadId, upToMessageId, timestamp, markedCount }) => {
        const isActive = selectedChatRef.current && String(selectedChatRef.current.id) === String(threadId);
        if (isActive) {
          const readTs = timestamp || new Date().toISOString();
          setMessages(prev => prev.map(m => {
            const withinRange = upToMessageId ? (Number(m.id) <= Number(upToMessageId)) : true;
            if (withinRange) {
              return {
                ...m,
                delivery_status: 'read',
                read_at: m.read_at || readTs,
                delivered_at: m.delivered_at || readTs
              };
            }
            return m;
          }));
        }
        // Clear thread unread and refresh totals
        dispatch(clearThreadCount({ threadId: String(threadId) }));
        newSocket.emit("get_total_unread_count");
      });
  
      newSocket.on("all_messages_marked_read", ({ markedCount, timestamp }) => {
        const readTs = timestamp || new Date().toISOString();
        if (selectedChatRef.current?.id) {
          setMessages(prev => prev.map(m => ({
            ...m,
            delivery_status: 'read',
            read_at: m.read_at || readTs,
            delivered_at: m.delivered_at || readTs
          })));
        }
        dispatch(clearAllCounts());
      });
  
      // Unread counts
      newSocket.on("total_unread_count_updated", ({ totalUnread }) => {
        // Keep slice totals in sync with inbox view
        // Note: updateMessageTypeCount doesn't exist in slice, using setUnreadCounts instead
        dispatch(setUnreadCounts({ total: totalUnread || 0 }));
      });
  
      newSocket.on("thread_unread_count", ({ threadId, unreadCount }) => {
        const isActive = selectedChatRef.current && String(selectedChatRef.current.id) === String(threadId);
        dispatch(updateThreadCount({ threadId: String(threadId), count: isActive ? 0 : (unreadCount || 0) }));
        if (isActive) newSocket.emit("get_total_unread_count");
      });
  
      // Per-thread increment push
      newSocket.on("unread_count_updated", ({ threadId, userId: who }) => {
        const isActive = selectedChatRef.current && String(selectedChatRef.current.id) === String(threadId);
        if (isActive) {
          dispatch(updateThreadCount({ threadId: String(threadId), count: 0 }));
          newSocket.emit("get_total_unread_count");
        } else {
          // Ask server for latest thread count to avoid drift
          newSocket.emit("get_thread_unread_count", { threadId });
        }
      });
  
      // Presence
      newSocket.on("user_statuses_list", ({ users = [] }) => {
        const map = {};
        users.forEach((u) => (map[String(u.userId)] = u));
        setOnlineUsers(map);
      });
  
      newSocket.on("user_status_change", (data) => {
        setOnlineUsers((prev) => ({ ...prev, [String(data.userId)]: data }));
      });
  
      setSocket(newSocket);
  
      return () => newSocket.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);
  
    // Mark unread messages as read when visible/current chat, similar to SuperAdminMessages
    useEffect(() => {
      if (selectedChat && messages.length > 0 && socket && socket.connected) {
        const unreadMessages = messages.filter((msg) => {
          if (processedMessageIdsRef.current.has(msg.id)) return false;
          // skip optimistic/temp messages without real ids
          if (typeof msg.id === 'string' && msg.id.startsWith('temp_')) return false;
          return msg.sender_id !== userId && (!msg.read_at && messageDeliveryStatus[msg.id]?.status !== 'read');
        });
  
        if (unreadMessages.length > 0) {
          unreadMessages.forEach((msg, index) => {
            processedMessageIdsRef.current.add(msg.id);
            setTimeout(() => {
              const tId = Number(selectedChat.id);
              socket.emit("mark_message_read", { messageId: Number(msg.id) || msg.id, threadId: isNaN(tId) ? selectedChat.id : tId });
            }, index * 50);
          });
        }
      }
    }, [selectedChat, messages, socket, userId, messageDeliveryStatus]);
  
    // ✅ Join/leave thread rooms when switching chats
    useEffect(() => {
      if (socket && socket.connected && selectedChat?.id) {
        socket.emit("join_thread_room", selectedChat.id);
        console.log("📡 Joined thread:", selectedChat.id);
  
        return () => {
          socket.emit("leave_thread_room", selectedChat.id);
          console.log("📴 Left thread:", selectedChat.id);
        };
      }
    }, [socket, selectedChat?.id]);
  
    // Fetch threads
    const fetchThreads = async () => {
      setIsLoadingThreads(true);
      try {
        const res = await fetch(`${socketurl}api/messages/threads?page=1&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.error && Array.isArray(data.data?.threads)) {
          const threads = data.data.threads.map((thread) => {
            // Use current time for display
            const timeToShow = formatThreadTime(new Date().toISOString());
  
            // Set message to "New conversation started" if no last message
            const messageToShow = thread.last_message_content || t("messages.newConversationStarted");
  
            return {
              id: thread.id,
              name: thread.other_user_name,
              msg: messageToShow,
              time: timeToShow,
            icon: thread.other_user_avatar || "",
            unreadCount: thread.unread_count,
            other_user_id: thread.other_user_id,
              created_at: thread.created_at,
              last_message_at: thread.last_message_at,
            };
          });
  
          // Sort threads in descending order (newest first)
          const sortedThreads = threads.sort((a, b) => {
            const aTime = new Date(a.last_message_at || a.created_at);
            const bTime = new Date(b.last_message_at || b.created_at);
            return bTime - aTime; // Descending order
          });
  
          // Initialize thread counts in Redux
          sortedThreads.forEach((thread) => {
            dispatch(updateThreadCount({
              threadId: String(thread.id),
              count: 0
            }));
          });
  
          // Add delay to prevent server time flash
          setTimeout(() => {
            setChatList(sortedThreads);
            setShowThreads(true);
            // After threads are shown, fetch detailed unread counts to populate badges
            fetchDetailedUnreadCounts();
          }, 100); // 100ms delay
        }
      } catch (err) {
        console.error("❌ Error fetching threads:", err);
      } finally {
        setIsLoadingThreads(false);
      }
    };
  
    useEffect(() => {
      if (token) fetchThreads();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);
  
    // Detailed unread counts (parity with SuperAdmin)
    const fetchDetailedUnreadCounts = async () => {
      try {
        const res = await fetch(`${socketurl}api/messages/unread-counts/detailed`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.error && data.data) {
          if (Array.isArray(data.data.threadCounts)) {
            data.data.threadCounts.forEach((thread) => {
              dispatch(updateThreadCount({ threadId: String(thread.threadId), count: thread.unreadCount || 0 }));
            });
          }
          // Refresh total from server to avoid drift
          if (socket && socket.connected) {
            socket.emit("get_total_unread_count");
          }
        }
      } catch (err) {
        console.error("❌ Error fetching detailed unread counts:", err);
      }
    };
  
    // Also fetch detailed counts on token ready once
    useEffect(() => {
      if (token) {
        fetchDetailedUnreadCounts();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);
    // Fetch messages
    const fetchMessages = async (threadId) => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(
          `${socketurl}api/messages/threads/${threadId}/messages?page=1&limit=7`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!data.error && data.data?.messages) {
          console.log("📥 Fetched messages:", data.data.messages.length);
          setMessages(data.data.messages);
        }
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };
  
    // Click chat
    const handleChatClick = (chat) => {
      setSelectedChat(chat);
      fetchMessages(chat.id);
      // Join thread room (if not already) and request fresh unread count
      if (socket && socket.connected) {
        socket.emit("join_thread_room", chat.id);
        socket.emit("get_thread_unread_count", { threadId: chat.id });
        // Mark the thread as read (bulk)
        socket.emit("mark_read", { threadId: chat.id });
        // Optimistically update local messages as read for incoming ones
        setMessages((prev) => prev.map(m => (
          (String(m.thread_id || chat.id) === String(chat.id)) && m.sender_id !== userId
            ? { ...m, delivery_status: 'read', read_at: m.read_at || new Date().toISOString(), delivered_at: m.delivered_at || new Date().toISOString() }
            : m
        )));
      }
      // Local clear of unread badge for immediate UI response
      dispatch(clearThreadCount({ threadId: String(chat.id) }));
    };
  
    const getMessageStatusIcon = (status, isMine) => {
      if (!isMine) return null;
      const palette = isMine
        ? { base: 'rgba(255,255,255,0.75)', strong: '#FFFFFF', read: '#7CF3D3' }
        : { base: '#666666', strong: '#4B5563', read: '#16A34A' };
      switch (status) {
        case 'sent':
          return (<CheckCircle sx={{ fontSize: 14, color: palette.base }} />);
        case 'delivered':
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ fontSize: 12, color: palette.base, mr: -0.5 }} />
              <CheckCircle sx={{ fontSize: 12, color: palette.strong }} />
            </Box>
          );
        case 'read':
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ fontSize: 12, color: palette.read, mr: -0.5 }} />
              <CheckCircle sx={{ fontSize: 12, color: palette.read }} />
            </Box>
          );
        default:
          return (<CheckCircle sx={{ fontSize: 14, color: palette.base }} />);
      }
    };
  
    // Handle file selection (both images and documents)
    const handleFileSelect = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const isImage = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');
        const isDocument = [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ].includes(file.type);
        
        // Validate file type
        if (!isImage && !isDocument && !isAudio) {
          alert(t("messages.invalidFileType"));
          return;
        }
        
        // Validate file size
        const maxSize = isImage ? 5 * 1024 * 1024 : isAudio ? 15 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB image, 15MB audio, 10MB docs
        if (file.size > maxSize) {
          alert(isImage ? t("messages.imageSizeTooLarge") : isAudio ? t("messages.audioSizeTooLarge") : t("messages.fileSizeTooLarge"));
          return;
        }
        
        if (isImage) {
          // Handle image upload
          setSelectedImageFile(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target.result);
          };
          reader.readAsDataURL(file);
          
          // Auto-upload image
          setIsUploadingImage(true);
          try {
            const imageUrl = await uploadImage(file);
            setUploadedImageUrl(imageUrl);
            console.log("✅ Image uploaded successfully:", imageUrl);
          } catch (error) {
            console.error("❌ Image upload failed:", error);
            alert(t("messages.imageUploadFailed"));
            setImagePreview(null);
            setSelectedImageFile(null);
          } finally {
            setIsUploadingImage(false);
            event.target.value = '';
          }
        } else if (isAudio) {
          // Handle audio upload (reuse file endpoint)
          setSelectedFile(file);
          setIsUploadingFile(true);
          try {
            const fileUrl = await uploadFile(file);
            setUploadedFileUrl(fileUrl);
          } catch (error) {
            console.error("❌ Audio upload failed:", error);
            alert(t("messages.audioUploadFailed"));
            setSelectedFile(null);
          } finally {
            setIsUploadingFile(false);
            event.target.value = '';
          }
        } else {
          // Handle document upload
          console.log("📄 Processing document file:", { name: file.name, type: file.type, size: file.size });
          setSelectedFile(file);
          
          // Auto-upload file
          setIsUploadingFile(true);
          try {
            const fileUrl = await uploadFile(file);
            console.log("📄 Setting uploaded file URL:", fileUrl);
            setUploadedFileUrl(fileUrl);
            
            // Verify state was set
            setTimeout(() => {
              console.log("📄 State verification - uploadedFileUrl:", uploadedFileUrl);
            }, 100);
          } catch (error) {
            console.error("❌ File upload failed:", error);
            alert(t("messages.fileUploadFailed"));
            setSelectedFile(null);
          } finally {
            setIsUploadingFile(false);
            event.target.value = '';
          }
        }
      }
    };
  
    // Clear uploaded image and preview
    const clearUploadedImage = () => {
      setUploadedImageUrl(null);
      setImagePreview(null);
      setSelectedImageFile(null);
    };
  
    // Clear uploaded file
    const clearUploadedFile = () => {
      setUploadedFileUrl(null);
      setSelectedFile(null);
    };
  
    // Download file function
    const downloadFile = async (fileUrl, fileName) => {
      try {
        const response = await fetch(fileUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          throw new Error('Download failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || t("messages.document");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        alert(t("messages.downloadFailed"));
      }
    };
  
    // Send message
    const handleSendMessage = async () => {
      if ((!newMessage.trim() && !uploadedImageUrl && !uploadedFileUrl && !uploadedAudioUrl) || !selectedChat || isSendingMessage) return;
  
      setIsSendingMessage(true);
  
      // Manual connection test
      if (socket && !socket.connected) {
        socket.connect();
      }
  
      try {
        let messageContent = newMessage.trim() || "File shared"; // Always send text content
        let messageType = "text"; // Default to text
  
        // Determine message type based on what's uploaded
        if (uploadedAudioUrl) {
          // Align with SuperAdmin: audio sent as 'system' type with audio file metadata
          messageType = "system";
        } else if (uploadedFileUrl) {
          console.log("📄 File message detected:", { uploadedFileUrl, selectedFile: selectedFile?.name });
          // Align with SuperAdmin: even audio files via file picker use 'system'
          messageType = "system";
          console.log("📄 File message - content:", messageContent, "fileUrl:", uploadedFileUrl);
        } 
        else if (uploadedImageUrl) {
          messageType = "image"; // Image message type
          console.log("📷 Image message - content:", messageContent, "fileUrl:", uploadedImageUrl);
        } 
        else {
          messageType = "text"; // Text message
          console.log("📝 Text message content:", messageContent);
        }
  
        if (socket && socket.connected) {
          const tempId = `temp_${Date.now()}`;
          const messageData = {
            threadId: selectedChat.id,
            participantId: selectedChat.other_user_id,
            content: messageContent,
            messageType: messageType,
            tempId: tempId,
            ...(uploadedImageUrl && { fileUrl: uploadedImageUrl }),
            ...(uploadedFileUrl && { 
              fileUrl: uploadedFileUrl, 
              fileName: selectedFile?.name,
              fileType: selectedFile?.type
            }),
            ...(uploadedAudioUrl && {
              fileUrl: uploadedAudioUrl,
              fileName: "audio.webm",
              fileType: "audio/webm"
            })
          };
  
          socket.emit("send_message", messageData);
  
          // Optimistic UI update
          const optimisticMessage = {
            id: tempId,
            tempId,
            thread_id: selectedChat.id,
            sender_id: userId,
            content: messageContent,
            message_type: messageType,
            file_url: uploadedImageUrl || uploadedFileUrl || uploadedAudioUrl || null,
            file_name: selectedFile?.name || (uploadedAudioUrl ? "audio.webm" : null),
            created_at: new Date().toISOString(),
            delivery_status: 'sent'
          };
          setMessages((prev) => [...prev, optimisticMessage]);
          setChatList((prev) => prev.map((c) => c.id === selectedChat.id ? {
            ...c,
            msg: uploadedAudioUrl ? `🎤 ${t("messages.audio")}`
                : messageType === 'image' ? (messageContent && messageContent !== 'File shared' ? `${messageContent} 📷` : `📷 ${t("messages.image")}`)
                : (messageType === 'system' || messageType === 'file') ? (messageContent && messageContent !== 'File shared' ? `${messageContent} 📄` : `📄 ${t("messages.document")}`)
                : messageContent,
            time: formatThreadTime(optimisticMessage.created_at),
            last_message_at: optimisticMessage.created_at,
            message_type: messageType,
            file_url: optimisticMessage.file_url,
          } : c));
  
          setNewMessage("");
          clearUploadedImage();
          clearUploadedFile();
          clearUploadedAudio();
        } else {
          const requestBody = {
            content: messageContent,
            messageType: messageType,
            ...(uploadedImageUrl && { fileUrl: uploadedImageUrl }),
            ...(uploadedFileUrl && { 
              fileUrl: uploadedFileUrl, 
              fileName: selectedFile?.name,
              fileType: selectedFile?.type
            }),
            ...(uploadedAudioUrl && {
              fileUrl: uploadedAudioUrl,
              fileName: "audio.webm",
              fileType: "audio/webm"
            })
          };
  
          const res = await fetch(
            `${socketurl}api/messages/threads/${selectedChat.id}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            }
          );
          const data = await res.json();
  
          if (!data.error && data.data?.message) {
            setMessages((prev) => [...prev, data.data.message]);
  
            // Increment count for HTTP sent message (since no socket event will come)
            dispatch(incrementThreadCount({
              threadId: String(selectedChat.id),
              timestamp: data.data.message.created_at
            }));
  
            // Update thread list with the new message using server time
            setChatList((prev) =>
              prev.map((c) => {
                if (c.id === selectedChat.id) {
                  // Format message content for display
                  let displayMsg = data.data.message.content;
                  if (data.data.message.message_type === "image") {
                    // For image messages, show content with image icon
                    if (data.data.message.content && data.data.message.content !== "File shared") {
                      displayMsg = `${data.data.message.content} 📷`;
                    } else {
                      displayMsg = `📷 ${t("messages.image")}`;
                    }
                  } else if (data.data.message.message_type === "system" || data.data.message.message_type === "file") {
                    // For file messages, show content with document icon
                    if (data.data.message.content && data.data.message.content !== "File shared") {
                      displayMsg = `${data.data.message.content} 📄`;
                    } else {
                      displayMsg = `📄 ${t("messages.document")}`;
                    }
                  }
                  
                  return {
                    ...c,
                    msg: displayMsg,
                    time: new Date(data.data.message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    last_message_at: data.data.message.created_at,
                    message_type: data.data.message.message_type,
                    file_url: data.data.message.file_url,
                  };
                }
                return c;
              })
            );
          }
          setNewMessage("");
          clearUploadedImage();
          clearUploadedFile();
          clearUploadedAudio();
        }
      } catch (err) {
        console.error("Error sending message:", err);
      } finally {
        setIsSendingMessage(false);
      }
    };
  
    // Fetch workers
    const fetchWorkers = async () => {
      setIsLoadingWorkers(true);
      try {
        const res = await fetch(`${url}public/workers?no_pagination=true&status=active`);
        const data = await res.json();
        if (!data.error && Array.isArray(data.data?.records)) {
          setWorkers(data.data.records);
        }
      } catch (err) {
        console.error("❌ Error fetching workers:", err);
      } finally {
        setIsLoadingWorkers(false);
      }
    };
  
    // Start new chat
    const startNewChat = async (worker) => {
      const tempId = `temp-${worker.id}-${Date.now()}`;
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
  
      const optimisticThread = {
        id: tempId,
        name: worker.name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim(),
        msg: t("messages.newConversationStarted"),
        time: currentTime,
        icon: worker.profile_image ? `${socketurl}${worker.profile_image}` : "",
        other_user_id: worker.id,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      };
  
      // Check if thread already exists with this user
      const existingThread = chatList.find((c) => c.other_user_id === worker.id);
      if (existingThread) {
        console.log("Thread already exists with this user:", existingThread);
        setShowWorkerList(false);
        setSelectedChat(existingThread);
        fetchMessages(existingThread.id);
        return;
      }
  
      // Add optimistic thread
      setChatList((prev) => [optimisticThread, ...prev]);
      setShowWorkerList(false);
      setSelectedChat(optimisticThread);
      setMessages([]);
  
      try {
        console.log("Creating thread for worker:", worker.id, "with role: worker");
        const res = await fetch(`${socketurl}api/messages/threads`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId: worker.id,
            receiverRole: "worker",
          }),
        });
  
        const data = await res.json();
        console.log("Thread creation response:", data);
  
        if (!data.error && data.data?.thread) {
          const thread = data.data.thread;
          console.log("Thread data:", thread);
  
          const confirmedThread = {
            id: thread.id,
            name: thread.other_user_name || worker.name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim(),
            msg: thread.last_message_content || t("messages.newConversationStarted"),
            time: thread.last_message_at
              ? new Date(thread.last_message_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                hour12: true
              })
              : new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              }),
            icon: thread.other_user_avatar || (worker.profile_image ? `${socketurl}${worker.profile_image}` : ""),
            other_user_id: thread.other_user_id || worker.id,
            created_at: thread.created_at || new Date().toISOString(),
            last_message_at: thread.last_message_at || new Date().toISOString(),
          };
  
          console.log("Confirmed thread:", confirmedThread);
  
          // Check if this thread already exists in our list
          const existingThread = chatList.find((c) => c.id === confirmedThread.id);
          if (existingThread) {
            console.log("Thread already exists, just selecting it");
            setSelectedChat(confirmedThread);
            fetchMessages(confirmedThread.id);
            return;
          }
  
          setChatList((prev) => {
            console.log("Previous chat list:", prev);
  
            // First, remove the temporary thread if it exists
            const withoutTemp = prev.filter((c) => c.id !== tempId);
            console.log("After removing temp thread:", withoutTemp);
  
            // Check if the confirmed thread already exists by ID or other_user_id
            const existsById = withoutTemp.some((c) => c.id === confirmedThread.id);
            const existsByUserId = withoutTemp.some((c) => c.other_user_id === confirmedThread.other_user_id);
            console.log("Thread exists by ID:", existsById, "by user ID:", existsByUserId);
  
            if (existsById) {
              // Update existing thread by ID
              const updated = withoutTemp.map((c) =>
                c.id === confirmedThread.id ? confirmedThread : c
              );
              console.log("Updated existing thread by ID:", updated);
              return updated;
            } else if (existsByUserId) {
              // Update existing thread by user ID
              const updated = withoutTemp.map((c) =>
                c.other_user_id === confirmedThread.other_user_id ? confirmedThread : c
              );
              console.log("Updated existing thread by user ID:", updated);
              return updated;
            } else {
              // Add new thread
              const newList = [confirmedThread, ...withoutTemp];
              console.log("Added new thread:", newList);
              return newList;
            }
          });
  
          setSelectedChat(confirmedThread);
          fetchMessages(confirmedThread.id);
        } else {
          setChatList((prev) => prev.filter((t) => t.id !== tempId));
          console.error("❌ Thread creation failed", data);
        }
      } catch (err) {
        setChatList((prev) => prev.filter((t) => t.id !== tempId));
        console.error("❌ Error starting chat:", err);
      }
    };
  
    const filteredChats = chatList.filter((chat) =>
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <Box sx={{ px: 1, mt: 1 }}>
       
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            height: { xs: "auto", md: "80vh" },
            border: "2px solid #091E4224",
            borderRadius: 2,
            backgroundColor: "white",
          }}
        >
          {/* Sidebar */}
          <Box
            sx={{
              width: { xs: "100%", md: 380 },
              borderRight: "1px solid #e0e0e0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <CustomText
                  sx={{
                    ...textStyles.h1,
                    fontWeight: 500,
                    fontSize: "22px",
                    color: "#2C384C",
                  }}
                >
                  {showWorkerList ? t("messages.selectWorker") : t("Worker")}
                </CustomText>
                {inboxCount > 0 && (
                  <Box
                    sx={{
                      backgroundColor: "#006EC2",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      fontFamily: "Poppins, sans-serif",
                      ml: 1,
                    }}
                  >
                    {inboxCount}
                  </Box>
                )}
              </Box>
              <IconButton
                sx={{ backgroundColor: "#003149", p: 0.2, borderRadius: "50%" }}
                onClick={() => {
                  if (showWorkerList) {
                    setShowWorkerList(false);
                  } else {
                    fetchWorkers();
                    setShowWorkerList(true);
                  }
                }}
              >
                {showWorkerList ? (
                  <ArrowBack sx={{ color: "white" }} />
                ) : (
                  <Add sx={{ color: "white" }} />
                )}
              </IconButton>
            </Box>
  
            <Divider />
  
            {/* Search */}
            {!showWorkerList && (
              <Box sx={{ px: 1, py: 0.5 }}>
                <Box
                  sx={{
                    px: 0.5,
                    mt: 0.5,
                    py: 0.4,
                    borderRadius: 1,
                    height: 34,
                    border: "2px solid #091E4224",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <InputBase
                    placeholder={t("search_placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      ml: 0.5,
                      fontSize: 15,
                      color: "#939393",
                      fontWeight: 500,
                    }}
                  />
                  <SearchIcon sx={{ fontSize: 22, color: "#888", mr: 0.5 }} />
                </Box>
              </Box>
            )}
  
            {/* Worker list or chat list */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
              <List>
                {isLoadingThreads && !showWorkerList ? (
                  // Loading skeleton for threads
                  Array.from({ length: 5 }).map((_, index) => (
                    <ListItem key={index} sx={{ px: 1, py: 1 }}>
                      <ListItemAvatar>
                        <Skeleton variant="circular" width={40} height={40} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Skeleton variant="text" width="60%" />}
                        secondary={<Skeleton variant="text" width="40%" />}
                      />
                    </ListItem>
                  ))
                ) : !showThreads && !showWorkerList ? (
                  // Show loading while waiting for delay
                  <ListItem sx={{ px: 1, py: 1 }}>
                    <ListItemAvatar>
                      <Skeleton variant="circular" width={40} height={40} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Skeleton variant="text" width="60%" />}
                      secondary={<Skeleton variant="text" width="40%" />}
                    />
                  </ListItem>
                ) : showWorkerList ? (
                  isLoadingWorkers ? (
                    // Loading skeleton for workers
                    Array.from({ length: 3 }).map((_, index) => (
                      <ListItem key={index} sx={{ px: 1, py: 1 }}>
                        <ListItemAvatar>
                          <Skeleton variant="circular" width={40} height={40} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Skeleton variant="text" width="70%" />}
                          secondary={<Skeleton variant="text" width="50%" />}
                        />
                      </ListItem>
                    ))
                  ) : (
                    workers.map((worker) => (
                      <ListItem
                        key={worker.id}
                        button
                        onClick={() => startNewChat(worker)}
                        sx={{
                          px: 1,
                          borderRadius: 2,
                          "&:hover": { backgroundColor: "#f5f5f5" },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={
                              worker.profile_image
                                ? `${socketurl}${worker.profile_image}`
                                : undefined
                            }
                          >
                            {worker.name?.charAt(0) || worker.first_name?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={worker.name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim()}
                          secondary={worker.email}
                          primaryTypographyProps={{
                            fontWeight: "600",
                            fontSize: "14px",
                            fontFamily: "Poppins, sans-serif",
                          }}
                          secondaryTypographyProps={{
                            fontSize: "13px",
                            color: "#5C5C5C",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        />
                      </ListItem>
                    ))
                  )
                ) : (
                  filteredChats.map((chat) => (
                      <ListItem
                        key={chat.id}
                        button
                        selected={selectedChat?.id === chat.id}
                        onClick={() => handleChatClick(chat)}
                        sx={{
                          px: 1,
                          borderRadius: 2,
                          backgroundColor:
                          selectedChat?.id === chat.id ? "#F0F9FF" : "transparent",
                          "&:hover": {
                            backgroundColor:
                            selectedChat?.id === chat.id ? "#F0F9FF" : "#f5f5f5",
                        },
                        position: "relative",
                        "&::before": selectedChat?.id === chat.id ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "50%",
                          width: "4px",
                          backgroundColor: "#006EC2",
                          borderRadius: "2px",
                        } : {},
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={chat.icon || undefined}>
                            {chat.name?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography
                              sx={{
                            fontWeight: "600",
                            fontSize: "14px",
                                color: selectedChat?.id === chat.id ? "#006EC2" : "#100F0F",
                            fontFamily: "Poppins, sans-serif",
                          }}
                            >
                              {chat.name}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {(() => {
                              // Check if the last message is an image
                              const isImageMessage = chat.msg && (
                                chat.msg.includes('📷') || 
                                chat.msg.includes('[Image:') || 
                                chat.msg.includes('file_url') ||
                                chat.msg.includes('.jpg') ||
                                chat.msg.includes('.jpeg') ||
                                chat.msg.includes('.png') ||
                                chat.msg.includes('.gif') ||
                                chat.msg.startsWith('http') // Legacy format: direct URL
                              );
                              
                              // Check if the last message is a document
                              const isDocumentMessage = chat.msg && (
                                chat.msg.includes('📄') || 
                                chat.msg.includes('[File:') || 
                                chat.msg.includes('.pdf') ||
                                chat.msg.includes('.doc') ||
                                chat.msg.includes('.docx') ||
                                chat.msg.includes('.txt') ||
                                chat.msg.includes('.xls') ||
                                chat.msg.includes('.xlsx') ||
                                chat.msg.includes('.ppt') ||
                                chat.msg.includes('.pptx')
                              );
                              
                              if (isImageMessage) {
                                return (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Image sx={{ fontSize: 16, color: selectedChat?.id === chat.id ? "#006EC2" : "#666666" }} />
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        color: selectedChat?.id === chat.id ? "#006EC2" : "#666666",
                                        fontFamily: "Poppins, sans-serif",
                                        fontWeight: selectedChat?.id === chat.id ? "500" : "400",
                                      }}
                                    >
                                      {t("messages.image")}
                                    </Typography>
                                  </Box>
                                );
                              } else if (isDocumentMessage) {
                                return (
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Description sx={{ fontSize: 16, color: selectedChat?.id === chat.id ? "#006EC2" : "#666666" }} />
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        color: selectedChat?.id === chat.id ? "#006EC2" : "#666666",
                                        fontFamily: "Poppins, sans-serif",
                                        fontWeight: selectedChat?.id === chat.id ? "500" : "400",
                                      }}
                                    >
                                      {t("messages.document")}
                                    </Typography>
                                  </Box>
                                );
                              }
                              
                              return (
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    color: selectedChat?.id === chat.id ? "#006EC2" : "#666666",
                                    fontFamily: "Poppins, sans-serif",
                                    fontWeight: selectedChat?.id === chat.id ? "500" : "400",
                                  }}
                                >
                                  {chat.msg}
                                </Typography>
                              );
                            })()}
                          </Box>
                        }
                          secondaryTypographyProps={{
                            fontSize: "13px",
                            color:
                            selectedChat?.id === chat.id ? "#006EC2" : "#666666",
                            fontFamily: "Poppins, sans-serif",
                          fontWeight: selectedChat?.id === chat.id ? "500" : "400",
                        }}
                      />
                          <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2.5,
      }}
    >
          <Typography
        variant="body2"
        sx={{
          fontSize: "13px",
          fontFamily: "Poppins, sans-serif",
                            color: selectedChat?.id === chat.id ? "#006EC2" : "#666666",
                            fontWeight: selectedChat?.id === chat.id ? "500" : "400",
                            opacity: selectedChat?.id === chat.id ? "1" : "1",
        }}
      >
        {chat.time}
      </Typography>
                        {(() => {
                          const count = threadCounts[String(chat.id)] || 0;
                          return count > 0 && (
                            <Box
                              sx={{
                                backgroundColor: "#006EC2",
                                color: "white",
                                borderRadius: "50%",
                                minWidth: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: "600",
                                fontFamily: "Poppins, sans-serif",
                              }}
                            >
                              {count}
                            </Box>
                          );
                        })()}
    </Box>
                      </ListItem>
                  ))
                )}
              </List>
            </Box>
          </Box>
  
          {/* Right side */}
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            {selectedChat && (
              <Box
                sx={{
                  px: 3,
                  py: 1.2,
                  borderBottom: "1px solid #e0e0e0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ mr: 2 }} src={selectedChat.icon} />
                  <Typography
                    sx={{
                      fontWeight: "600",
                      fontSize: "16px",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {selectedChat.name}
                  </Typography>
                </Box>
                <IconButton onClick={() => setSelectedChat(null)}>
                  <Close />
                </IconButton>
              </Box>
            )}
  
            {/* Messages */}
              <Box
                sx={{
                  flexGrow: 1,
                  px: 3,
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  overflowY: "auto",
                  maxHeight: "calc(80vh - 100px)",
                }}
              >
              {!selectedChat && (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: "#5C5C5C",
                  }}
                >
                  <img
                  crossOrigin="anonymous"
                   src={chatimage} alt="chat" />
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "18px",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {t("messages.selectConversation")}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#888",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {t("messages.chooseConversation")}
                  </Typography>
                </Box>
              )}
  
              {isLoadingMessages && selectedChat && (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <CircularProgress size={40} />
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#888",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {t("messages.loadingMessages")}
                  </Typography>
                </Box>
              )}
  
         {selectedChat &&
                messages.slice(-7).map((msg) => {
      const isMine =
        msg.sender_id === userId || msg.sender?.id === userId;
                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        backgroundColor: isMine ? "#006EC2" : "#F0F9FF",
                        color: isMine ? "white" : "#2C3E50",
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        maxWidth: "70%",
                      }}
                    >
                      {msg.message_type === "text" ? (
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: 400,
                            fontFamily: "Poppins, sans-serif",
                            color: isMine ? "white" : "#2C3E50",
                          }}
                        >
                          {msg.content !== "File shared" ? msg.content : ""}
                        </Typography>
                      ) : msg.message_type === "image" ? (
                        <Box>
                          <img
                          crossOrigin="anonymous"
                            src={(() => {
                              // Use file_url for image display
                              if (msg.file_url) {
                              // If file_url is already a full URL, use it directly
                              if (msg.file_url.startsWith('http://') || msg.file_url.startsWith('https://')) {
                                return msg.file_url;
                              }
                              // If it's a relative path, add the base URL
                              return `${socketurl}${msg.file_url}`;
                              }
                              return '';
                            })()}
                            alt={msg.file_name || "Image"}
                            style={{ 
                              width: "120px", 
                              height: "120px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              cursor: "pointer",
                              display: "block"
                            }}
                            onClick={() => {
                              const imageUrl = (() => {
                                if (msg.file_url) {
                                  if (msg.file_url.startsWith('http://') || msg.file_url.startsWith('https://')) {
                                    return msg.file_url;
                                  }
                                  return `${socketurl}${msg.file_url}`;
                                }
                                return '';
                              })();
                              if (imageUrl) {
                                window.open(imageUrl, '_blank');
                              }
                            }}
                          />
                          {msg.content && (
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 400,
                                fontFamily: "Poppins, sans-serif",
                                color: isMine ? "white" : "#2C3E50",
                                mb: 1,
                              }}
                            >
                              {msg.content !== "File shared" ? msg.content : ""}
                            </Typography>
                          )}
                        </Box>
                      ) : (msg.message_type === "file" || msg.message_type === "system") ? (
                        (() => {
                          // Use file_url for file display
                          let fileUrl = msg.file_url;
                          let fileName = msg.file_name || "Document";
                          
                          // Fallback to old format parsing if no file_url
                          if (!fileUrl) {
                            fileUrl = msg.content?.match(/\[File: .*? - (.*?)\]/)?.[1];
                            fileName = msg.file_name || msg.content?.match(/\[File: (.*?) -/)?.[1] || "Document";
                          }
                          
                          // Detect audio inside system/file (parity with SuperAdmin)
                          const isAudio = (msg.fileType && msg.fileType.includes('audio'))
                            || (fileUrl && fileUrl.includes('audio'))
                            || (fileName && (fileName.includes('audio') || fileName.endsWith('.webm') || fileName.endsWith('.mp3') || fileName.endsWith('.m4a') || fileName.endsWith('.wav')));
  
                          if (isAudio) {
                            const audioFileUrl = fileUrl ? (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') ? fileUrl : `${socketurl}${fileUrl}`) : '';
                            const progress = audioProgressById[msg.id]?.current || 0;
                            const duration = audioProgressById[msg.id]?.duration || 0;
                            const percent = duration > 0 ? Math.min(100, Math.floor((progress / duration) * 100)) : 0;
                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.25,
                                  p: 1.25,
                                  backgroundColor: isMine ? "rgba(255, 255, 255, 0.1)" : "#f5f5f5",
                                  borderRadius: "14px",
                                  border: isMine ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #e0e0e0",
                                  minWidth: "240px",
                                  maxWidth: "360px"
                                }}
                              >
                                <IconButton
                                  onClick={() => toggleAudioPlayback(msg.id, audioFileUrl)}
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    backgroundColor: playingAudioId === msg.id ? (isMine ? "rgba(255,255,255,0.25)" : "#005bb0") : (isMine ? "rgba(255, 255, 255, 0.2)" : "#006EC2"),
                                    color: "white",
                                    borderRadius: "50%",
                                    "&:hover": { backgroundColor: isMine ? "rgba(255, 255, 255, 0.3)" : "#0056b3" }
                                  }}
                                >
                                  {playingAudioId === msg.id ? (<Pause sx={{ fontSize: 20 }} />) : (<PlayArrow sx={{ fontSize: 20 }} />)}
                                </IconButton>
                                <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{ position: "relative", flex: 1, height: 6, borderRadius: 999, backgroundColor: isMine ? "rgba(255,255,255,0.25)" : "#E1E4E8" }}>
                                    <Box sx={{ position: "absolute", top: 0, left: 0, height: 6, width: `${percent}%`, backgroundColor: isMine ? "#FFFFFF" : "#006EC2", borderRadius: 999, transition: "width 120ms linear" }} />
                                    <Box sx={{ position: "absolute", top: "50%", left: `calc(${percent}% - 6px)`, transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", backgroundColor: isMine ? "#FFFFFF" : "#006EC2" }} />
                                  </Box>
                                  <Typography sx={{ fontSize: "11px", fontFamily: "Poppins, sans-serif", color: isMine ? "rgba(255,255,255,0.95)" : "#4A4A4A", minWidth: 68, textAlign: "right" }}>
                                    {formatDuration(progress)} / {formatDuration(duration)}
                                  </Typography>
                                  <IconButton size="small" component="a" href={audioFileUrl} download sx={{ ml: 0.25, width: 28, height: 28, borderRadius: "50%", color: isMine ? "white" : "#006EC2", "&:hover": { backgroundColor: isMine ? "rgba(255,255,255,0.2)" : "#e8f4fd" } }}>
                                    <Download sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            );
                          }
  
                          const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
                          return (
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  p: 1.5,
                                  backgroundColor: isMine ? "rgba(255, 255, 255, 0.1)" : "#f5f5f5",
                                  borderRadius: "8px",
                                  border: isMine ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #e0e0e0",
                                  "&:hover": {
                                    backgroundColor: isMine ? "rgba(255, 255, 255, 0.2)" : "#e0e0e0",
                                  }
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 40,
                                    height: 40,
                                    borderRadius: "8px",
                                    backgroundColor: isMine ? "rgba(255, 255, 255, 0.2)" : "#006EC2",
                                  }}
                                >
                                  {fileExtension === 'pdf' ? (
                                    <Typography sx={{ color: isMine ? "white" : "white", fontSize: "16px", fontWeight: "bold" }}>PDF</Typography>
                                  ) : fileExtension === 'doc' || fileExtension === 'docx' ? (
                                    <Typography sx={{ color: isMine ? "white" : "white", fontSize: "16px", fontWeight: "bold" }}>DOC</Typography>
                                  ) : fileExtension === 'txt' ? (
                                    <Typography sx={{ color: isMine ? "white" : "white", fontSize: "16px", fontWeight: "bold" }}>TXT</Typography>
                                  ) : fileExtension === 'xls' || fileExtension === 'xlsx' ? (
                                    <Typography sx={{ color: isMine ? "white" : "white", fontSize: "16px", fontWeight: "bold" }}>XLS</Typography>
                                  ) : fileExtension === 'ppt' || fileExtension === 'pptx' ? (
                                    <Typography sx={{ color: isMine ? "white" : "white", fontSize: "16px", fontWeight: "bold" }}>PPT</Typography>
                                  ) : (
                                    <Description sx={{ color: isMine ? "white" : "white", fontSize: 20 }} />
                                  )}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    sx={{
                                      fontSize: "13px",
                                      fontWeight: 600,
                                      fontFamily: "Poppins, sans-serif",
                                      color: isMine ? "white" : "#2C3E50",
                                      mb: 0.5,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    {fileName}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "11px",
                                      fontFamily: "Poppins, sans-serif",
                                      color: isMine ? "rgba(255, 255, 255, 0.7)" : "#666",
                                      textTransform: "uppercase"
                                    }}
                                  >
                                    {fileExtension?.toUpperCase()} {t("messages.document")}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (fileUrl) {
                                      downloadFile(fileUrl, fileName);
                                    }
                                  }}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    backgroundColor: isMine ? "rgba(255, 255, 255, 0.2)" : "#006EC2",
                                    color: isMine ? "white" : "white",
                                    "&:hover": {
                                      backgroundColor: isMine ? "rgba(255, 255, 255, 0.3)" : "#0056b3",
                                    }
                                  }}
                                >
                                  <Download sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                              {msg.content && (
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 400,
                                    fontFamily: "Poppins, sans-serif",
                                    color: isMine ? "white" : "#2C3E50",
                                    mb: 1,
                                  }}
                                >
                                  {msg.content !== "File shared" ? msg.content : ""}
                                </Typography>
                              )}
                            </Box>
                          );
                        })()
                      ) : (
                        <img
                        crossOrigin="anonymous"
                          src={msg.file_url ? (
                            msg.file_url.startsWith('http://') || msg.file_url.startsWith('https://') 
                              ? msg.file_url 
                      : `${socketurl}${msg.file_url}`
                          ) : ''}
                          alt={msg.file_name}
                          style={{ 
                            width: "120px", 
                            height: "120px", 
                            borderRadius: "8px", 
                            objectFit: "cover",
                            display: "block"
                          }}
                        />
                      )}
                      {msg.message_type === "audio" && (() => {
                        const fileUrl = msg.file_url ? (msg.file_url.startsWith('http') ? msg.file_url : `${socketurl}${msg.file_url}`) : '';
                        const progress = audioProgressById[msg.id]?.current || 0;
                        const duration = audioProgressById[msg.id]?.duration || 0;
                        const percent = duration > 0 ? Math.min(100, Math.floor((progress / duration) * 100)) : 0;
                        return (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.25,
                              p: 1.25,
                              backgroundColor: isMine ? "rgba(255, 255, 255, 0.1)" : "#f5f5f5",
                              borderRadius: "14px",
                              border: isMine ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid #e0e0e0",
                              minWidth: "240px",
                              maxWidth: "360px"
                            }}
                          >
                            <IconButton
                              onClick={() => toggleAudioPlayback(msg.id, fileUrl)}
                              sx={{
                                width: 38,
                                height: 38,
                                backgroundColor: playingAudioId === msg.id ? (isMine ? "rgba(255,255,255,0.25)" : "#005bb0") : (isMine ? "rgba(255, 255, 255, 0.2)" : "#006EC2"),
                                color: "white",
                                borderRadius: "50%",
                                "&:hover": { backgroundColor: isMine ? "rgba(255, 255, 255, 0.3)" : "#0056b3" }
                              }}
                            >
                              {playingAudioId === msg.id ? (<Pause sx={{ fontSize: 20 }} />) : (<PlayArrow sx={{ fontSize: 20 }} />)}
                            </IconButton>
                            <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ position: "relative", flex: 1, height: 6, borderRadius: 999, backgroundColor: isMine ? "rgba(255,255,255,0.25)" : "#E1E4E8" }}>
                                <Box sx={{ position: "absolute", top: 0, left: 0, height: 6, width: `${percent}%`, backgroundColor: isMine ? "#FFFFFF" : "#006EC2", borderRadius: 999, transition: "width 120ms linear" }} />
                                <Box sx={{ position: "absolute", top: "50%", left: `calc(${percent}% - 6px)`, transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", backgroundColor: isMine ? "#FFFFFF" : "#006EC2" }} />
                              </Box>
                              <Typography sx={{ fontSize: "11px", fontFamily: "Poppins, sans-serif", color: isMine ? "rgba(255,255,255,0.95)" : "#4A4A4A", minWidth: 68, textAlign: "right" }}>
                                {formatDuration(progress)} / {formatDuration(duration)}
                              </Typography>
                              <IconButton size="small" component="a" href={fileUrl} download sx={{ ml: 0.25, width: 28, height: 28, borderRadius: "50%", color: isMine ? "white" : "#006EC2", "&:hover": { backgroundColor: isMine ? "rgba(255,255,255,0.2)" : "#e8f4fd" } }}>
                                <Download sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        );
                      })()}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                        <Typography
                          sx={{
                            fontSize: "10px",
                            fontWeight: 400,
                            color: isMine ? "rgba(255, 255, 255, 0.8)" : "#666666",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {formatThreadTime(msg.created_at)}
                        </Typography>
                        {(() => {
                          if (isMine) {
                            const deliveryStatus = msg.delivery_status || messageDeliveryStatus[msg.id]?.status || 'sent';
                            return getMessageStatusIcon(deliveryStatus, isMine);
                          }
                          return null;
                        })()}
                      </Box>
                  
                    </Box>
                  );
                })}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </Box>
  
            {/* File Upload Status */}
            {selectedChat && (uploadedFileUrl || isUploadingFile) && (
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderTop: "1px solid #E8F4FD",
                  backgroundColor: "#F8F9FA",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    border: "1px solid #E8F4FD",
                    borderRadius: "8px",
                    backgroundColor: "white",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                    {isUploadingFile ? (
                      <CircularProgress size={20} sx={{ color: "#006EC2" }} />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: "6px",
                          backgroundColor: "#006EC2",
                        }}
                      >
                        {(() => {
                          const fileExt = selectedFile?.name?.split('.').pop()?.toLowerCase();
                          if (fileExt === 'pdf') return <Typography sx={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>PDF</Typography>;
                          if (fileExt === 'doc' || fileExt === 'docx') return <Typography sx={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>DOC</Typography>;
                          if (fileExt === 'txt') return <Typography sx={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>TXT</Typography>;
                          if (fileExt === 'xls' || fileExt === 'xlsx') return <Typography sx={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>XLS</Typography>;
                          if (fileExt === 'ppt' || fileExt === 'pptx') return <Typography sx={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>PPT</Typography>;
                          return <Description sx={{ color: "white", fontSize: 16 }} />;
                        })()}
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#2C3E50",
                          fontFamily: "Poppins, sans-serif",
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {isUploadingFile ? t("messages.uploadingFile") : selectedFile?.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "11px",
                          color: "#666",
                          fontFamily: "Poppins, sans-serif",
                          textTransform: "uppercase"
                        }}
                      >
                        {isUploadingFile ? t("messages.pleaseWait") : `${selectedFile?.name?.split('.').pop()?.toUpperCase()} ${t("messages.document")}`}
                      </Typography>
                    </Box>
                  </Box>
                  {uploadedFileUrl && (
                    <IconButton
                      onClick={clearUploadedFile}
                      size="small"
                      sx={{ color: "#666" }}
                    >
                      <Close />
                    </IconButton>
                  )}
                </Box>
              </Box>
            )}
  
            {/* Image Preview */}
            {selectedChat && (imagePreview || isUploadingImage) && (
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderTop: "1px solid #E8F4FD",
                  backgroundColor: "#F8F9FA",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    border: "1px solid #E8F4FD",
                    borderRadius: "8px",
                    backgroundColor: "white",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {isUploadingImage ? (
                      <CircularProgress size={16} sx={{ color: "#006EC2" }} />
                    ) : (
                      <Image sx={{ color: "#006EC2", fontSize: 20 }} />
                    )}
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#666",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {isUploadingImage ? t("messages.uploadingImage") : t("messages.imageReadyToSend")}
                    </Typography>
                  </Box>
                  {uploadedImageUrl && (
                    <IconButton
                      onClick={clearUploadedImage}
                      size="small"
                      sx={{ color: "#666" }}
                    >
                      <Close />
                    </IconButton>
                  )}
                </Box>
                {imagePreview && !isUploadingImage && (
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <img
                    crossOrigin="anonymous"
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
  
            {/* Input */}
            {selectedChat && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  borderTop: "1px solid #E8F4FD",
                  backgroundColor: "#FAFBFC",
                }}
              >
                <input
                  type="file"
                  accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                {isRecording ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      gap: 1,
                      backgroundColor: "#F0F2F5",
                      borderRadius: "24px",
                      px: 1,
                      py: 0.5,
                      border: "1px solid #E3E6EA",
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "#ff3b30",
                        mx: 1,
                        "@keyframes recPulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.4 } },
                        animation: "recPulse 1.2s ease-in-out infinite",
                      }}
                    />
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, fontFamily: "Poppins, sans-serif", color: "#111B21", minWidth: "48px" }}>
                      {formatDuration(recordingDuration)}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton onClick={stopRecording} sx={{ width: 36, height: 36, backgroundColor: "#25D366", color: "white", mr: 0.5, "&:hover": { backgroundColor: "#20bd5a" } }}>
                      <Stop sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton onClick={cancelRecording} sx={{ width: 36, height: 36, color: "#667781", "&:hover": { backgroundColor: "#E8EEF3" } }}>
                      <Close sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    {uploadedAudioUrl && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1, px: 1.5, py: 0.5, borderRadius: "18px", backgroundColor: "#F0F2F5", border: "1px solid #E3E6EA" }}>
                        <Mic sx={{ fontSize: 18, color: "#667781" }} />
                        <Typography sx={{ fontSize: "13px", fontFamily: "Poppins, sans-serif", color: "#111B21", fontWeight: 600 }}>
                          {formatDuration(recordingDuration)}
                        </Typography>
                        <IconButton size="small" onClick={clearUploadedAudio} sx={{ color: "#667781", p: 0.5, ml: 0.5, "&:hover": { backgroundColor: "#E8EEF3" } }}>
                          <Close sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    )}
                    {!uploadedAudioUrl && (
                      <IconButton
                        onClick={startRecording}
                        disabled={isUploadingAudio || isUploadingImage || isUploadingFile}
                        sx={{ mr: 1, color: "#006EC2", "&:hover": { backgroundColor: "#E8F4FD" }, "&:disabled": { color: "#ccc" } }}
                      >
                        {isUploadingAudio ? (<CircularProgress size={20} sx={{ color: "#006EC2" }} />) : (<Mic sx={{ color: "#006EC2", fontSize: 24 }} />)}
                      </IconButton>
                    )}
                    <label htmlFor="file-upload">
                      <IconButton
                        component="span"
                        disabled={isUploadingImage || isUploadingFile || isRecording}
                        sx={{ mr: 1 }}
                      >
                        {(isUploadingImage || isUploadingFile) ? (
                          <CircularProgress size={20} sx={{ color: "#006EC2" }} />
                        ) : (
                          <AttachFile sx={{ color: "#006EC2" }} />
                        )}
                      </IconButton>
                    </label>
                    {!uploadedAudioUrl && (
                      <InputBase
                        placeholder={t("support.typeMessagePlaceholder")}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        sx={{
                          flexGrow: 1,
                          border: "1px solid #E8F4FD",
                          borderRadius: "8px",
                          px: 2,
                          py: 1,
                          height: "40px",
                          fontSize: "14px",
                          fontFamily: "Poppins, sans-serif",
                          backgroundColor: "#FFFFFF",
                          "&:focus": { borderColor: "#006EC2", outline: "none" },
                          "&::placeholder": { color: "#7F8C8D" },
                        }}
                      />
                    )}
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || (!newMessage.trim() && !uploadedImageUrl && !uploadedFileUrl && !uploadedAudioUrl)}
                      sx={{ ml: 1 }}
                    >
                      {isSendingMessage ? (
                        <CircularProgress size={20} sx={{ color: "#006EC2" }} />
                      ) : (
                        <Send sx={{ color: "#006EC2" }} />
                      )}
                    </IconButton>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };
  export default WorkerInbox;
  
  
  
  
  
  
  
  
  
  
  