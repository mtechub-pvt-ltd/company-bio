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
 
  CircularProgress,
 
  Skeleton,
 
  Chip,
 
  Dialog,
 
  DialogTitle,
 
  DialogContent,
 
  DialogActions,
 
  Checkbox,
 
  Button,

  TextField,

  Tooltip,
 
} from "@mui/material";

import { useState, useEffect, useRef } from "react";

import { Send, Add, ArrowBack, Close, AttachFile, Image, Description, Download, CheckCircle, FiberManualRecord, Mic, Stop, PlayArrow, Pause, CheckCircleOutline, ErrorOutline, KeyboardArrowUp, DoneAll } from "@mui/icons-material";

import SearchIcon from "@mui/icons-material/Search";

import CustomText, { textStyles } from "../../components/CustomText";

import chatimage from "../../Assets/chatimage.jpeg";

import { useTranslation } from "react-i18next";

import { useSelector, useDispatch } from "react-redux";

import { useSearchParams, useLocation } from "react-router-dom";



import url, { socketurl } from "../../url";

import { io } from "socket.io-client";

import {

  setUnreadCounts,
  updateThreadCount,
  incrementThreadCount,

  clearThreadCount,

  updateRoleBasedCounts,
  clearAllCounts,

} from "../../store/slices/messageCountSlice";



const Messages = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch();



  const [searchTerm, setSearchTerm] = useState("");

  const [chatList, setChatList] = useState([]);

  const [selectedChat, setSelectedChat] = useState(null);

  const [messages, setMessages] = useState([]);

  // console.log("messages____", messages)

  const [newMessage, setNewMessage] = useState("");

  const [showWorkerList, setShowWorkerList] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);

  const [workers, setWorkers] = useState([]);

  const [isLoadingThreads, setIsLoadingThreads] = useState(false);

  // Threads pagination state
  const [threadsPage, setThreadsPage] = useState(1);
  const [hasMoreThreads, setHasMoreThreads] = useState(true);
  const [isLoadingMoreThreads, setIsLoadingMoreThreads] = useState(false);
  const [totalThreads, setTotalThreads] = useState(0);
  const THREADS_PER_PAGE = 20;

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Pagination state for messages
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

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

  
  // Audio recording and playback states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioProgressById, setAudioProgressById] = useState({}); // { [messageId]: { current: seconds, duration: seconds } }
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioRefs = useRef({});
  const audioBlobUrlsRef = useRef({}); // Store blob URLs for cleanup

  // Online/Offline status tracking

  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const [userLastSeen, setUserLastSeen] = useState({});

  const [messageDeliveryStatus, setMessageDeliveryStatus] = useState({});

  // Bulk messaging states
  const [selectedUsers, setSelectedUsers] = useState([]); // Array of user IDs
  const [bulkMessage, setBulkMessage] = useState(""); // Message to send to multiple users
  const [isSendingBulkMessage, setIsSendingBulkMessage] = useState(false);
  
  // Result modal state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalData, setResultModalData] = useState({
    title: "",
    message: "",
    type: "success", // "success" or "error"
  });

  

  // Debug file upload state

  console.log("🔍 File upload state:", { uploadedFileUrl, isUploadingFile, selectedFile: selectedFile?.name });

  const { token, tokenExpiry } = useSelector((state) => state.auth);

  

  // Get unread counts from Redux
  const unreadCounts = useSelector((state) => state.messageCount || { total: 0, threads: {}, roleBased: {} });
  console.log("unreadCounts____", unreadCounts)
 

  // Get URL parameters and location state
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const userIdFromUrl = searchParams.get('userId');
  const roleFromUrl = searchParams.get('role');
  const accountExecutiveFromState = location.state?.accountExecutive;
  const companyAdminFromState = location.state?.companyAdmin;
  const workerFromState = location.state?.worker;

  // Extract logged-in user id from JWT

  const userId = token

    ? JSON.parse(atob(token.split(".")[1])).id

    : null;



  const [socket, setSocket] = useState(null);

  const selectedChatRef = useRef(null);

  const messagesEndRef = useRef(null);

  const unreadCountsRef = useRef(unreadCounts);
  const chatListRef = useRef(chatList);


  useEffect(() => {

    selectedChatRef.current = selectedChat;

  }, [selectedChat]);


  useEffect(() => {
    unreadCountsRef.current = unreadCounts;
  }, [unreadCounts]);

  useEffect(() => {
    chatListRef.current = chatList;
  }, [chatList]);


  // Track if we're loading older messages (to prevent auto-scroll)
  const isLoadingOlderRef = useRef(false);

  // Auto-scroll to bottom only for new messages, not when loading older messages
  useEffect(() => {
    // Don't auto-scroll if we just loaded older messages
    if (isLoadingOlderRef.current) {
      isLoadingOlderRef.current = false;
      return;
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);



  // Track if chat was explicitly opened by user click (not just loaded)
  const chatOpenedByUserRef = useRef(null);

  // Real-time read messages when chat is explicitly opened by user and messages are visible
  useEffect(() => {
    // Only mark as read when:
    // 1. A chat is selected
    // 2. Messages are loaded (not loading)
    // 3. The chat was explicitly opened by user (via handleChatClick)
    // 4. We haven't already marked this chat's messages as read
    if (selectedChat && messages.length > 0 && !isLoadingMessages) {
      const chatId = String(selectedChat.id);
      
      // Only mark as read if this chat was explicitly opened by user click
      if (chatOpenedByUserRef.current === chatId) {
        // Check if we've already processed this chat
        const hasUnreadMessages = messages.some(msg => 
          msg.sender_id !== userId && 
          (!msg.read_at || !messageDeliveryStatus[msg.id]?.status?.includes('read'))
        );

        if (hasUnreadMessages) {
          console.log("📱 Chat opened by user, marking unread messages as read:", chatId);

          // Find unread messages (not sent by current user)
          const unreadMessages = messages.filter(msg => 
            msg.sender_id !== userId && 
            (!msg.read_at || !messageDeliveryStatus[msg.id]?.status?.includes('read'))
          );

          console.log("📱 Found unread messages:", unreadMessages.length);

          // Mark each unread message as read in real-time
          unreadMessages.forEach((msg, index) => {
            setTimeout(() => {
              console.log("📡 Marking message as read:", msg.id);
              markMessageAsRead(msg.id, selectedChat.id);
            }, index * 50); // Small delay between each message to avoid overwhelming the socket
          });
        }
        
        // Clear the flag after processing to prevent re-processing
        chatOpenedByUserRef.current = null;
      }
    }
  }, [selectedChat?.id, messages.length, isLoadingMessages, userId]);



  // Handle incoming messages

  const handleIncoming = (data, evt) => {

    const newMsg = data.message || data;

    const threadId = data.threadId || data.thread_id;



    // Check if this is our own message or from another user

    const isOwnMessage = newMsg.sender_id == userId;

    console.log("📨 Incoming message:", { newMsg, isOwnMessage, messageType: newMsg.message_type });



    // ✅ Update right-side chat if it's the current one (avoid duplicates)

    if (selectedChatRef.current && String(threadId) === String(selectedChatRef.current.id)) {

      setMessages((prev) => {

        // Only add real messages from server (not optimistic messages)

        const isRealMessage = !newMsg.tempId || !newMsg.tempId.startsWith('temp_');



        if (!isRealMessage) {

          return prev;

        }



        // Simple duplicate check by ID

        const isDuplicate = prev.some(msg =>

          msg.id === newMsg.id ||

          (msg.tempId && msg.tempId === newMsg.tempId)

        );



        if (isDuplicate) {

          return prev;

        }



        // Add new message (no limit)

        const updatedMessages = [...prev, newMsg];

        

        // Mark message as delivered if it's not from us

        if (!isOwnMessage) {

          setTimeout(() => {

            markMessageAsDelivered(newMsg.id, threadId);

          }, 100);

        }

        

        // Update message delivery status if available

        if (newMsg.delivery_status) {

          setMessageDeliveryStatus(prev => ({

            ...prev,

            [newMsg.id]: {

              status: newMsg.delivery_status,

              timestamp: newMsg.delivered_at || newMsg.read_at || newMsg.created_at

            }

          }));

        }

        

        return updatedMessages;

      });

    } else {

      // Handle count based on message ownership



    }

    // Handle unread count updates with socket-based system

    if (!isOwnMessage) {

      const isCurrentThreadOpen =

        selectedChatRef.current && String(threadId) === String(selectedChatRef.current.id);



      if (isCurrentThreadOpen) {

        // Do NOT increment unread counts when viewing the thread; mark as read immediately

        setTimeout(() => {

          markMessageAsRead(newMsg.id, threadId);

        }, 50);

      } else {

        // Increment counts for threads not currently open

        const updatedThreads = {
          ...unreadCountsRef.current.threads,
          [String(threadId)]: (unreadCountsRef.current.threads[String(threadId)] || 0) + 1
        };
        const roleBased = calculateRoleBasedCounts(chatListRef.current, updatedThreads);
        dispatch(setUnreadCounts({
          total: unreadCountsRef.current.total + 1,
          threads: updatedThreads,
          roleBased
        }));

        

        // Request real-time count update from backend

        if (socket && socket.connected) {

          socket.emit("get_thread_unread_count", { threadId });

          socket.emit("get_total_unread_count");

        }

      }

    }



    // ✅ Always update left-side thread list (handle both existing and new threads)

    setChatList((prev) => {

      // Check if thread already exists
      const existingThreadIndex = prev.findIndex((c) => String(c.id) === String(threadId));

      // Format message content for display
      let displayMsg = newMsg.content;

      if (newMsg.message_type === "image") {
        // For image messages, show content with image icon
        if (newMsg.content && newMsg.content !== "File shared") {
          displayMsg = `${newMsg.content} 📷`;
        } else {
          displayMsg = "📷 Image";
        }
      } else if (newMsg.message_type === "system" || newMsg.message_type === "file") {
        // For file messages, show content with document icon
        if (newMsg.content && newMsg.content !== "File shared") {
          displayMsg = `${newMsg.content} 📄`;
        } else {
          displayMsg = "📄 Document";
        }
      }

      let updated;

      if (existingThreadIndex !== -1) {
        // Thread exists - update it
        updated = prev.map((c) => {
          if (String(c.id) === String(threadId)) {
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
      } else {
        // Thread doesn't exist - create new thread entry
        // Use sender information from message or data
        const sender = newMsg.sender || data.sender || {};
        const otherUserId = isOwnMessage 
          ? (data.receiverId || data.receiver_id || newMsg.receiver_id)
          : (newMsg.sender_id || sender.id);
        const otherUserName = sender.name || sender.first_name 
          ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim()
          : (data.other_user_name || data.sender_name || "Unknown User");
        const otherUserAvatar = sender.avatar || sender.profile_image || data.other_user_avatar || "";
        const otherUserRole = sender.role || data.other_user_role || data.receiver_role || "unknown";
        const otherUserEmail = sender.email || data.other_user_email || data.sender_email || "";

        const newThread = {
          id: threadId,
          name: otherUserName,
          msg: displayMsg,
          time: formatThreadTime(newMsg.created_at),
          icon: otherUserAvatar,
          other_user_id: otherUserId,
          other_user_role: otherUserRole,
          other_user_email: otherUserEmail,
          created_at: newMsg.created_at,
          last_message_at: newMsg.created_at,
          other_user_is_online: false, // Will be updated when we get status
          other_user_last_seen_at: null,
          message_type: newMsg.message_type,
          file_url: newMsg.file_url,
        };

        // Add new thread to the list
        updated = [...prev, newThread];

        // If we don't have complete sender info, fetch thread details from API
        if (!sender.name && !sender.first_name && !data.other_user_name) {
          // Fetch thread details to get complete information
          fetch(`${url}messages/threads/${threadId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((threadData) => {
              if (!threadData.error && threadData.data) {
                const thread = threadData.data;
                setChatList((currentList) => {
                  const threadIndex = currentList.findIndex((c) => String(c.id) === String(threadId));
                  if (threadIndex !== -1) {
                    const updatedList = [...currentList];
                    updatedList[threadIndex] = {
                      ...updatedList[threadIndex],
                      name: thread.other_user_name || updatedList[threadIndex].name,
                      icon: thread.other_user_avatar || updatedList[threadIndex].icon,
                      other_user_id: thread.other_user_id || updatedList[threadIndex].other_user_id,
                      other_user_role: thread.other_user_role || updatedList[threadIndex].other_user_role,
                      other_user_email: thread.other_user_email || thread.email || updatedList[threadIndex].other_user_email || "",
                      other_user_is_online: thread.other_user_is_online || false,
                      other_user_last_seen_at: thread.other_user_last_seen_at || null,
                    };
                    return updatedList;
                  }
                  return currentList;
                });
              }
            })
            .catch((err) => {
              console.error("❌ Error fetching thread details:", err);
            });
        }
      }

      // Sort threads in descending order (newest first) after update
      const sorted = updated.sort((a, b) => {
        const aTime = new Date(a.last_message_at || a.created_at);
        const bTime = new Date(b.last_message_at || b.created_at);
        return bTime - aTime; // Descending order
      });

      return sorted;
    });

  };

  // ✅ Initialize socket only once

  useEffect(() => {

    if (!token) {

      return;

    }



    const newSocket = io(socketurl, {

      auth: {
        token: token
      },
      transports: ["websocket", "polling"],

      autoConnect: true,

      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,

      timeout: 20000,

      forceNew: true

    });



    // Listen for incoming messages
    newSocket.on("receive_message", (data) => handleIncoming(data, "receive_message"));
    newSocket.on("new_message", (data) => handleIncoming(data, "new_message"));
    newSocket.on("message_sent", (data) => handleIncoming(data, "message_sent"));
    newSocket.on("new_image_message", (data) => handleIncoming(data, "new_image_message"));
    newSocket.on("image_sent", (data) => handleIncoming(data, "image_sent"));



    // Message delivery status events

    newSocket.on("message_delivery_status", (data) => {

      console.log("📨 Message delivery status update:", data);

      setMessageDeliveryStatus(prev => ({

        ...prev,

        [data.messageId]: {

          status: data.status,

          timestamp: data.timestamp

        }

      }));

      

      // Update message in the messages array if it exists - works for both super admin and account executive

      setMessages(prev => prev.map(msg => 

        msg.id === data.messageId 

          ? { 

              ...msg, 

              delivery_status: data.status, 

              delivered_at: data.status === 'delivered' ? data.timestamp : msg.delivered_at,

              read_at: data.status === 'read' ? data.timestamp : msg.read_at

            }

          : msg

      ));

    });



    // User status change events

    newSocket.on("user_status_change", (data) => {

      console.log("👤 User status change:", data);

      if (data.status === "online") {

        setOnlineUsers(prev => new Set([...prev, data.userId]));

      } else {

        setOnlineUsers(prev => {

          const newSet = new Set(prev);

          newSet.delete(data.userId);

          return newSet;

        });

        setUserLastSeen(prev => ({

          ...prev,

          [data.userId]: data.timestamp

        }));

      }

    });



    // Pure socket-based real-time count events
    newSocket.on("total_unread_count_updated", (data) => {
      console.log("🔢 Total unread count updated:", data);
      const threadCounts = {};
      if (data.threadCounts) {
        data.threadCounts.forEach(thread => {
          threadCounts[String(thread.threadId)] = thread.unreadCount || 0;
        });
      }
      const roleBased = calculateRoleBasedCounts(chatListRef.current, threadCounts);
      dispatch(setUnreadCounts({
        total: data.totalUnread || 0,
        threads: threadCounts,
        roleBased
      }));
    });

    newSocket.on("unread_count_updated", (data) => {
      console.log("🔢 Thread unread count updated:", data);
      if (data.threadId) {
        const updatedThreads = {
          ...unreadCountsRef.current.threads,
          [String(data.threadId)]: data.unreadCount || 0
        };
        const roleBased = calculateRoleBasedCounts(chatListRef.current, updatedThreads);
        dispatch(setUnreadCounts({
          threads: updatedThreads,
          roleBased
        }));
      }
    });

    // newSocket.on("super_admin_total_unread_count_updated", (data) => {

    //   console.log("🔢 Total unread count updated:", data);

    //   setUnreadCounts(prev => ({

    //     ...prev,

    //     total: data.totalUnread || 0

    //   }));

    // });



    // newSocket.on("super_admin_thread_unread_count", (data) => {

    //   console.log("🔢 Thread unread count:", data);

    //   setUnreadCounts(prev => ({

    //     ...prev,

    //     threads: {

    //       ...prev.threads,

    //       [String(data.threadId)]: data.unreadCount || 0

    //     }

    //   }));

    // });



    // newSocket.on("super_admin_detailed_unread_counts", (data) => {

    //   console.log("🔢 Detailed unread counts:", data);

    //   const threadCounts = {};

    //   if (data.threadCounts) {

    //     data.threadCounts.forEach(thread => {

    //       threadCounts[String(thread.threadId)] = thread.unreadCount || 0;

    //     });

    //   }

    //   setUnreadCounts(prev => ({

    //     ...prev,

    //     total: data.totalUnread || 0,

    //     threads: threadCounts

    //   }));

    // });



    // newSocket.on("super_admin_unread_count_by_role", (data) => {

    //   console.log("🔢 Unread count by role:", data);

    //   const roleBased = {};

    //   if (data.roleBreakdown) {

    //     data.roleBreakdown.forEach(roleData => {

    //       roleBased[roleData.role] = roleData.unreadCount || 0;

    //     });

    //   }

    //   setUnreadCounts(prev => ({

    //     ...prev,

    //     roleBased: roleBased

    //   }));

    // });



    newSocket.on("messages_read", (data) => {

      console.log("✅ All messages marked as read in real-time:", data);

      // Clear unread count for the thread

      if (data.threadId) {

        const updatedThreads = {
          ...unreadCountsRef.current.threads,
            [String(data.threadId)]: 0

        };
        const roleBased = calculateRoleBasedCounts(chatListRef.current, updatedThreads);
        dispatch(setUnreadCounts({
          threads: updatedThreads,
          roleBased
        }));

      }

      

      // Update message status to read for all messages in the thread - works for both super admin and account executive

      if (data.messageIds && Array.isArray(data.messageIds)) {

        data.messageIds.forEach(messageId => {

          setMessageDeliveryStatus(prev => ({

            ...prev,

            [messageId]: {

              status: 'read',

              timestamp: data.timestamp || new Date().toISOString()

            }

          }));

        });

      }

      

      // Update messages array to reflect read status - works for both super admin and account executive

      // Updates messages based on messageIds if provided, or by threadId

      setMessages(prev => {

        return prev.map(msg => {

          // Check if this message should be updated based on messageIds

          const isInMessageIds = data.messageIds && Array.isArray(data.messageIds) && data.messageIds.includes(msg.id);

          

          // Check if message is in the specified thread

          const isInThread = data.threadId && (

            msg.thread_id === data.threadId || 

            msg.threadId === data.threadId ||

            String(msg.thread_id) === String(data.threadId) ||

            String(msg.threadId) === String(data.threadId)

          );

          

          // Update if message is in the list of messageIds, or if threadId matches and no specific messageIds provided

          if (isInMessageIds || (isInThread && !data.messageIds)) {

            return {

              ...msg,

              read_at: data.timestamp || msg.read_at || new Date().toISOString(),

              delivery_status: 'read',

              delivered_at: msg.delivered_at || data.timestamp || new Date().toISOString()

            };

          }

          return msg;

        });

      });

    });



    // Real-time individual message read status - works for both super admin and account executive

    newSocket.on("message_read_receipt", (data) => {

      console.log("✅ Message marked as read in real-time:", data);

      

      // Update message delivery status

      setMessageDeliveryStatus(prev => ({

        ...prev,

        [data.messageId]: {

          status: 'read',

          timestamp: data.timestamp || new Date().toISOString()

        }

      }));

      

      // Update messages array - ensure read status is visible for account executive when super admin reads their messages

      setMessages(prev => prev.map(msg => 

        msg.id === data.messageId

          ? { 

              ...msg, 

              read_at: data.timestamp || msg.read_at || new Date().toISOString(), 

              delivery_status: 'read',

              delivered_at: msg.delivered_at || data.timestamp || new Date().toISOString()

            }

          : msg

      ));

    });



    // Authentication events
    newSocket.on("authenticated", (data) => {
      console.log("✅ Socket authenticated:", data);
      // Join user room after authentication
      if (data.user?.id) {
        newSocket.emit("join_user_room", data.user.id);
      }
      // Update online status
      newSocket.emit("update_online_status", {
        isOnline: true
      });
      // Fetch real-time counts immediately after connection
      setTimeout(() => {
        fetchRealTimeCounts();
      }, 500);
    });

    newSocket.on("auth_error", (error) => {
      console.error("❌ Socket authentication failed:", error);
    });

    newSocket.on("room_joined", (data) => {
      console.log("✅ Joined room:", data);
    });

    newSocket.on("connect", () => {

      console.log("✅ Socket connected:", newSocket.id);

      // Authenticate after connection
      newSocket.emit("authenticate", { token: token });

    });



    newSocket.on("disconnect", (reason) => {

      console.log("❌ Socket disconnected:", reason);

      // Update offline status

      if (socket && socket.connected) {

        socket.emit("update_online_status", {

          isOnline: false

        });

      }

    });



    newSocket.on("connect_error", (error) => {

      console.error("❌ Socket connection error:", error);

    });



    setSocket(newSocket);



    return () => newSocket.disconnect();

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [token]);



  // Note: Unread counts are now managed by socket events from the backend

  // No need for manual calculation or forced clearing



  // ✅ Join user room on connection (already handled in authenticated event)
  // Note: Backend uses user rooms (user_{userId}) instead of thread rooms



  // Refetch messages when window becomes visible to ensure account executive sees latest status

  // This ensures that when account executive returns to the window, they see if super admin has read their messages

  useEffect(() => {

    const handleVisibilityChange = () => {

      if (!document.hidden && selectedChat?.id && socket?.connected) {

        console.log("👁️ Window visible, refetching messages for latest status");

        fetchMessages(selectedChat.id);

      }

    };



    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {

      document.removeEventListener("visibilitychange", handleVisibilityChange);

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [selectedChat?.id, socket]);



  // Helper function to process thread data
  const processThreadData = (thread) => {
    // Format name properly
    const formatThreadName = (thread) => {
      if (thread.other_user_name && thread.other_user_name.trim()) {
        const cleanedName = thread.other_user_name.trim();
        if (cleanedName === "Account Executive" || cleanedName === "Company Admin" || cleanedName === "Worker") {
          if (thread.first_name || thread.last_name) {
            const constructedName = `${thread.first_name || ''} ${thread.last_name || ''}`.trim();
            if (constructedName) return constructedName;
          }
          if (thread.full_name && thread.full_name.trim()) {
            return thread.full_name.trim();
          }
        }
        return cleanedName;
      }
      
      if (thread.other_user_role === "account_executive") {
        if (thread.first_name || thread.last_name) {
          const constructedName = `${thread.first_name || ''} ${thread.last_name || ''}`.trim();
          if (constructedName) return constructedName;
        }
      }
      
      if (thread.other_user_role === "company_admin") {
        if (thread.full_name && thread.full_name.trim()) {
          return thread.full_name.trim();
        }
        if (thread.first_name || thread.last_name) {
          const constructedName = `${thread.first_name || ''} ${thread.last_name || ''}`.trim();
          if (constructedName) return constructedName;
        }
      }
      
      if (thread.other_user_role === "worker") {
        if (thread.first_name || thread.last_name) {
          const nameParts = [
            thread.first_name || '',
            thread.middle_name || '',
            thread.last_name || ''
          ].filter(Boolean);
          const constructedName = nameParts.join(' ').trim();
          if (constructedName) return constructedName;
        }
      }
      
      return thread.other_user_role === "account_executive" ? "Account Executive" :
             thread.other_user_role === "company_admin" ? "Company Admin" :
             thread.other_user_role === "worker" ? "Worker" : "User";
    };

    const timeToShow = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const messageToShow = thread.last_message_content || t("new_conversation_started");

    if (thread.other_user_is_online) {
      setOnlineUsers(prev => new Set([...prev, thread.other_user_id]));
    }
    
    if (thread.other_user_last_seen_at) {
      setUserLastSeen(prev => ({
        ...prev,
        [thread.other_user_id]: thread.other_user_last_seen_at
      }));
    }

    return {
      id: thread.id,
      name: formatThreadName(thread),
      msg: messageToShow,
      time: timeToShow,
      icon: thread.other_user_avatar || "",
      other_user_id: thread.other_user_id,
      other_user_role: thread.other_user_role,
      other_user_email: thread.other_user_email || thread.email || "",
      created_at: thread.created_at,
      last_message_at: thread.last_message_at,
      other_user_is_online: thread.other_user_is_online,
      other_user_last_seen_at: thread.other_user_last_seen_at,
    };
  };

  // Fetch threads - Initial load (resets pagination)
  const fetchThreads = async () => {
    setIsLoadingThreads(true);
    setThreadsPage(1);
    setTotalThreads(0);
    setHasMoreThreads(false);

    try {
      const endpoint = `${url}messages/threads?page=1&limit=${THREADS_PER_PAGE}`;
      
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("📥 Fetched threads from API:", data);

      if (!data.error && Array.isArray(data.data?.threads)) {
        const threads = data.data.threads.map(processThreadData);
        
        // Get pagination info from API response
        const pagination = data.data.pagination;
        const total = pagination?.total_count || data.data.total || data.data.totalCount || 0;
        setTotalThreads(total);
        
        // Use has_next_page if available, otherwise calculate from total
        const hasMore = pagination?.has_next_page !== undefined 
          ? pagination.has_next_page 
          : (total > 0 ? threads.length < total : threads.length >= THREADS_PER_PAGE);
        
        setHasMoreThreads(hasMore);
        console.log("📊 Threads loaded:", threads.length, "| Total:", total, "| Has more:", hasMore, "| has_next_page:", pagination?.has_next_page);



        // Sort threads in descending order (newest first)

        const sortedThreads = threads.sort((a, b) => {

          const aTime = new Date(a.last_message_at || a.created_at);

          const bTime = new Date(b.last_message_at || b.created_at);

          return bTime - aTime; // Descending order

        });



        // Add delay to prevent server time flash

        setTimeout(() => {

          setChatList(sortedThreads);

          setShowThreads(true);

          
          // Update role-based counts after setting chatList (using ref to get latest)
          const currentThreads = unreadCountsRef.current.threads;
          const roleBased = calculateRoleBasedCounts(sortedThreads, currentThreads);
          dispatch(setUnreadCounts({
            roleBased
          }));
          

          // Request counts via websocket for all threads (websocket-only for counts)

          if (socket && socket.connected) {

            fetchRealTimeCounts();

          }

        }, 100); // 100ms delay

      }

    } catch (err) {

      console.error("❌ Error fetching threads:", err);

    } finally {

      setIsLoadingThreads(false);

    }

  };

  // Load more threads (pagination)
  const loadMoreThreads = async () => {
    if (isLoadingMoreThreads || !hasMoreThreads) return;

    setIsLoadingMoreThreads(true);
    const nextPage = threadsPage + 1;

    console.log("📤 Loading more threads - Page:", nextPage, "| Total:", totalThreads);

    try {
      const endpoint = `${url}messages/threads?page=${nextPage}&limit=${THREADS_PER_PAGE}`;
      
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("📥 Load more threads - Page:", nextPage, "Response:", data);

      if (!data.error && Array.isArray(data.data?.threads)) {
        const newThreads = data.data.threads.map(processThreadData);
        
        // Get pagination info from API response
        const pagination = data.data.pagination;
        const apiTotal = pagination?.total_count || data.data.total || data.data.totalCount || 0;
        if (apiTotal > 0) {
          setTotalThreads(apiTotal);
        }
        
        if (newThreads.length > 0) {
          // Filter out duplicates
          const existingIds = new Set(chatList.map(t => t.id));
          const uniqueNewThreads = newThreads.filter(t => !existingIds.has(t.id));
          
          if (uniqueNewThreads.length > 0) {
            setChatList(prev => [...prev, ...uniqueNewThreads]);
            setThreadsPage(nextPage);
          }
          
          // Calculate new total loaded
          const newTotalLoaded = chatList.length + uniqueNewThreads.length;
          const currentTotal = apiTotal || totalThreads;
          
          // Use has_next_page if available, otherwise calculate from total
          const hasMore = pagination?.has_next_page !== undefined 
            ? pagination.has_next_page 
            : (currentTotal > 0 ? newTotalLoaded < currentTotal : newThreads.length >= THREADS_PER_PAGE);
          
          setHasMoreThreads(hasMore);
          console.log("📊 Threads loaded:", newTotalLoaded, "| Total:", currentTotal, "| Has more:", hasMore, "| has_next_page:", pagination?.has_next_page);
        } else {
          setHasMoreThreads(false);
        }
      } else {
        setHasMoreThreads(false);
      }
    } catch (err) {
      console.error("❌ Error loading more threads:", err);
    } finally {
      setIsLoadingMoreThreads(false);
    }
  };

  const fetchDetailedUnreadCounts = async () => {

    try {

      const endpoint = `${url}messages/unread-counts/detailed`;
      
      const res = await fetch(endpoint, {

        method: "GET",

        headers: { Authorization: `Bearer ${token}` },

      });

      const data = await res.json();

      

      if (!data.error && data.data) {

        // Update local unread counts

        const threadCounts = {};

        if (data.data.threadCounts) {

          data.data.threadCounts.forEach(thread => {

            threadCounts[String(thread.threadId)] = thread.unreadCount || 0;

          });

        }

        

        const roleBased = calculateRoleBasedCounts(chatListRef.current, threadCounts);
        dispatch(setUnreadCounts({
          total: data.data.totalUnread || 0,

          threads: threadCounts,
          roleBased
        }));

      }

    } catch (err) {

      console.error("❌ Error fetching detailed unread counts:", err);

    }

  };



  useEffect(() => {

    if (token) {

      fetchThreads();

      fetchDetailedUnreadCounts();



      // Fetch real-time counts via websocket only (not from API)

      // Counts will be updated when socket connects via socket events

      if (socket && socket.connected) {

        fetchRealTimeCounts();

      }

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [token]);



  // Clear all counts when component unmounts or user logs out

  // useEffect(() => {

  //   return () => {

  //     if (!token) {

  //       dispatch(clearAllCounts());

  //     }

  //   };

  // }, [token, dispatch]);



  // Removed messagesEndRef - no longer needed without scroll



  // Image upload function

  const uploadImage = async (file) => {

    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(`${url}upload/image`, {

      method: "POST",

      headers: { Authorization: `Bearer ${token}` },

      body: formData,

    });

    

    const result = await response.json();

    

    if (!result.error && result.data?.url) {

      return result.data.url;

    } else {

      throw new Error(result.message || "Image upload failed");

    }

  };



  // File upload function for PDF/Word documents

  const uploadFile = async (file) => {

    console.log("📤 Starting file upload:", { fileName: file.name, fileSize: file.size, fileType: file.type });

    

    const formData = new FormData();

    formData.append("pdf", file);

    

    console.log("📤 Uploading to:", `${url}upload/pdf`);

    

    const response = await fetch(`${url}upload/pdf`, {

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

      throw new Error(result.message || "File upload failed");

    }

  };


  // Audio upload function
  const uploadAudio = async (audioBlob) => {
    console.log("🎤 Starting audio upload:", { size: audioBlob.size, type: audioBlob.type });
    
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");
    
    console.log("🎤 Uploading to:", `${url}upload/audio`);
    
    const response = await fetch(`${url}upload/audio`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    
    console.log("🎤 Upload response status:", response.status);
    
    const result = await response.json();
    console.log("🎤 Upload response data:", result);
    
    if (!result.error && result.data?.url) {
      // Response structure: { error: false, data: { url: "...", ... } }
      console.log("✅ Audio upload successful, URL:", result.data.url);
      return result.data.url;
    } else if (!result.error && result.url) {
      // Alternative response structure: { error: false, url: "..." }
      console.log("✅ Audio upload successful (alternative URL format), URL:", result.url);
      return result.url;
    } else {
      console.error("❌ Audio upload failed:", result);
      throw new Error(result.message || "Audio upload failed");
    }
  };


  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        
        // Auto-upload audio
        setIsUploadingAudio(true);
        try {
          const audioFileUrl = await uploadAudio(audioBlob);
          setUploadedAudioUrl(audioFileUrl);
          console.log("✅ Audio uploaded:", audioFileUrl);
        } catch (error) {
          console.error("❌ Audio upload failed:", error);
          alert(t("Audio upload failed. Please try again."));
        } finally {
          setIsUploadingAudio(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("❌ Error starting recording:", error);
      alert(t("Microphone access denied. Please allow microphone access and try again."));
    }
  };


  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };


  // Cancel audio recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    
    setIsRecording(false);
    setRecordingDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setUploadedAudioUrl(null);
    audioChunksRef.current = [];
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };


  // Format recording duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };


  // Handle audio playback
  const toggleAudioPlayback = async (messageId, audioUrl) => {
    if (!audioUrl || audioUrl.trim() === '') {
      console.error("❌ Invalid audio URL:", audioUrl);
      alert(t("Audio URL is invalid. Cannot play audio."));
      return;
    }

    const audioElement = audioRefs.current[messageId];
    
    if (!audioElement) {
      try {
        console.log("🎵 Loading audio:", audioUrl);
        
        // Fetch audio with authentication to handle CORS
        const response = await fetch(audioUrl, {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'audio/webm, audio/*'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        
        // Verify it's an audio blob
        if (!blob.type.includes('audio')) {
          console.warn("⚠️ File might not be audio, MIME type:", blob.type);
        }
        
        const blobUrl = URL.createObjectURL(blob);
        console.log("🎵 Created blob URL:", blobUrl);
        
        // Store blob URL for cleanup
        audioBlobUrlsRef.current[messageId] = blobUrl;
        
        // Create new audio element with blob URL
        const audio = new Audio(blobUrl);
        audioRefs.current[messageId] = audio;
        
        // Duration (when available)
        audio.onloadedmetadata = () => {
          const duration = isFinite(audio.duration) ? Math.floor(audio.duration) : 0;
          setAudioProgressById(prev => ({
            ...prev,
            [messageId]: { current: 0, duration }
          }));
        };
        
        // Progress updates
        audio.ontimeupdate = () => {
          setAudioProgressById(prev => ({
            ...prev,
            [messageId]: {
              current: Math.floor(audio.currentTime || 0),
              duration: Math.floor(audio.duration || prev[messageId]?.duration || 0)
            }
          }));
        };
        
        audio.onended = () => {
          setPlayingAudioId(null);
          // Cleanup blob URL when done
          if (audioBlobUrlsRef.current[messageId]) {
            URL.revokeObjectURL(audioBlobUrlsRef.current[messageId]);
            delete audioBlobUrlsRef.current[messageId];
          }
          audioRefs.current[messageId] = null;
          setAudioProgressById(prev => ({ ...prev, [messageId]: { current: 0, duration: prev[messageId]?.duration || 0 } }));
        };
        
        audio.onerror = (e) => {
          setPlayingAudioId(null);
          console.error("❌ Error playing audio:", e);
          console.error("❌ Audio error details:", {
            error: audio.error,
            code: audio.error?.code,
            message: audio.error?.message
          });
          alert(t("Error playing audio. The audio file may be corrupted or unsupported."));
          // Cleanup blob URL on error
          if (audioBlobUrlsRef.current[messageId]) {
            URL.revokeObjectURL(audioBlobUrlsRef.current[messageId]);
            delete audioBlobUrlsRef.current[messageId];
          }
          audioRefs.current[messageId] = null;
        };

        audio.onloadeddata = () => {
          console.log("✅ Audio loaded successfully");
        };

        audio.oncanplay = () => {
          console.log("✅ Audio can play");
        };

        // Try to play
        try {
          await audio.play();
          setPlayingAudioId(messageId);
          console.log("✅ Audio playback started");
        } catch (playError) {
          console.error("❌ Error starting playback:", playError);
          alert(t("Failed to play audio. Please try again."));
          // Cleanup blob URL on play error
          if (audioBlobUrlsRef.current[messageId]) {
            URL.revokeObjectURL(audioBlobUrlsRef.current[messageId]);
            delete audioBlobUrlsRef.current[messageId];
          }
          audioRefs.current[messageId] = null;
        }
      } catch (fetchError) {
        console.error("❌ Error fetching audio:", fetchError);
        alert(t("Failed to load audio file. Please check the URL or try again."));
      }
    } else {
      if (playingAudioId === messageId) {
        // Pause
        audioElement.pause();
        setPlayingAudioId(null);
      } else {
        // Play - stop other audio first
        if (playingAudioId) {
          audioRefs.current[playingAudioId]?.pause();
        }
        audioElement.currentTime = 0;
        try {
          await audioElement.play();
          setPlayingAudioId(messageId);
        } catch (playError) {
          console.error("❌ Error resuming playback:", playError);
        }
      }
    }
  };


  // Clear uploaded audio
  const clearUploadedAudio = () => {
    setUploadedAudioUrl(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };


  // Cleanup audio refs on unmount
  useEffect(() => {
    return () => {
      // Cleanup all audio elements and blob URLs
      Object.keys(audioRefs.current).forEach((messageId) => {
        const audio = audioRefs.current[messageId];
        if (audio) {
          audio.pause();
          audio.src = "";
        }
        // Cleanup blob URL
        if (audioBlobUrlsRef.current[messageId]) {
          URL.revokeObjectURL(audioBlobUrlsRef.current[messageId]);
          delete audioBlobUrlsRef.current[messageId];
        }
      });
      // Cleanup recording audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);



  // Handle file selection (both images and documents)

  const handleFileSelect = async (event) => {

    const file = event.target.files[0];

    if (file) {

      const isImage = file.type.startsWith('image/');

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

      if (!isImage && !isDocument) {

        alert(t("Please select an image, PDF, or Word document"));

        return;

      }

      

      // Validate file size

      const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for documents

      if (file.size > maxSize) {

        alert(t(isImage ? "Image size should be less than 5MB" : "File size should be less than 10MB"));

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

          alert(t("Image upload failed. Please try again."));

          setImagePreview(null);

          setSelectedImageFile(null);

        } finally {

          setIsUploadingImage(false);

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

          alert(t("File upload failed. Please try again."));

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

      link.download = fileName || 'document';

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error('Error downloading file:', error);

      alert(t('Download failed. Please try again.'));

    }

  };



  // Helper function to get read receipt timestamp

  const getReadReceiptTime = (messageId) => {

    const deliveryStatus = messageDeliveryStatus[messageId];

    if (deliveryStatus && deliveryStatus.status === 'read' && deliveryStatus.timestamp) {

      return formatThreadTime(deliveryStatus.timestamp);

    }

    return null;

  };



  // Helper function to get message status icon

  const getMessageStatusIcon = (status, isMine) => {

    if (!isMine) return null;

    

    // Adapt icon colors to bubble background
    const palette = isMine
      ? { base: 'rgba(255,255,255,0.75)', strong: '#FFFFFF', read: '#7CF3D3' }
      : { base: '#666666', strong: '#4B5563', read: '#16A34A' };

    switch(status) {

      case 'sent': 

        return <CheckCircle sx={{ fontSize: 14, color: palette.base }} />;

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

        return <CheckCircle sx={{ fontSize: 14, color: palette.base }} />;

    }

  };



  // Helper function to format last seen time

  const formatLastSeen = (lastSeenAt) => {

    if (!lastSeenAt) return t("never");

    

    const now = new Date();

    const lastSeen = new Date(lastSeenAt);

    const diffMs = now - lastSeen;

    const diffMins = Math.floor(diffMs / 60000);

    const diffHours = Math.floor(diffMs / 3600000);

    const diffDays = Math.floor(diffMs / 86400000);

    

    if (diffMins < 1) return t("just_now");

    if (diffMins < 60) return `${diffMins}m ${t("ago")}`;

    if (diffHours < 24) return `${diffHours}h ${t("ago")}`;

    if (diffDays < 7) return `${diffDays}d ${t("ago")}`;

    

    return lastSeen.toLocaleDateString();

  };



  // Helper function to get online status indicator

  const getOnlineStatusIndicator = (userId) => {

    const isOnline = onlineUsers.has(userId);

    const lastSeen = userLastSeen[userId];

    

    if (isOnline) {

      return { 

        text: t("online"), 

        color: '#4CAF50',

        icon: <FiberManualRecord sx={{ fontSize: 8, color: '#4CAF50' }} />

      };

    } else {

      return { 

        text: t("Offline"), 

        color: '#666',

        icon: null

      };

    }

  };


  // Helper function to calculate role-based counts from thread counts
  const calculateRoleBasedCounts = (threads, threadCounts) => {
    const roleBased = {};
    
    // Group threads by role and sum their unread counts
    threads.forEach(thread => {
      const role = thread.other_user_role || 'unknown';
      const threadId = String(thread.id);
      const count = threadCounts[threadId] || 0;
      
      if (!roleBased[role]) {
        roleBased[role] = 0;
      }
      roleBased[role] += count;
    });
    
    return roleBased;
  };

  // Recalculate role-based counts when chatList changes
  useEffect(() => {
    if (chatList.length > 0 && Object.keys(unreadCounts.threads).length >= 0) {
      const roleBased = calculateRoleBasedCounts(chatList, unreadCounts.threads);
      dispatch(setUnreadCounts({
        roleBased
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatList]); // Only depend on chatList, not threads to avoid loops


  // Helper function to format unread count display

  const formatUnreadCount = (count) => {

    if (count <= 0) return "";

    if (count > 99) return "99+";

    return count.toString();

  };



  // Helper function to get unread count badge

  const getUnreadCountBadge = (count) => {

    const displayCount = formatUnreadCount(count);

    if (!displayCount) return null;

    

    return (

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

        {displayCount}

      </Box>

    );

  };



  // Function to format time with proper timezone conversion

  const formatThreadTime = (dbTimestamp) => {

    try {

      // Parse the UTC timestamp

      const messageDate = new Date(dbTimestamp);

      

      if (isNaN(messageDate.getTime())) {

        console.warn("Invalid timestamp:", dbTimestamp);

        return t("invalid_time");

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

      

      return formatted;

    } catch (error) {

      console.warn("Error formatting time:", error, "for input:", dbTimestamp);

      return t("error");

    }

  };









  // Messages pagination - 15 messages per page
  const MESSAGES_PER_PAGE = 15;

  // State for marking all messages as read
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Mark all messages as read (API + Socket)
  const markAllMessagesAsRead = async () => {
    if (isMarkingAllRead) return;
    
    setIsMarkingAllRead(true);
    console.log("📬 Marking all messages as read...");

    try {
      // 1. Call REST API
      const res = await fetch(`${url}super-admin-chat/messages/mark-all-read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("📬 Mark all read API response:", data);

      if (!data.error) {
        // 2. Emit socket event for real-time sync
        if (socket && socket.connected) {
          socket.emit("mark_all_super_admin_messages_read");
          console.log("📬 Socket event emitted: mark_all_super_admin_messages_read");
        }

        // 3. Update local state - reset all unread counts
        dispatch(setUnreadCounts({
          total: 0,
          threads: {},
          roleBased: {
            account_executive: 0,
            company_admin: 0,
            worker: 0,
          }
        }));

        // 4. Update chatList to clear unread indicators
        setChatList(prev => prev.map(chat => ({
          ...chat,
          unread_count: 0,
        })));

        console.log("✅ All messages marked as read successfully");
      } else {
        console.error("❌ Failed to mark all messages as read:", data.message);
      }
    } catch (err) {
      console.error("❌ Error marking all messages as read:", err);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Fetch messages (initial load - resets pagination)
  const fetchMessages = async (threadId) => {
    setIsLoadingMessages(true);
    setCurrentPage(1);
    setTotalMessages(0);
    setHasMoreMessages(false);

    try {
      const res = await fetch(
        `${url}messages/threads/${threadId}/messages?page=1&limit=${MESSAGES_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      console.log("📥 API Response:", data);

      if (!data.error && data.data?.messages) {
        const messagesWithStatus = data.data.messages.map(msg => ({
          ...msg,
          delivery_status: msg.delivery_status || 'sent'
        }));

        setMessages(messagesWithStatus);

        // Get pagination info from API response
        const pagination = data.data.pagination;
        const total = pagination?.total_count || data.data.total || data.data.totalCount || 0;
        setTotalMessages(total);

        // Use has_next_page if available, otherwise calculate from total
        const hasMore = pagination?.has_next_page !== undefined 
          ? pagination.has_next_page 
          : (total > 0 ? messagesWithStatus.length < total : messagesWithStatus.length >= MESSAGES_PER_PAGE);
        
        setHasMoreMessages(hasMore);
        
        console.log("📊 Messages loaded:", messagesWithStatus.length, "| Total:", total, "| Has more:", hasMore, "| has_next_page:", pagination?.has_next_page);

        // Update message delivery status state
        messagesWithStatus.forEach(msg => {
          if (msg.delivery_status) {
            setMessageDeliveryStatus(prev => ({
              ...prev,
              [msg.id]: {
                status: msg.delivery_status,
                timestamp: msg.delivered_at || msg.read_at || msg.created_at
              }
            }));
          }
        });
      }
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Load more messages (older messages - using page-based pagination)
  const loadMoreMessages = async () => {
    if (!selectedChat?.id || isLoadingMoreMessages || !hasMoreMessages) return;

    // Set flag to prevent auto-scroll when older messages are loaded
    isLoadingOlderRef.current = true;
    setIsLoadingMoreMessages(true);
    
    // Use page-based pagination (next page)
    const nextPage = currentPage + 1;
    
    console.log("📤 Requesting older messages - page:", nextPage, "limit:", MESSAGES_PER_PAGE, "total:", totalMessages);

    try {
      const res = await fetch(
        `${url}messages/threads/${selectedChat.id}/messages?page=${nextPage}&limit=${MESSAGES_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      console.log("📥 Load More Response:", data);

      if (!data.error && data.data?.messages) {
        const newMessagesWithStatus = data.data.messages.map(msg => ({
          ...msg,
          delivery_status: msg.delivery_status || 'sent'
        }));

        // Get pagination info from API response
        const pagination = data.data.pagination;
        const apiTotal = pagination?.total_count || data.data.total || data.data.totalCount || 0;
        if (apiTotal > 0) {
          setTotalMessages(apiTotal);
        }

        console.log("📥 Loaded:", newMessagesWithStatus.length, "messages | Pagination:", pagination);

        if (newMessagesWithStatus.length > 0) {
          // Filter out any duplicates (messages we already have)
          const existingIds = new Set(messages.map(m => m.id));
          const uniqueNewMessages = newMessagesWithStatus.filter(msg => !existingIds.has(msg.id));
          
          console.log("📊 Unique new messages:", uniqueNewMessages.length, "out of", newMessagesWithStatus.length);

          if (uniqueNewMessages.length > 0) {
            // Prepend older messages to the beginning of the array
            setMessages(prev => [...uniqueNewMessages, ...prev]);
            
            // Update current page from API response or increment
            const newPage = pagination?.current_page || (currentPage + 1);
            setCurrentPage(newPage);

            // Calculate new total loaded
            const newTotalLoaded = messages.length + uniqueNewMessages.length;
            const currentTotal = apiTotal || totalMessages;
            
            // Use has_next_page if available, otherwise calculate from total
            const hasMore = pagination?.has_next_page !== undefined 
              ? pagination.has_next_page 
              : (currentTotal > 0 ? newTotalLoaded < currentTotal : newMessagesWithStatus.length >= MESSAGES_PER_PAGE);
            
            setHasMoreMessages(hasMore);
            console.log("📊 Total loaded:", newTotalLoaded, "| Total available:", currentTotal, "| Has more:", hasMore, "| has_next_page:", pagination?.has_next_page);

            // Update message delivery status state for new messages
            uniqueNewMessages.forEach(msg => {
              if (msg.delivery_status) {
                setMessageDeliveryStatus(prev => ({
                  ...prev,
                  [msg.id]: {
                    status: msg.delivery_status,
                    timestamp: msg.delivered_at || msg.read_at || msg.created_at
                  }
                }));
              }
            });
          } else {
            // All messages were duplicates - we've reached the beginning
            console.log("📊 All duplicates - reached beginning of conversation");
            setHasMoreMessages(false);
          }
        } else {
          // No messages returned - we've reached the beginning
          console.log("📊 No more messages - reached beginning of conversation");
          setHasMoreMessages(false);
        }
      } else {
        // API error or no data - hide the button
        console.log("📊 API returned no data - hiding load more button");
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error("❌ Error loading more messages:", err);
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };





  // Mark message as delivered

  const markMessageAsDelivered = (messageId, threadId) => {

    if (socket && socket.connected) {

      socket.emit("mark_message_delivered", {

        messageId: messageId,

        threadId: threadId

      });

      

      // Update message delivery status optimistically

      setMessageDeliveryStatus(prev => ({

        ...prev,

        [messageId]: {

          status: 'delivered',

          timestamp: new Date().toISOString()

        }

      }));

    }

  };



  // Mark message as read - Real-time socket call

  const markMessageAsRead = (messageId, threadId) => {



    

    if (socket && socket.connected) {

     

      socket.emit("mark_message_read", {

        messageId: messageId,

        threadId: threadId

      });

      

      // Update message delivery status optimistically

      setMessageDeliveryStatus(prev => ({

        ...prev,

        [messageId]: {

          status: 'read',

          timestamp: new Date().toISOString()

        }

      }));

      

      // Request updated count after marking as read

      setTimeout(() => {

        socket.emit("get_thread_unread_count", { threadId });

        socket.emit("get_total_unread_count");

      }, 50);

    }

  };



  



  // Pure socket-based real-time count fetching

  const fetchRealTimeCounts = () => {

    if (socket && socket.connected) {

      console.log("📡 Fetching real-time counts via socket");

      // Request total unread count

      socket.emit("get_total_unread_count");

      // Request thread unread counts for all threads in chat list

      if (chatListRef.current && chatListRef.current.length > 0) {

        chatListRef.current.forEach(chat => {

          socket.emit("get_thread_unread_count", { threadId: chat.id });

        });

      }

    }

  };



  // Click chat - Real-time read message when message box opens

  const handleChatClick = (chat) => {

    console.log("📱 Opening chat:", chat.id);
    
    // Mark that this chat was explicitly opened by user click
    chatOpenedByUserRef.current = String(chat.id);

    setSelectedChat(chat);

    // Fetch messages to get latest status (including read status updates from other party)

    fetchMessages(chat.id);



    // Real-time read socket call when message box opens

    if (socket && socket.connected) {

      console.log("📡 Marking all messages as read in real-time:", chat.id);

      socket.emit("mark_read", {

        threadId: chat.id

      });

      

      // Request updated unread count after marking as read

      setTimeout(() => {

        socket.emit("get_thread_unread_count", { threadId: chat.id });

        socket.emit("get_total_unread_count");

      }, 100);

    }

    // Note: We do NOT immediately clear the unread count in Redux here.
    // The count will be updated by the server's socket response after messages are actually marked as read.
    // This ensures the count only disappears when messages are truly viewed, not just when the chat is clicked.

  };

  // Send message

  const handleSendMessage = async () => {

    if ((!newMessage.trim() && !uploadedImageUrl && !uploadedFileUrl && !uploadedAudioUrl) || !selectedChat || isSendingMessage) return;

    // Check if selectedChat has a temporary ID (starts with "temp-")
    // If so, wait a bit for the confirmed thread to be set
    if (selectedChat.id && String(selectedChat.id).startsWith('temp-')) {
      console.log("⚠️ Cannot send message: Thread is still being created. Please wait...");
      return;
    }



  

    setIsSendingMessage(true);



    // Manual connection test

    console.log("🔌 Socket status:", { 

      socket: !!socket, 

      connected: socket?.connected, 

      id: socket?.id 

    });

    

    if (socket && !socket.connected) {

      console.log("🔄 Attempting to reconnect socket...");

      socket.connect();

    }



    try {

      let messageContent = newMessage.trim() || "File shared"; // Always send text content

      let messageType = "text"; // Default to text



      // Determine message type based on what's uploaded

      if (uploadedAudioUrl) {

        console.log("🎤 Audio message detected:", { uploadedAudioUrl });

        messageType = "system"; // Audio message type (using system as specified)

        console.log("🎤 Audio message - content:", messageContent, "fileUrl:", uploadedAudioUrl);

      } 

      else if (uploadedFileUrl) {

        console.log("📄 File message detected:", { uploadedFileUrl, selectedFile: selectedFile?.name });

        messageType = "system"; // File message type

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

      

      console.log("messageContent____", messageContent)





      if (socket && socket.connected) {

        const tempId = `temp_${Date.now()}`;

        const messageData = {

          threadId: selectedChat.id,

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



        console.log("📤 Sending socket message:", messageData);

        

        try {

          socket.emit("send_message", messageData);

          

          // Mark message as delivered immediately for own messages

          setTimeout(() => {

            markMessageAsDelivered(tempId, selectedChat.id);

          }, 100);

          

          // Update message delivery status for optimistic update

          setMessageDeliveryStatus(prev => ({

            ...prev,

            [tempId]: {

              status: 'sent',

              timestamp: new Date().toISOString()

            }

          }));



          setNewMessage("");

          clearUploadedImage();

          clearUploadedFile();

          clearUploadedAudio();

          

          // Request real-time count update from backend

          if (socket && socket.connected) {

            socket.emit("get_thread_unread_count", { threadId: selectedChat.id });

            socket.emit("get_total_unread_count");

          }

        } catch (socketError) {

          console.error("❌ Socket emit failed:", socketError);

          // Fallback to HTTP request

          throw new Error("Socket failed, falling back to HTTP");

        }

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



        console.log("📤 Sending HTTP request body:", requestBody);

        console.log("📤 File URL being sent:", uploadedFileUrl);

        console.log("📤 File name being sent:", selectedFile?.name);

        const res = await fetch(

          `${url}messages/threads/${selectedChat.id}/messages`,

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

          setMessages((prev) => {

            const updatedMessages = [...prev, data.data.message];

            return updatedMessages;

          });



          // Update message delivery status

          setMessageDeliveryStatus(prev => ({

            ...prev,

            [data.data.message.id]: {

              status: 'sent',

              timestamp: data.data.message.created_at

            }

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

                    displayMsg = "📷 Image";

                  }

                } else if (data.data.message.message_type === "system" || data.data.message.message_type === "file") {

                  // For file messages, show content with document icon

                  if (data.data.message.content && data.data.message.content !== "File shared") {

                    displayMsg = `${data.data.message.content} 📄`;

                  } else {

                    displayMsg = "📄 Document";

                  }

                }

                

                return {

                  ...c,

                  msg: displayMsg,

                  time: formatThreadTime(data.data.message.created_at),

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

        

        // Request real-time count update from backend

        if (socket && socket.connected) {

          socket.emit("get_thread_unread_count", { threadId: selectedChat.id });

          socket.emit("get_total_unread_count");

        }

      }

    } catch (err) {

      console.error("Error sending message:", err);

    } finally {

      setIsSendingMessage(false);

    }

  };



  // Fetch workers

  // Fetch eligible users by role
  // API: GET /api/messages/eligible-users?role=account_executive|company_admin|worker
  const fetchWorkers = async (role = null) => {

    setIsLoadingWorkers(true);

    setWorkers([]); // Clear previous results

    try {

      // Build API URL with all query parameters
      // According to backend docs: GET /api/messages/eligible-users?search=&page=1&limit=20&role=company_admin

      const params = new URLSearchParams();

      // Add search parameter (empty string for now, can be used for filtering)
      params.append('search', '');

      // Add pagination parameters
      // params.append('page', '1');
      params.append('noPagination', 'true');//noPagination=true

      // Add role parameter if specified
      if (role) {
        params.append('role', role);
      }

      const apiUrl = `${url}messages/eligible-users?${params.toString()}`;

      console.log("📡 Fetching eligible users from:", apiUrl, "with role:", role || "all");
      console.log("📡 Full request details:", {
        url: apiUrl,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ? token.substring(0, 20) + '...' : 'MISSING'}`,
        }
      });







      const res = await fetch(apiUrl, {

        method: "GET",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

        },

      });

      // Get response text first to see error details
      const responseText = await res.text();

      if (!res.ok) {

        let errorMessage = `HTTP error! status: ${res.status}`;

        try {

          const errorData = JSON.parse(responseText);

          errorMessage += ` - ${errorData.message || errorData.error || 'Unknown error'}`;

          console.error("❌ API Error Details:", errorData);

        } catch (e) {

          console.error("❌ API Error Response (non-JSON):", responseText);

          errorMessage += ` - ${responseText.substring(0, 200)}`;

        }

        throw new Error(errorMessage);

      }

      const data = JSON.parse(responseText);

      console.log("✅ Eligible users API response:", data);
      console.log("✅ Response structure check:", {
        hasError: data.error,
        hasData: !!data.data,
        hasUsers: !!data.data?.users,
        usersIsArray: Array.isArray(data.data?.users),
        usersLength: data.data?.users?.length,
        fullDataStructure: JSON.stringify(data, null, 2)
      });

      if (!data.error && Array.isArray(data.data?.users)) {

        console.log(`✅ Found ${data.data.users.length} users for role: ${role || 'all'}`);
        console.log("✅ Users data:", data.data.users);

        setWorkers(data.data.users);

      } else {

        console.error("❌ Error in API response:", data);
        console.error("❌ Response details:", {
          error: data.error,
          message: data.message,
          data: data.data,
          users: data.data?.users,
          usersType: typeof data.data?.users,
          isArray: Array.isArray(data.data?.users)
        });

        // Try alternative response structures
        if (data.data && !Array.isArray(data.data.users)) {
          console.warn("⚠️ Users is not an array, trying alternative structure...");
          if (Array.isArray(data.data)) {
            console.log("✅ Found users in data.data array");
            setWorkers(data.data);
          } else if (Array.isArray(data.users)) {
            console.log("✅ Found users in data.users array");
            setWorkers(data.users);
          } else {
            setWorkers([]);
          }
        } else {
          setWorkers([]);
        }

      }

    } catch (err) {

      console.error("❌ Error fetching eligible users:", err);

      setWorkers([]);

    } finally {

      setIsLoadingWorkers(false);

    }

  };



  // Toggle user selection for bulk messaging
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Handle select all / deselect all
  const handleSelectAll = () => {
    const filteredWorkers = workers.filter((worker) => {
      const name = worker.name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
      const email = worker.email || '';
      const searchLower = searchTerm.toLowerCase();
      return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
    });

    const filteredWorkerIds = filteredWorkers.map((worker) => worker.id);
    const allSelected = filteredWorkerIds.every((id) => selectedUsers.includes(id));

    if (allSelected) {
      // Deselect all filtered workers
      setSelectedUsers((prev) => prev.filter((id) => !filteredWorkerIds.includes(id)));
    } else {
      // Select all filtered workers
      setSelectedUsers((prev) => {
        const newSelection = [...prev];
        filteredWorkerIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Send message to multiple selected users
  const sendBulkMessage = async () => {
    if (selectedUsers.length === 0 || !bulkMessage.trim()) {
      return;
    }

    setIsSendingBulkMessage(true);
    const successfulThreads = [];
    const failedUsers = [];

    try {
      // Loop through selected users and create thread + send message
      for (const userId of selectedUsers) {
        try {
          const worker = workers.find((w) => w.id === userId);
          if (!worker) {
            failedUsers.push(userId);
            continue;
          }

          // Check if thread already exists
          const existingThread = chatList.find((c) => c.other_user_id === userId);
          
          let threadId;
          if (existingThread) {
            threadId = existingThread.id;
          } else {
            // Create new thread
            const threadRes = await fetch(`${url}messages/threads`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                receiverId: userId,
                receiverRole: worker.role || selectedRole || "worker",
              }),
            });

            const threadData = await threadRes.json();
            if (threadData.error || !threadData.data?.thread) {
              failedUsers.push(userId);
              continue;
            }
            threadId = threadData.data.thread.id;
          }

          // Send message to the thread
          const messageRes = await fetch(
            `${url}messages/threads/${threadId}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: bulkMessage.trim(),
                messageType: "text",
              }),
            }
          );

          const messageData = await messageRes.json();
          if (!messageData.error && messageData.data?.message) {
            successfulThreads.push({ threadId, userId, worker, message: messageData.data.message });
          } else {
            failedUsers.push(userId);
          }
        } catch (error) {
          console.error(`❌ Error sending message to user ${userId}:`, error);
          failedUsers.push(userId);
        }
      }

      // Update chat list with successful threads
      if (successfulThreads.length > 0) {
        const updatedThreads = successfulThreads.map(({ threadId, userId, worker, message }) => {
          const existingThread = chatList.find((c) => c.id === threadId || c.other_user_id === userId);
          
          if (existingThread) {
            return {
              ...existingThread,
              msg: message.content,
              time: formatThreadTime(message.created_at),
              last_message_at: message.created_at,
            };
          } else {
            return {
              id: threadId,
              name: worker.name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim(),
              msg: message.content,
              time: formatThreadTime(message.created_at),
              icon: worker.profile_image ? `${url}${worker.profile_image.startsWith('/') ? worker.profile_image.substring(1) : worker.profile_image}` : "",
              other_user_id: userId,
              other_user_role: worker.role || selectedRole || "worker",
              other_user_email: worker.email || "",
              created_at: message.created_at,
              last_message_at: message.created_at,
            };
          }
        });

        setChatList((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newThreads = updatedThreads.filter((t) => !existingIds.has(t.id));
          const updatedList = prev.map((c) => {
            const updated = updatedThreads.find((t) => t.id === c.id || t.other_user_id === c.other_user_id);
            return updated || c;
          });
          
          // Sort by last_message_at
          const sorted = [...newThreads, ...updatedList].sort((a, b) => {
            const aTime = new Date(a.last_message_at || a.created_at);
            const bTime = new Date(b.last_message_at || b.created_at);
            return bTime - aTime;
          });

          // Update role-based counts
          const currentThreads = unreadCountsRef.current.threads;
          const roleBased = calculateRoleBasedCounts(sorted, currentThreads);
          dispatch(setUnreadCounts({
            roleBased
          }));

          return sorted;
        });

        // Request real-time count updates
        if (socket && socket.connected) {
          successfulThreads.forEach(({ threadId }) => {
            socket.emit("get_thread_unread_count", { threadId });
          });
          socket.emit("get_total_unread_count");
        }
      }

      // Show success/failure message in modal
      if (failedUsers.length > 0) {
        setResultModalData({
          title: t("Partial Success"),
          message: t(`Message sent to ${successfulThreads.length} users. Failed to send to ${failedUsers.length} users.`),
          type: "error",
        });
      } else {
        setResultModalData({
          title: t("Success"),
          message: t(`Message sent successfully to ${successfulThreads.length} users.`),
          type: "success",
        });
      }
      setShowResultModal(true);

      // Clear selections and close dialog
      setSelectedUsers([]);
      setBulkMessage("");
      setShowWorkerList(false);
      setSelectedRole(null);
      setWorkers([]);
      setSearchTerm("");

    } catch (error) {
      console.error("❌ Error in bulk messaging:", error);
      setResultModalData({
        title: t("Error"),
        message: t("Error sending bulk messages. Please try again."),
        type: "error",
      });
      setShowResultModal(true);
    } finally {
      setIsSendingBulkMessage(false);
    }
  };

  // Start new chat

  const startNewChat = async (worker) => {

    const tempId = `temp-${worker.id}-${Date.now()}`;

    const currentTime = formatThreadTime(new Date().toISOString());



    const optimisticThread = {

      id: tempId,

      name: worker.name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim(),

      msg: t("new_conversation_started"),

      time: currentTime,

      icon: worker.profile_image ? `${url}/${worker.profile_image}` : "",

      other_user_id: worker.id,

      other_user_role: worker.role || "worker", // Store role from worker data
      other_user_email: worker.email || "", // Store email for display
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

      console.log("Creating thread for user:", worker.id, "with role:", worker.role || "worker");

      const res = await fetch(`${url}messages/threads`, {

        method: "POST",

        headers: {

          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          receiverId: worker.id,

          receiverRole: worker.role || "worker",

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

          msg: thread.last_message_content || t("new_conversation_started"),

          time: thread.last_message_at

            ? formatThreadTime(thread.last_message_at)

            : new Date().toLocaleTimeString([], {

              hour: "2-digit",

              minute: "2-digit",

              hour12: true

            }),

          icon: thread.other_user_avatar || (worker.profile_image ? `${url}/${worker.profile_image}` : ""),

          other_user_id: thread.other_user_id || worker.id,

          other_user_role: thread.other_user_role || worker.role || "worker", // Store role
          other_user_email: thread.other_user_email || thread.email || worker.email || "", // Store email
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



          let updatedList;
          if (existsById) {

            // Update existing thread by ID

            updatedList = withoutTemp.map((c) =>
              c.id === confirmedThread.id ? confirmedThread : c

            );

            console.log("Updated existing thread by ID:", updatedList);
          } else if (existsByUserId) {

            // Update existing thread by user ID

            updatedList = withoutTemp.map((c) =>
              c.other_user_id === confirmedThread.other_user_id ? confirmedThread : c

            );

            console.log("Updated existing thread by user ID:", updatedList);
          } else {

            // Add new thread

            updatedList = [confirmedThread, ...withoutTemp];
            console.log("Added new thread:", updatedList);
          }
          
          // Update role-based counts after updating chatList
          const currentThreads = unreadCountsRef.current.threads;
          const roleBased = calculateRoleBasedCounts(updatedList, currentThreads);
          dispatch(setUnreadCounts({
            roleBased
          }));
          
          return updatedList;
        });



        setSelectedChat(confirmedThread);

        fetchMessages(confirmedThread.id);

        

        // Request real-time count update from backend

        if (socket && socket.connected) {

          socket.emit("get_thread_unread_count", { threadId: confirmedThread.id });

          socket.emit("get_total_unread_count");

        }

      } else {

        setChatList((prev) => prev.filter((t) => t.id !== tempId));

        console.error("❌ Thread creation failed", data);

      }

    } catch (err) {

      setChatList((prev) => prev.filter((t) => t.id !== tempId));

      console.error("❌ Error starting chat:", err);

    }

  };

  // Function to open or create chat with account executive from URL params
  const openChatWithAccountExecutive = async (accountExecutiveId, role = "account_executive", accountExecutiveData = null) => {
    if (!accountExecutiveId || !token) return;

    // Convert ID to number for comparison (URL params are strings)
    const accountExecutiveIdNum = typeof accountExecutiveId === 'string' ? parseInt(accountExecutiveId, 10) : accountExecutiveId;

    console.log("🔍 openChatWithAccountExecutive called with:", { accountExecutiveId, accountExecutiveIdNum, role, accountExecutiveData });

    // Get account executive name from state or construct from first_name and last_name
    const getAccountExecutiveName = () => {
      if (accountExecutiveData) {
        if (accountExecutiveData.name) {
          return accountExecutiveData.name;
        }
        if (accountExecutiveData.first_name || accountExecutiveData.last_name) {
          return `${accountExecutiveData.first_name || ''} ${accountExecutiveData.last_name || ''}`.trim();
        }
      }
      return "Account Executive";
    };

    const getAccountExecutiveAvatar = () => {
      if (accountExecutiveData) {
        return accountExecutiveData.profile_picture_url || accountExecutiveData.profile_image || "";
      }
      return "";
    };

    const getAccountExecutiveEmail = () => {
      if (accountExecutiveData) {
        return accountExecutiveData.email || "";
      }
      return "";
    };

    // Check if thread already exists with this user (compare as numbers)
    const existingThread = chatList.find((c) => c.other_user_id === accountExecutiveIdNum);

    if (existingThread) {
      console.log("Thread already exists with account executive:", existingThread);
      // Move the thread to the top of the list
      setChatList(prev => {
        const filtered = prev.filter(c => c.id !== existingThread.id);
        return [existingThread, ...filtered];
      });
      setSelectedChat(existingThread);
      fetchMessages(existingThread.id);
      // Clear URL params after opening chat
      setSearchParams({});
      return;
    }

    // Create new thread
    const tempId = `temp-${accountExecutiveIdNum}-${Date.now()}`;
    const currentTime = formatThreadTime(new Date().toISOString());
    const accountExecutiveName = getAccountExecutiveName();
    const accountExecutiveAvatar = getAccountExecutiveAvatar();
    const accountExecutiveEmail = getAccountExecutiveEmail();

    const optimisticThread = {
      id: tempId,
      name: accountExecutiveName,
      msg: t("new_conversation_started"),
      time: currentTime,
      icon: accountExecutiveAvatar,
      other_user_id: accountExecutiveIdNum,
      other_user_role: role,
      other_user_email: accountExecutiveEmail,
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };

    // Add optimistic thread
    setChatList((prev) => [optimisticThread, ...prev]);
    setSelectedChat(optimisticThread);
    setMessages([]);

    try {
      console.log("Creating thread for account executive:", accountExecutiveId, "with role:", role);

      const res = await fetch(`${url}messages/threads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: accountExecutiveId,
          receiverRole: role,
        }),
      });

      const data = await res.json();
      console.log("Thread creation response:", data);

      if (!data.error && data.data?.thread) {
        const thread = data.data.thread;
        
        // Ensure other_user_id is a number for consistent comparison
        const threadUserId = thread.other_user_id ? (typeof thread.other_user_id === 'string' ? parseInt(thread.other_user_id, 10) : thread.other_user_id) : accountExecutiveIdNum;

        const confirmedThread = {
          id: thread.id,
          name: thread.other_user_name || accountExecutiveName,
          msg: thread.last_message_content || t("new_conversation_started"),
          time: thread.last_message_at
            ? formatThreadTime(thread.last_message_at)
            : new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              }),
          icon: thread.other_user_avatar || accountExecutiveAvatar,
          other_user_id: threadUserId,
          other_user_role: thread.other_user_role || role,
          other_user_email: thread.other_user_email || thread.email || accountExecutiveEmail,
          created_at: thread.created_at || new Date().toISOString(),
          last_message_at: thread.last_message_at || new Date().toISOString(),
        };

        // Check if this thread already exists in our list
        const existingThreadById = chatList.find((c) => c.id === confirmedThread.id);

        if (existingThreadById) {
          console.log("Thread already exists, just selecting it and moving to top");
          // Move to top of the list
          setChatList(prev => {
            const filtered = prev.filter(c => c.id !== confirmedThread.id);
            return [confirmedThread, ...filtered];
          });
          setSelectedChat(confirmedThread);
          fetchMessages(confirmedThread.id);
          setSearchParams({});
          return;
        }

        setChatList((prev) => {
          // Remove the temporary thread
          const withoutTemp = prev.filter((c) => c.id !== tempId);

          // Check if the confirmed thread already exists by ID or other_user_id
          const existsById = withoutTemp.some((c) => c.id === confirmedThread.id);
          const existsByUserId = withoutTemp.some((c) => c.other_user_id === threadUserId);

          let updatedList;
          if (existsById) {
            // Update existing thread and move to top
            const filtered = withoutTemp.filter((c) => c.id !== confirmedThread.id);
            updatedList = [confirmedThread, ...filtered];
          } else if (existsByUserId) {
            // Update existing thread by user ID and move to top
            const filtered = withoutTemp.filter((c) => c.other_user_id !== threadUserId);
            updatedList = [confirmedThread, ...filtered];
          } else {
            // Add new thread at top
            updatedList = [confirmedThread, ...withoutTemp];
          }

          // Update role-based counts
          const currentThreads = unreadCountsRef.current.threads;
          const roleBased = calculateRoleBasedCounts(updatedList, currentThreads);
          dispatch(setUnreadCounts({
            roleBased
          }));

          return updatedList;
        });

        setSelectedChat(confirmedThread);
        fetchMessages(confirmedThread.id);

        // Request real-time count update from backend
        if (socket && socket.connected) {
          socket.emit("get_thread_unread_count", { threadId: confirmedThread.id });
          socket.emit("get_total_unread_count");
        }

        // Clear URL params after opening chat
        setSearchParams({});
      } else {
        setChatList((prev) => prev.filter((t) => t.id !== tempId));
        console.error("❌ Thread creation failed for account executive", data);
      }
    } catch (err) {
      setChatList((prev) => prev.filter((t) => t.id !== tempId));
      console.error("❌ Error creating thread with account executive:", err);
    }
  };

  // Function to open or create chat with company admin from URL params
  const openChatWithCompanyAdmin = async (companyAdminId, role = "company_admin", companyAdminData = null) => {
    if (!companyAdminId || !token) return;

    // Convert ID to number for comparison (URL params are strings)
    const companyAdminIdNum = typeof companyAdminId === 'string' ? parseInt(companyAdminId, 10) : companyAdminId;

    console.log("🔍 openChatWithCompanyAdmin called with:", { companyAdminId, companyAdminIdNum, role, companyAdminData });

    // Get company admin name from state or use full_name
    const getCompanyAdminName = () => {
      if (companyAdminData) {
        if (companyAdminData.name) {
          return companyAdminData.name;
        }
        if (companyAdminData.full_name) {
          return companyAdminData.full_name;
        }
        if (companyAdminData.first_name || companyAdminData.last_name) {
          return `${companyAdminData.first_name || ''} ${companyAdminData.last_name || ''}`.trim();
        }
      }
      return "Company Admin";
    };

    const getCompanyAdminAvatar = () => {
      if (companyAdminData) {
        return companyAdminData.profile_picture_url || companyAdminData.profile_image || "";
      }
      return "";
    };

    const getCompanyAdminEmail = () => {
      if (companyAdminData) {
        return companyAdminData.email || "";
      }
      return "";
    };

    // Check if thread already exists with this user (compare as numbers)
    const existingThread = chatList.find((c) => c.other_user_id === companyAdminIdNum);

    if (existingThread) {
      console.log("Thread already exists with company admin:", existingThread);
      // Move the thread to the top of the list
      setChatList(prev => {
        const filtered = prev.filter(c => c.id !== existingThread.id);
        return [existingThread, ...filtered];
      });
      setSelectedChat(existingThread);
      fetchMessages(existingThread.id);
      // Clear URL params after opening chat
      setSearchParams({});
      return;
    }

    // Create new thread
    const tempId = `temp-${companyAdminIdNum}-${Date.now()}`;
    const currentTime = formatThreadTime(new Date().toISOString());
    const companyAdminName = getCompanyAdminName();
    const companyAdminAvatar = getCompanyAdminAvatar();
    const companyAdminEmail = getCompanyAdminEmail();

    const optimisticThread = {
      id: tempId,
      name: companyAdminName,
      msg: t("new_conversation_started"),
      time: currentTime,
      icon: companyAdminAvatar,
      other_user_id: companyAdminIdNum,
      other_user_role: role,
      other_user_email: companyAdminEmail,
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };

    // Add optimistic thread
    setChatList((prev) => [optimisticThread, ...prev]);
    setSelectedChat(optimisticThread);
    setMessages([]);

    try {
      console.log("Creating thread for company admin:", companyAdminId, "with role:", role);

      const res = await fetch(`${url}messages/threads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: companyAdminId,
          receiverRole: role,
        }),
      });

      const data = await res.json();
      console.log("Thread creation response:", data);

      if (!data.error && data.data?.thread) {
        const thread = data.data.thread;
        
        // Ensure other_user_id is a number for consistent comparison
        const threadUserId = thread.other_user_id ? (typeof thread.other_user_id === 'string' ? parseInt(thread.other_user_id, 10) : thread.other_user_id) : companyAdminIdNum;

        const confirmedThread = {
          id: thread.id,
          name: thread.other_user_name || companyAdminName,
          msg: thread.last_message_content || t("new_conversation_started"),
          time: thread.last_message_at
            ? formatThreadTime(thread.last_message_at)
            : new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              }),
          icon: thread.other_user_avatar || companyAdminAvatar,
          other_user_id: threadUserId,
          other_user_role: thread.other_user_role || role,
          other_user_email: thread.other_user_email || thread.email || companyAdminEmail,
          created_at: thread.created_at || new Date().toISOString(),
          last_message_at: thread.last_message_at || new Date().toISOString(),
        };

        // Check if this thread already exists in our list
        const existingThreadById = chatList.find((c) => c.id === confirmedThread.id);

        if (existingThreadById) {
          console.log("Thread already exists, just selecting it and moving to top");
          // Move to top of the list
          setChatList(prev => {
            const filtered = prev.filter(c => c.id !== confirmedThread.id);
            return [confirmedThread, ...filtered];
          });
          setSelectedChat(confirmedThread);
          fetchMessages(confirmedThread.id);
          setSearchParams({});
          return;
        }

        setChatList((prev) => {
          // Remove the temporary thread
          const withoutTemp = prev.filter((c) => c.id !== tempId);

          // Check if the confirmed thread already exists by ID or other_user_id
          const existsById = withoutTemp.some((c) => c.id === confirmedThread.id);
          const existsByUserId = withoutTemp.some((c) => c.other_user_id === threadUserId);

          let updatedList;
          if (existsById) {
            // Update existing thread and move to top
            const filtered = withoutTemp.filter((c) => c.id !== confirmedThread.id);
            updatedList = [confirmedThread, ...filtered];
          } else if (existsByUserId) {
            // Update existing thread by user ID and move to top
            const filtered = withoutTemp.filter((c) => c.other_user_id !== threadUserId);
            updatedList = [confirmedThread, ...filtered];
          } else {
            // Add new thread at top
            updatedList = [confirmedThread, ...withoutTemp];
          }

          // Update role-based counts
          const currentThreads = unreadCountsRef.current.threads;
          const roleBased = calculateRoleBasedCounts(updatedList, currentThreads);
          dispatch(setUnreadCounts({
            roleBased
          }));

          return updatedList;
        });

        setSelectedChat(confirmedThread);
        fetchMessages(confirmedThread.id);

        // Request real-time count update from backend
        if (socket && socket.connected) {
          socket.emit("get_thread_unread_count", { threadId: confirmedThread.id });
          socket.emit("get_total_unread_count");
        }

        // Clear URL params after opening chat
        setSearchParams({});
      } else {
        setChatList((prev) => prev.filter((t) => t.id !== tempId));
        console.error("❌ Thread creation failed for company admin", data);
      }
    } catch (err) {
      setChatList((prev) => prev.filter((t) => t.id !== tempId));
      console.error("❌ Error creating thread with company admin:", err);
    }
  };

  // Function to open or create chat with worker from URL params
  const openChatWithWorker = async (workerId, role = "worker", workerData = null) => {
    if (!workerId || !token) {
      console.log("❌ openChatWithWorker: Missing workerId or token", { workerId, hasToken: !!token });
      return;
    }

    // Convert workerId to number for comparison (URL params are strings)
    const workerIdNum = typeof workerId === 'string' ? parseInt(workerId, 10) : workerId;

    console.log("🔍 openChatWithWorker called with:", { workerId, workerIdNum, role, workerData });

    // Get worker name from state or construct from first_name, middle_name, and last_name
    const getWorkerName = () => {
      if (workerData) {
        if (workerData.name) {
          return workerData.name;
        }
        if (workerData.first_name || workerData.last_name) {
          const nameParts = [
            workerData.first_name || '',
            workerData.middle_name || '',
            workerData.last_name || ''
          ].filter(Boolean);
          return nameParts.join(' ').trim();
        }
      }
      return "Worker";
    };

    const getWorkerAvatar = () => {
      if (workerData) {
        if (workerData.profile_image) {
          // Handle profile_image similar to existing startNewChat function
          if (workerData.profile_image.startsWith('http')) {
            return workerData.profile_image;
          }
          // Use same format as existing startNewChat: ${url}/${worker.profile_image}
          return `${url}/${workerData.profile_image}`;
        }
        return workerData.profile_picture_url || "";
      }
      return "";
    };

    const getWorkerEmail = () => {
      if (workerData) {
        return workerData.email || "";
      }
      return "";
    };

    // Check if thread already exists with this user (compare as numbers)
    const existingThread = chatList.find((c) => c.other_user_id === workerIdNum);

    if (existingThread) {
      console.log("Thread already exists with worker:", existingThread);
      // Move the thread to the top of the list
      setChatList(prev => {
        const filtered = prev.filter(c => c.id !== existingThread.id);
        return [existingThread, ...filtered];
      });
      setSelectedChat(existingThread);
      fetchMessages(existingThread.id);
      // Clear URL params after opening chat
      setSearchParams({});
      return;
    }

    // Create new thread
    const tempId = `temp-${workerIdNum}-${Date.now()}`;
    const currentTime = formatThreadTime(new Date().toISOString());
    const workerName = getWorkerName();
    const workerAvatar = getWorkerAvatar();
    const workerEmail = getWorkerEmail();

    const optimisticThread = {
      id: tempId,
      name: workerName,
      msg: t("new_conversation_started"),
      time: currentTime,
      icon: workerAvatar,
      other_user_id: workerIdNum,
      other_user_role: role,
      other_user_email: workerEmail,
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };

    // Add optimistic thread
    setChatList((prev) => [optimisticThread, ...prev]);
    setSelectedChat(optimisticThread);
    setMessages([]);

    try {
      console.log("Creating thread for worker:", workerId, "with role:", role);

      const res = await fetch(`${url}messages/threads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: workerId,
          receiverRole: role,
        }),
      });

      const data = await res.json();
      console.log("Thread creation response:", data);

      if (!data.error && data.data?.thread) {
        const thread = data.data.thread;
        
        // Ensure other_user_id is a number for consistent comparison
        const threadUserId = thread.other_user_id ? (typeof thread.other_user_id === 'string' ? parseInt(thread.other_user_id, 10) : thread.other_user_id) : workerIdNum;

        const confirmedThread = {
          id: thread.id,
          name: thread.other_user_name || workerName,
          msg: thread.last_message_content || t("new_conversation_started"),
          time: thread.last_message_at
            ? formatThreadTime(thread.last_message_at)
            : new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              }),
          icon: thread.other_user_avatar || workerAvatar,
          other_user_id: threadUserId,
          other_user_role: thread.other_user_role || role,
          other_user_email: thread.other_user_email || thread.email || workerEmail,
          created_at: thread.created_at || new Date().toISOString(),
          last_message_at: thread.last_message_at || new Date().toISOString(),
        };

        // Check if this thread already exists in our list
        const existingThreadById = chatList.find((c) => c.id === confirmedThread.id);

        if (existingThreadById) {
          console.log("Thread already exists, just selecting it and moving to top");
          // Move to top of the list
          setChatList(prev => {
            const filtered = prev.filter(c => c.id !== confirmedThread.id);
            return [confirmedThread, ...filtered];
          });
          setSelectedChat(confirmedThread);
          fetchMessages(confirmedThread.id);
          setSearchParams({});
          return;
        }

        setChatList((prev) => {
          // Remove the temporary thread
          const withoutTemp = prev.filter((c) => c.id !== tempId);

          // Check if the confirmed thread already exists by ID or other_user_id
          const existsById = withoutTemp.some((c) => c.id === confirmedThread.id);
          const existsByUserId = withoutTemp.some((c) => c.other_user_id === threadUserId);

          let updatedList;
          if (existsById) {
            // Update existing thread and move to top
            const filtered = withoutTemp.filter((c) => c.id !== confirmedThread.id);
            updatedList = [confirmedThread, ...filtered];
          } else if (existsByUserId) {
            // Update existing thread by user ID and move to top
            const filtered = withoutTemp.filter((c) => c.other_user_id !== threadUserId);
            updatedList = [confirmedThread, ...filtered];
          } else {
            // Add new thread at top
            updatedList = [confirmedThread, ...withoutTemp];
          }

          // Update role-based counts
          const currentThreads = unreadCountsRef.current.threads;
          const roleBased = calculateRoleBasedCounts(updatedList, currentThreads);
          dispatch(setUnreadCounts({
            roleBased
          }));

          return updatedList;
        });

        // IMPORTANT: Update selectedChat with confirmed thread BEFORE fetching messages
        // This ensures messages are fetched with the correct thread ID
        setSelectedChat(confirmedThread);
        
        // Use setTimeout to ensure state is updated before fetching messages
        setTimeout(() => {
          fetchMessages(confirmedThread.id);
        }, 100);

        // Request real-time count update from backend
        if (socket && socket.connected) {
          socket.emit("get_thread_unread_count", { threadId: confirmedThread.id });
          socket.emit("get_total_unread_count");
        }

        // Clear URL params after opening chat
        setSearchParams({});
      } else {
        setChatList((prev) => prev.filter((t) => t.id !== tempId));
        console.error("❌ Thread creation failed for worker", data);
      }
    } catch (err) {
      setChatList((prev) => prev.filter((t) => t.id !== tempId));
      console.error("❌ Error creating thread with worker:", err);
    }
  };

  // useEffect to handle URL parameters and open chat with account executive, company admin, or worker
  // useEffect to handle URL parameters and open chat with account executive, company admin, or worker
  useEffect(() => {
    console.log("🔍 useEffect triggered:", { 
      userIdFromUrl, 
      chatListLength: chatList.length, 
      isLoadingThreads, 
      roleFromUrl,
      hasWorkerData: !!workerFromState,
      hasAccountExecData: !!accountExecutiveFromState,
      hasCompanyAdminData: !!companyAdminFromState,
      locationState: location.state
    });

    if (userIdFromUrl && chatList.length > 0 && !isLoadingThreads) {
      // Convert to number for comparison (URL params are strings)
      const userIdNum = parseInt(userIdFromUrl, 10);
      // Only proceed if the currently selected chat is not the one we want to open
      const shouldOpen = !selectedChat || selectedChat.other_user_id !== userIdNum;
      
      console.log("🔍 Should open chat?", { shouldOpen, selectedChatUserId: selectedChat?.other_user_id, userIdFromUrl });
      
      if (shouldOpen) {
        if (roleFromUrl === "account_executive") {
          console.log("✅ Opening chat with account executive from URL:", userIdFromUrl);
          openChatWithAccountExecutive(userIdFromUrl, roleFromUrl, accountExecutiveFromState);
        } else if (roleFromUrl === "company_admin") {
          console.log("✅ Opening chat with company admin from URL:", userIdFromUrl);
          openChatWithCompanyAdmin(userIdFromUrl, roleFromUrl, companyAdminFromState);
        } else if (roleFromUrl === "worker") {
          console.log("✅ Opening chat with worker from URL:", userIdFromUrl, "with data:", workerFromState);
          openChatWithWorker(userIdFromUrl, roleFromUrl, workerFromState);
        } else {
          console.log("⚠️ Unknown role:", roleFromUrl);
        }
      }
    } else {
      console.log("⏸️ useEffect conditions not met:", {
        hasUserId: !!userIdFromUrl,
        hasChatList: chatList.length > 0,
        isLoading: isLoadingThreads
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdFromUrl, chatList, isLoadingThreads, roleFromUrl, accountExecutiveFromState, companyAdminFromState, workerFromState]);

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

                {t("Messages")}

              </CustomText>

              {(() => {

                const currentUnreadCount = unreadCounts.total || 0;

                return currentUnreadCount > 0 && (

                  <Box sx={{ ml: 1 }}>

                    {getUnreadCountBadge(currentUnreadCount)}

                  </Box>

                );

              })()}

            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Mark All as Read Button */}
              {unreadCounts.total > 0 && (
                <Tooltip title={t("markAllAsRead")}>
                  <IconButton
                    sx={{ 
                      backgroundColor: isMarkingAllRead ? "#ccc" : "#4CAF50", 
                      p: 0.5, 
                      borderRadius: "50%",
                      "&:hover": {
                        backgroundColor: isMarkingAllRead ? "#ccc" : "#45a049",
                      }
                    }}
                    onClick={markAllMessagesAsRead}
                    disabled={isMarkingAllRead}
                  >
                    {isMarkingAllRead ? (
                      <CircularProgress size={18} sx={{ color: "white" }} />
                    ) : (
                      <DoneAll sx={{ color: "white", fontSize: 18 }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}

              {/* New Chat Button */}
              <IconButton
                sx={{ backgroundColor: "#003149", p: 0.2, borderRadius: "50%" }}
                onClick={() => {
                  setSelectedRole(null);
                  setWorkers([]);
                  setSelectedUsers([]);
                  setBulkMessage("");
                  setShowWorkerList(true);
                }}
              >
                <Add sx={{ color: "white" }} />
              </IconButton>
            </Box>

          </Box>



          <Divider />



          {/* Search */}

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

          {/* Chat list */}

          <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>

            <List>

              {isLoadingThreads ? (

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

              ) : !showThreads ? (

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

                      <Box sx={{ position: "relative" }}>

                        <Avatar src={chat.icon || undefined}>

                          {chat.name?.charAt(0)}

                        </Avatar>

                        {(() => {

                          const status = getOnlineStatusIndicator(chat.other_user_id);

                          return status.icon;

                        })()}

                      </Box>

                    </ListItemAvatar>

                    <ListItemText

                      primary={

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>

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

                          {/* Email and Role Row */}

                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>

                            {chat.other_user_email && (

                              <Typography

                                sx={{

                                  fontSize: "11px",

                                  color: selectedChat?.id === chat.id ? "#006EC2" : "#888",

                                  fontFamily: "Poppins, sans-serif",

                                  fontWeight: "400",

                                  maxWidth: "150px",

                                  overflow: "hidden",

                                  textOverflow: "ellipsis",

                                  whiteSpace: "nowrap",

                                }}

                                title={chat.other_user_email}

                              >

                                {chat.other_user_email}

                              </Typography>

                            )}

                            {chat.other_user_role && (

                              <Box

                                sx={{

                                  backgroundColor: 

                                    chat.other_user_role === "account_executive" ? "#E3F2FD" :

                                    chat.other_user_role === "company_admin" ? "#F3E5F5" :

                                    chat.other_user_role === "worker" ? "#E8F5E9" : "#F5F5F5",

                                  color: 

                                    chat.other_user_role === "account_executive" ? "#1565C0" :

                                    chat.other_user_role === "company_admin" ? "#7B1FA2" :

                                    chat.other_user_role === "worker" ? "#2E7D32" : "#666",

                                  px: 0.8,

                                  py: 0.2,

                                  borderRadius: "4px",

                                  fontSize: "10px",

                                  fontWeight: "600",

                                  fontFamily: "Poppins, sans-serif",

                                  textTransform: "capitalize",

                                }}

                              >

                                {
                                // chat.other_user_role === "account_executive" ? "Acc. Executive" :

                                //  chat.other_user_role === "company_admin" ? "Company Admin" :

                                //  chat.other_user_role === "worker" ? "Employee" : 

                                //  chat.other_user_role?.replace(/_/g, " ")
                                chat.other_user_role === "account_executive"
? t("chat.roles.account_executive")
: chat.other_user_role === "company_admin"
? t("chat.roles.company_admin")
: chat.other_user_role === "worker"
? t("chat.roles.worker")
: chat.other_user_role?.replace(/_/g, " ")
                                 }

                              </Box>

                            )}

                          </Box>

                        </Box>

                      }

                      secondary={

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>

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

                            

                            if (isImageMessage) {

                              return (

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                                  <Image sx={{ fontSize: 16, color: selectedChat?.id === chat.id ? "#006EC2" : "#666666" }} />

                                  <Typography

                                    sx={{

                                      fontSize: "12px",

                                      color: selectedChat?.id === chat.id ? "#006EC2" : "#666666",

                                      fontFamily: "Poppins, sans-serif",

                                      fontWeight: selectedChat?.id === chat.id ? "500" : "400",

                                    }}

                                  >

                                    {t("Image")}

                                  </Typography>

                                </Box>

                              );

                            }

                            

                            return (

                              <Typography

                                sx={{

                                  fontSize: "12px",

                                  color: selectedChat?.id === chat.id ? "#006EC2" : "#666666",

                                  fontFamily: "Poppins, sans-serif",

                                  fontWeight: selectedChat?.id === chat.id ? "500" : "400",

                                  maxWidth: "180px",

                                  overflow: "hidden",

                                  textOverflow: "ellipsis",

                                  whiteSpace: "nowrap",

                                }}

                              >

                                {chat.msg}

                              </Typography>

                            );

                          })()}

                        </Box>

                      }

                    />

                    {/* <Typography

                        variant="body2"

                        sx={{

                          fontSize: "13px",

                          fontFamily: "Poppins, sans-serif",

                          color:

                            selectedChat?.id === chat.id ? "#fff" : "#100F0F",

                        }}

                      >

                        {chat.time}

                      </Typography> */}

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

                        const count = unreadCounts.threads[String(chat.id)] || 0;

                        return getUnreadCountBadge(count);

                      })()}

                    </Box>

                  </ListItem>

                ))

              )}

              {/* Load More Threads Button */}
              {!isLoadingThreads && chatList.length > 0 && hasMoreThreads && (
                <Box sx={{ textAlign: "center", py: 1 }}>
                  <Button
                    onClick={loadMoreThreads}
                    disabled={isLoadingMoreThreads}
                    variant="text"
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "11px",
                      color: "#006EC2",
                    }}
                  >
                    {isLoadingMoreThreads ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={12} color="inherit" />
                        <span>{t("Loading...")}</span>
                      </Box>
                    ) : (
                      <span>{t("Load More Conversations")}</span>
                    )}
                  </Button>
                </Box>
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

                <Box sx={{ position: "relative", mr: 2 }}>

                  <Avatar src={selectedChat.icon} />

                  {(() => {

                    const status = getOnlineStatusIndicator(selectedChat.other_user_id);

                    return status.icon;

                  })()}

                </Box>

                <Box>

                  <Typography

                    sx={{

                      fontWeight: "600",

                      fontSize: "16px",

                      fontFamily: "Poppins, sans-serif",

                    }}

                  >

                    {selectedChat.name}

                  </Typography>

                  {(() => {

                    const status = getOnlineStatusIndicator(selectedChat.other_user_id);

                    return (

                      <Typography

                        sx={{

                          fontSize: "12px",

                          color: status.color,

                          fontFamily: "Poppins, sans-serif",

                        }}

                      >

                        {status.text}

                      </Typography>

                    );

                  })()}

                </Box>

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

              py: 1,

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

                <img src={chatimage} alt="chat" />

                <Typography

                  sx={{

                    fontWeight: 600,

                    fontSize: "18px",

                    fontFamily: "Poppins, sans-serif",

                  }}

                >

                  {t("select_conversation")}

                </Typography>

                <Typography

                  sx={{

                    fontSize: "14px",

                    color: "#888",

                    fontFamily: "Poppins, sans-serif",

                  }}

                >

                  {t("choose_conversation")}

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

                  {t("loading_messages")}

                </Typography>

              </Box>

            )}



            {/* Load More Messages Button - At top of messages */}
            {selectedChat && !isLoadingMessages && messages.length > 0 && hasMoreMessages && (
              <Box sx={{ textAlign: "center", py: 1, mb: 1 }}>
                <Button
                  onClick={loadMoreMessages}
                  disabled={isLoadingMoreMessages}
                  variant="text"
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "12px",
                    color: "#006EC2",
                    "&:hover": {
                      backgroundColor: "#F0F9FF",
                    },
                  }}
                >
                  {isLoadingMoreMessages ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={14} color="inherit" />
                      <span>{t("Loading...")}</span>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <KeyboardArrowUp sx={{ fontSize: 18, mr: 0.5 }} />
                      <span>{t("Load Older Messages")}</span>
                    </Box>
                  )}
                </Button>
              </Box>
            )}

            {/* Beginning of conversation indicator */}
            {selectedChat && !isLoadingMessages && messages.length > 0 && !hasMoreMessages && (
              <Box sx={{ textAlign: "center", py: 1, mb: 1 }}>
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "#bbb",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  — {t("Beginning of conversation")} —
                </Typography>
              </Box>
            )}

            {/* Messages list */}
            {selectedChat &&

              messages.map((msg) => {

                const isMine =

                  msg.sender_id === userId || msg.sender?.id === userId;

                return (

                  <Box

                    key={msg.id}

                    sx={{

                      display: "flex",

                      justifyContent: isMine ? "flex-end" : "flex-start",

                      mb: 1,

                    }}

                  >

                    <Box

                      sx={{

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

                        crossorigin="anonymous"

                          src={(() => {

                            // Use file_url for image display

                            if (msg.file_url) {

                              // If file_url is already a full URL, use it directly

                              if (msg.file_url.startsWith('http://') || msg.file_url.startsWith('https://')) {

                                console.log("🖼️ Using full URL from file_url:", msg.file_url);

                                return msg.file_url;

                              }

                              // If it's a relative path, add the base URL

                              const fullUrl = `${url}${msg.file_url}`;

                              console.log("🖼️ Constructed URL from file_url:", fullUrl);

                              return fullUrl;

                            }

                            console.log("🖼️ No image URL found for message:", msg);

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

                                return `${url}${msg.file_url}`;

                              }

                              const contentUrl = msg.content?.match(/\[Image: (.*?)\]/)?.[1];

                              if (contentUrl) {

                                if (contentUrl.startsWith('http://') || contentUrl.startsWith('https://')) {

                                  return contentUrl;

                                }

                                return `${url}${contentUrl}`;

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

                    ) : (msg.message_type === "file" || msg.message_type === "system") && !msg.fileType?.includes('audio') && !msg.file_url?.includes('audio') && !(msg.file_name && msg.file_name.includes('audio')) && !(msg.file_name && msg.file_name.endsWith('.webm')) ? (

                      (() => {

                        console.log("📄 Rendering file message:", msg);

                        // Use file_url for file display

                        let fileUrl = msg.file_url;

                        let fileName = msg.file_name || "Document";

                        

                        // Fallback to old format parsing if no file_url

                        if (!fileUrl) {

                          fileUrl = msg.content?.match(/\[File: .*? - (.*?)\]/)?.[1];

                          fileName = msg.file_name || msg.content?.match(/\[File: (.*?) -/)?.[1] || "Document";

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

                                  {fileExtension?.toUpperCase()} Document

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

                    ) : (msg.message_type === "file" || msg.message_type === "system") && (msg.fileType?.includes('audio') || msg.file_url?.includes('audio') || (msg.file_name && msg.file_name.includes('audio')) || (msg.file_name && msg.file_name.endsWith('.webm'))) ? (
                      // Audio message rendering
                      (() => {
                        const audioFileUrl = msg.file_url 
                          ? (msg.file_url.startsWith('http://') || msg.file_url.startsWith('https://') 
                              ? msg.file_url 
                              : `${url}${msg.file_url}`)
                          : '';
                        
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
                                "&:hover": {
                                  backgroundColor: isMine ? "rgba(255, 255, 255, 0.3)" : "#0056b3",
                                }
                              }}
                            >
                              {playingAudioId === msg.id ? (
                                <Pause sx={{ fontSize: 20 }} />
                              ) : (
                                <PlayArrow sx={{ fontSize: 20 }} />
                              )}
                            </IconButton>
                            <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
                              {/* Progress bar with knob */}
                              <Box sx={{ position: "relative", flex: 1, height: 6, borderRadius: 999, backgroundColor: isMine ? "rgba(255,255,255,0.25)" : "#E1E4E8" }}>
                                <Box sx={{ position: "absolute", top: 0, left: 0, height: 6, width: `${percent}%`, backgroundColor: isMine ? "#FFFFFF" : "#006EC2", borderRadius: 999, transition: "width 120ms linear" }} />
                                <Box sx={{ position: "absolute", top: "50%", left: `calc(${percent}% - 6px)`, transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", backgroundColor: isMine ? "#FFFFFF" : "#006EC2" }} />
                              </Box>
                              {/* Time */}
                              <Typography sx={{ fontSize: "11px", fontFamily: "Poppins, sans-serif", color: isMine ? "rgba(255,255,255,0.95)" : "#4A4A4A", minWidth: 68, textAlign: "right" }}>
                                {formatDuration(progress)} / {formatDuration(duration)}
                              </Typography>
                              {/* Optional download */}
                              <IconButton
                                size="small"
                                component="a"
                                href={audioFileUrl}
                                download
                                sx={{
                                  ml: 0.25,
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  color: isMine ? "white" : "#006EC2",
                                  "&:hover": { backgroundColor: isMine ? "rgba(255,255,255,0.2)" : "#e8f4fd" },
                                }}
                              >
                                <Download sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        );
                      })()

                    ) : (

                      <img

                       crossorigin="anonymous"

                        src={msg.file_url ? (

                          msg.file_url.startsWith('http://') || msg.file_url.startsWith('https://') 

                            ? msg.file_url 

                            : `${url}${msg.file_url}`

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

                        // For our own messages, show delivery status

                        if (isMine) {

                          const deliveryStatus = messageDeliveryStatus[msg.id]?.status || msg.delivery_status || 'sent';

                          return getMessageStatusIcon(deliveryStatus, isMine);

                        }

                        return null;

                      })()}

                    </Box>

                    

                    {/* Read receipt timestamp */}

                  

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

                      {isUploadingFile ? t("Uploading file...") : selectedFile?.name}

                    </Typography>

                    <Typography

                      sx={{

                        fontSize: "11px",

                        color: "#666",

                        fontFamily: "Poppins, sans-serif",

                        textTransform: "uppercase"

                      }}

                    >

                      {isUploadingFile ? "Please wait..." : `${selectedFile?.name?.split('.').pop()?.toUpperCase()} Document`}

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

                    {isUploadingImage ? t("Uploading image...") : t("Image ready to send")}

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

                   crossorigin="anonymous"

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

                accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"

                onChange={handleFileSelect}

                style={{ display: "none" }}

                id="file-upload"

              />

              {/* Recording UI - compact WhatsApp-like pill */}
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
                  {/* Red dot */}
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#ff3b30",
                      mx: 1,
                      "@keyframes recPulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.4 },
                      },
                      animation: "recPulse 1.2s ease-in-out infinite",
                    }}
                  />

                  {/* Duration */}
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: "Poppins, sans-serif",
                      color: "#111B21",
                      minWidth: "48px",
                    }}
                  >
                    {formatDuration(recordingDuration)}
                  </Typography>

                  {/* Spacer */}
                  <Box sx={{ flexGrow: 1 }} />

                  {/* Stop (send) */}
                  <IconButton
                    onClick={stopRecording}
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#25D366",
                      color: "white",
                      mr: 0.5,
                      "&:hover": { backgroundColor: "#20bd5a" },
                    }}
                  >
                    <Stop sx={{ fontSize: 18 }} />
                  </IconButton>

                  {/* Cancel */}
                  <IconButton
                    onClick={cancelRecording}
                    sx={{
                      width: 36,
                      height: 36,
                      color: "#667781",
                      "&:hover": { backgroundColor: "#E8EEF3" },
                    }}
                  >
                    <Close sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ) : (
                <>
                  {/* Uploaded Audio Preview */}
                  {uploadedAudioUrl && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mr: 1,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "18px",
                        backgroundColor: "#F0F2F5",
                        border: "1px solid #E3E6EA",
                      }}
                    >
                      <Mic sx={{ fontSize: 18, color: "#667781" }} />
                      <Typography
                        sx={{
                          fontSize: "12.5px",
                          fontFamily: "Poppins, sans-serif",
                          color: "#111B21",
                          fontWeight: 600,
                        }}
                      >
                        {audioUrl ? formatDuration(Math.floor(audioBlob?.size / 1000 || 0)) : t("Audio ready")}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={clearUploadedAudio}
                        sx={{
                          color: "#667781",
                          p: 0.5,
                          ml: 0.5,
                          "&:hover": { backgroundColor: "#E8EEF3" },
                        }}
                      >
                        <Close sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  )}

                  {/* Microphone Button for Recording */}
                  {!uploadedAudioUrl && (
                    <IconButton
                      onClick={startRecording}
                      disabled={isUploadingAudio || isUploadingImage || isUploadingFile}
                      sx={{
                        mr: 1,
                        color: "#006EC2",
                        "&:hover": {
                          backgroundColor: "#E8F4FD",
                        },
                        "&:disabled": {
                          color: "#ccc",
                        },
                      }}
                    >
                      {isUploadingAudio ? (
                        <CircularProgress size={20} sx={{ color: "#006EC2" }} />
                      ) : (
                        <Mic sx={{ color: "#006EC2", fontSize: 24 }} />
                      )}
                    </IconButton>
                  )}

                  {/* File Upload Button */}
                  <label htmlFor="file-upload">
                    <IconButton
                      component="span"
                      disabled={isUploadingImage || isUploadingFile || isRecording}
                      sx={{
                        mr: 1,
                        color: "#006EC2",
                        "&:hover": {
                          backgroundColor: "#E8F4FD",
                        },
                        "&:disabled": {
                          color: "#ccc",
                        },
                      }}
                    >
                      {(isUploadingImage || isUploadingFile) ? (
                        <CircularProgress size={20} sx={{ color: "#006EC2" }} />
                      ) : (
                        <AttachFile sx={{ color: "#006EC2", fontSize: 22 }} />
                      )}
                    </IconButton>
                  </label>

                  {/* Text Input */}
                  <InputBase
                    placeholder={t("type_message_placeholder")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    sx={{
                      flexGrow: 1,
                      border: "1px solid #E8F4FD",
                      borderRadius: "24px",
                      px: 2,
                      py: 1.2,
                      height: "42px",
                      fontSize: "14px",
                      fontFamily: "Poppins, sans-serif",
                      backgroundColor: "#FFFFFF",
                      "&:focus": {
                        borderColor: "#006EC2",
                        outline: "none",
                      },
                      "&::placeholder": {
                        color: "#7F8C8D",
                      },
                    }}
                  />

                  {/* Send Button */}
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={isSendingMessage || (!newMessage.trim() && !uploadedImageUrl && !uploadedFileUrl && !uploadedAudioUrl)}
                    sx={{
                      ml: 1,
                      backgroundColor: (!newMessage.trim() && !uploadedImageUrl && !uploadedFileUrl && !uploadedAudioUrl) ? "#E8F4FD" : "#006EC2",
                      color: (!newMessage.trim() && !uploadedImageUrl && !uploadedFileUrl && !uploadedAudioUrl) ? "#006EC2" : "white",
                      "&:hover": {
                        backgroundColor: (!newMessage.trim() && !uploadedImageUrl && !uploadedFileUrl && !uploadedAudioUrl) ? "#E8F4FD" : "#0056b3",
                      },
                      "&:disabled": {
                        backgroundColor: "#E8F4FD",
                        color: "#ccc",
                      },
                      width: 40,
                      height: 40,
                    }}
                  >
                    {isSendingMessage ? (
                      <CircularProgress size={20} sx={{ color: "#006EC2" }} />
                    ) : (
                      <Send sx={{ fontSize: 20 }} />
                    )}
                  </IconButton>
                </>
              )}

            </Box>

          )}

        </Box>

      </Box>

      {/* User Selection Dialog */}
      <Dialog
        open={showWorkerList}
        onClose={() => {
          setShowWorkerList(false);
          setSelectedRole(null);
          setWorkers([]);
          setSearchTerm("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "80vh",
          }
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {selectedRole && (
              <IconButton
                onClick={() => {
                  setSelectedRole(null);
                  setWorkers([]);
                  setSearchTerm("");
                  setSelectedUsers([]);
                  setBulkMessage("");
                }}
                size="small"
                sx={{
                  color: "#666",
                  mr: 1,
                }}
              >
                <ArrowBack />
              </IconButton>
            )}
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "20px",
                fontFamily: "Poppins, sans-serif",
                color: "#2C384C",
              }}
            >
              {selectedRole 
                ? `${selectedRole === "account_executive" ? t("Account Executive") : 
                    selectedRole === "company_admin" ? t("Company Admin") : 
                    t("Worker")} - ${t("Select User")}`
                : t("selectUserType")}
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              setShowWorkerList(false);
              setSelectedRole(null);
              setWorkers([]);
              setSearchTerm("");
              setSelectedUsers([]);
              setBulkMessage("");
            }}
            size="small"
            sx={{
              color: "#666",
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {!selectedRole ? (
            // Role Selection Step
            <Box sx={{ p: 2 }}>
              <List>
                <ListItem
                  button
                  onClick={() => {
                    setSelectedRole("account_executive");
                    setSearchTerm(""); // Clear search when selecting role
                    setSelectedUsers([]);
                    setBulkMessage("");
                    fetchWorkers("account_executive");
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    border: "1px solid #E3F2FD",
                    backgroundColor: "#F5FAFF",
                    "&:hover": { backgroundColor: "#E3F2FD" },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "16px",
                          fontFamily: "Poppins, sans-serif",
                          color: "#1976D2",
                        }}
                      >
                        {t("Account Executive")}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#666",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {t("selectAccountExecutive")}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem
                  button
                  onClick={() => {
                    setSelectedRole("company_admin");
                    setSearchTerm(""); // Clear search when selecting role
                    setSelectedUsers([]);
                    setBulkMessage("");
                    fetchWorkers("company_admin");
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    border: "1px solid #F3E5F5",
                    backgroundColor: "#FBF5FF",
                    "&:hover": { backgroundColor: "#F3E5F5" },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "16px",
                          fontFamily: "Poppins, sans-serif",
                          color: "#7B1FA2",
                        }}
                      >
                        {t("Company Admin")}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#666",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {t("selectCompanyAdmin")}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem
                  button
                  onClick={() => {
                    setSelectedRole("worker");
                    setSearchTerm(""); // Clear search when selecting role
                    setSelectedUsers([]);
                    setBulkMessage("");
                    fetchWorkers("worker");
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    border: "1px solid #E8F5E9",
                    backgroundColor: "#F1F8F4",
                    "&:hover": { backgroundColor: "#E8F5E9" },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "16px",
                          fontFamily: "Poppins, sans-serif",
                          color: "#388E3C",
                        }}
                      >
                        {t("Worker")}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#666",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {t("selectWorker")}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Box>
          ) : (
            // User Selection Step
            <>
              {/* Search in Dialog */}
              <Box sx={{ px: 2, pb: 1 }}>
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    height: 40,
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
                      flex: 1,
                    }}
                  />
                  <SearchIcon sx={{ fontSize: 22, color: "#888", mr: 0.5 }} />
                </Box>
              </Box>

              {/* User List in Dialog */}
              <Box sx={{ maxHeight: selectedUsers.length > 0 ? "45vh" : "60vh", overflowY: "auto", px: 1 }}>
                {/* Select All Option */}
                {!isLoadingWorkers && workers.length > 0 && (() => {
                  const filteredWorkers = workers.filter((worker) => {
                    const name = worker.name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
                    const email = worker.email || '';
                    const searchLower = searchTerm.toLowerCase();
                    return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
                  });
                  const allSelected = filteredWorkers.length > 0 && filteredWorkers.every((worker) => selectedUsers.includes(worker.id));
                  const someSelected = filteredWorkers.some((worker) => selectedUsers.includes(worker.id));

                  return (
                    <ListItem
                      button
                      onClick={handleSelectAll}
                      sx={{
                        px: 1,
                        py: 1,
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: "#F5F5F5",
                        border: "1px solid #E0E0E0",
                        "&:hover": { backgroundColor: "#EEEEEE" },
                      }}
                    >
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={handleSelectAll}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          mr: 1,
                          color: "#006EC2",
                          "&.Mui-checked": {
                            color: "#006EC2",
                          },
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "14px",
                          fontFamily: "Poppins, sans-serif",
                          color: "#2C384C",
                        }}
                      >
                        {t("Select All")}
                      </Typography>
                    </ListItem>
                  );
                })()}
                <List>
                  {isLoadingWorkers ? (
                    // Loading skeleton for workers
                    Array.from({ length: 5 }).map((_, index) => (
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
                  ) : workers.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              textAlign: "center",
                              color: "#999",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          >
                            {t("No users available")}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ) : (
                    workers
                      .filter((worker) => {
                        const name = worker.name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
                        const email = worker.email || '';
                        const searchLower = searchTerm.toLowerCase();
                        return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
                      })
                      .map((worker) => {
                        const isSelected = selectedUsers.includes(worker.id);
                        return (
                          <ListItem
                            key={worker.id}
                            button
                            onClick={() => {
                              // Always toggle selection when clicking list item
                              toggleUserSelection(worker.id);
                            }}
                            sx={{
                              px: 1,
                              borderRadius: 2,
                              mb: 0.5,
                              backgroundColor: isSelected ? "#E3F2FD" : "transparent",
                              "&:hover": { backgroundColor: isSelected ? "#BBDEFB" : "#f5f5f5" },
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleUserSelection(worker.id)}
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                mr: 1,
                                color: "#006EC2",
                                "&.Mui-checked": {
                                  color: "#006EC2",
                                },
                              }}
                            />
                            <ListItemAvatar>
                              <Avatar
                                src={
                                  worker.profile_image
                                    ? (worker.profile_image.startsWith('http://') || worker.profile_image.startsWith('https://'))
                                      ? worker.profile_image
                                      : `${url}${worker.profile_image.startsWith('/') ? worker.profile_image.substring(1) : worker.profile_image}`
                                    : undefined
                                }
                              >
                                {worker.name?.charAt(0) || worker.first_name?.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    fontFamily: "Poppins, sans-serif",
                                  }}
                                >
                                  {worker.name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim()}
                                </Typography>
                              }
                              secondary={worker.email}
                              secondaryTypographyProps={{
                                fontSize: "13px",
                                color: "#5C5C5C",
                                fontFamily: "Poppins, sans-serif",
                              }}
                            />
                          </ListItem>
                        );
                      })
                  )}
                </List>
              </Box>

              {/* Bulk Message Input - Show when users are selected */}
              {selectedUsers.length > 0 && (
                <Box
                  sx={{
                    px: 2,
                    py: 2,
                    borderTop: "1px solid #e0e0e0",
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#2C384C",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {t("Send message to")} {selectedUsers.length} {selectedUsers.length === 1 ? t("user") : t("users")}
                    </Typography>
                    {selectedUsers.length === 1 && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          const selectedWorker = workers.find((w) => w.id === selectedUsers[0]);
                          if (selectedWorker) {
                            startNewChat(selectedWorker);
                            setShowWorkerList(false);
                            setSelectedRole(null);
                            setWorkers([]);
                            setSearchTerm("");
                            setSelectedUsers([]);
                            setBulkMessage("");
                          }
                        }}
                        sx={{
                          fontSize: "12px",
                          textTransform: "none",
                          borderColor: "#006EC2",
                          color: "#006EC2",
                          "&:hover": {
                            borderColor: "#0056A3",
                            backgroundColor: "#E3F2FD",
                          },
                        }}
                      >
                        {t("Start Chat")}
                      </Button>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                    <TextField
                      multiline
                      rows={2}
                      fullWidth
                      placeholder={t("Type your message here...")}
                      value={bulkMessage}
                      onChange={(e) => setBulkMessage(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          fontSize: "14px",
                          fontFamily: "Poppins, sans-serif",
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={sendBulkMessage}
                      disabled={!bulkMessage.trim() || isSendingBulkMessage}
                      sx={{
                        backgroundColor: "#006EC2",
                        color: "white",
                        minWidth: "100px",
                        height: "56px",
                        "&:hover": {
                          backgroundColor: "#0056A3",
                        },
                        "&:disabled": {
                          backgroundColor: "#CCCCCC",
                        },
                      }}
                    >
                      {isSendingBulkMessage ? (
                        <CircularProgress size={20} sx={{ color: "white" }} />
                      ) : (
                        <>
                          <Send sx={{ mr: 0.5, fontSize: 18 }} />
                          {t("Send")}
                        </>
                      )}
                    </Button>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedUsers([]);
                      setBulkMessage("");
                    }}
                    sx={{
                      mt: 1,
                      color: "#666",
                      fontSize: "12px",
                      textTransform: "none",
                    }}
                  >
                    {t("Clear selection")}
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Result Modal */}
      <Dialog
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {resultModalData.type === "success" ? (
              <CheckCircleOutline
                sx={{
                  fontSize: 28,
                  color: "#4CAF50",
                }}
              />
            ) : (
              <ErrorOutline
                sx={{
                  fontSize: 28,
                  color: "#F44336",
                }}
              />
            )}
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "20px",
                fontFamily: "Poppins, sans-serif",
                color: "#2C384C",
              }}
            >
              {resultModalData.title}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowResultModal(false)}
            size="small"
            sx={{
              color: "#666",
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: "15px",
              fontFamily: "Poppins, sans-serif",
              color: "#5C5C5C",
              lineHeight: 1.6,
            }}
          >
            {resultModalData.message}
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={() => setShowResultModal(false)}
            sx={{
              backgroundColor: resultModalData.type === "success" ? "#4CAF50" : "#006EC2",
              color: "white",
              textTransform: "none",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                backgroundColor: resultModalData.type === "success" ? "#45A049" : "#0056A3",
              },
            }}
          >
            {t("OK")}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>

  );

};



export default Messages;













