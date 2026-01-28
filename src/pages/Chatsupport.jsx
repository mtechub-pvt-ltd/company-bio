import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import { Avatar, Box, CircularProgress, Divider, Grid, IconButton, InputAdornment, OutlinedInput, Stack, } from "@mui/material";
import TypographyMD from "../components/items/Typography";
import send_icon from "../Assets/send_icon.png";
import Topbar from "../components/topbar/Topbar";
import url from "../url";
import logo_spanish from "../Assets/logo_spanish.png";
import logo_english from "../Assets/logo_english.png";

import moment from "moment";
import { io } from "socket.io-client";
import empty_chat from "../Assets/empty_chat.png";
import { Search } from "@mui/icons-material";
import toast from "react-hot-toast";

// const userId = 200148;  // Logged-in user
// const recipientId = 200090;  // Recipient user 
// const roomId = `room_${Math.min(userId, recipientId)}_${Math.max(userId, recipientId)}`;

function ChatSupport() {
    // This is the current state to hold recipientId and roomId
    const [userId, setUserId] = useState(null);
    const [recipientId, setRecipientId] = useState(null);
    const [roomId, setRoomId] = useState(null);

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [image, setImage] = useState(null);
    const [socket, setSocket] = useState(null);

    const getPreviousChat = async (roomId) => {
        const InsertAPIURL = `${url}fetch/user/chat?room_id=${roomId}`;
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {
               
                if (response?.error === false) {
                    setMessages(response.data); // Set previous messages
                }
            })
            .catch(error => {
            toast.error("Something went wrong! Please try again.");
            });
    };

    const [contacts, setContacts] = useState([]);
    const fetchUserContacts = async (userId) => {

        var InsertAPIURL = `${url}fetch/contacts?sender_id=${userId}`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {


                if (response?.error == false) {
                    // Assuming `data.data` is an array of messages
                    setContacts(response.data); // Set previous messages
                }

            }
            )
            .catch(error => {

                toast.error("Something went wrong! Please try again.");
            });

    }

    const [activeContactRoomId, setActiveContactRoomId] = useState(null);
    const [contact, setContact] = useState(null);

    // Function to handle dynamic recipientId and roomId
    const handleContactClick = (contact) => {
     
        setContact(contact);

        // Check if the contact's receiver_id is different from the logged-in user's ID
        const dynamicRecipientId = contact.sender_id === userId ? contact.receiver_id : contact.sender_id;
        const dynamicRoomId = `room_${Math.min(userId, dynamicRecipientId)}_${Math.max(userId, dynamicRecipientId)}`;

    

        // Update the state with dynamic recipientId and roomId
        setRecipientId(dynamicRecipientId);
        setRoomId(dynamicRoomId);  // Update roomId based on dynamic recipientId

        setActiveContactRoomId(dynamicRoomId); // <-- Set active contact room

        // Fetch previous messages for the dynamic room
        getPreviousChat(dynamicRoomId);
    };

    useEffect(() => {

        const storedUserId = JSON.parse(localStorage.getItem("ID_User"));

       

        if (storedUserId) {
            setUserId(Number(storedUserId?.data?.user_id)); // convert to number if needed
        }

        fetchUserContacts(storedUserId?.data?.user_id);
        getPreviousChat(messages);

    }, []);

    useEffect(() => {
        if (!roomId) return; // Don't establish socket if roomId is not set

        const newSocket = io(url);

        newSocket.on("connect", () => {
           
            newSocket.emit("registerUser", userId);
            newSocket.emit("joinRoom", { userId, roomId });
        });

        newSocket.on("message", (msg) => {
         
            setMessages((prev) => [...prev, msg]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [roomId]); // Re-run the effect whenever the roomId changes

    const sendMessage = () => {
        if ((message.trim() || image) && socket && roomId) {
            const createdAt = new Date().toISOString();

            const reader = new FileReader();

            if (image) {
                reader.readAsDataURL(image);
                reader.onloadend = () => {
                    const base64Image = reader.result.split(",")[1];
                    socket.emit("sendMessage", {
                        sender_id: userId,
                        receiver_id: recipientId,
                        room_id: roomId, // Dynamically use roomId
                        message,
                        image: base64Image,
                        created_at: createdAt,
                        message_type: "image",
                    });
                };
            } else {
                socket.emit("sendMessage", {
                    sender_id: userId,
                    receiver_id: recipientId,
                    room_id: roomId, // Dynamically use roomId
                    message,
                    created_at: createdAt,
                    message_type: "text",
                });
            }

            setMessage("");
            setImage(null);
        }
    };

    const [initialLoader, setInitialLoader] = useState(true);

    useEffect(() => {
        // Simulate a 2-second loading time
        const timer = setTimeout(() => {
            setInitialLoader(false);
        }, 3000);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, []);

    const [searchTerm, setSearchTerm] = useState('');

    const filterContacts = contacts?.filter(contact =>
        contact?.username?.toLowerCase().includes(searchTerm.toLowerCase())
        //  ||
        // contact?.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Sidebar
                componentData={
                    <Box sx={{ width: "100%", overflowX: "hidden" }} height="100vh">
                        <Grid container spacing={0}>
                            <Grid xs={12} md={12} align="" >
                                <Box sx={{ borderBottom: "1px solid rgb(16, 16, 16, 0.1)", backgroundColor: "#ffffff" }}>
                                    <Grid container spacing={0}>
                                        <Grid xs={12} md={4} align="" >
                                            <Stack sx={{ mt: { xs: 1.5, md: .5 } }} p={2.5} pb={0}>
                                                <TypographyMD variant='paragraph' label="Chat Support" color="#424242" marginLeft={0} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="left" />
                                            </Stack>
                                        </Grid>

                                        <Grid xs={12} md={8} align="" >
                                            <Stack p={2.5}>
                                                <div style={{ display: "flex", justifyContent: "right", alignContent: "right", gap: "10px" }}>
                                                    <div>
                                                        <Topbar />
                                                    </div>
                                                </div>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>

                      
                            {initialLoader ? (
                                <div style={{
                                    height: "50vh",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>

                                    <CircularProgress size={20} thickness={3} color="primary" />

                                </div>
                            ) : (
                                <>
                                    <div style={{ marginTop: "40px" }}></div>

                                    <Grid
                                        container
                                        spacing={0}
                                        justifyContent="center"
                                        alignItems="center"
                                        sx={{
                                            width: "100%",
                                            padding: "20px 0",
                                        }}
                                    >
                                        <Grid
                                            container
                                            spacing={0}
                                            sx={{
                                                width: "90%",
                                                maxWidth: "1200px",
                                                height: "calc(100vh - 200px)", // e.g. subtract 100px for header/margins
                                                maxHeight: "600px",             // Optional max cap
                                                minHeight: "400px",
                                                borderRadius: "15px",
                                                backgroundColor: "#ffffff",
                                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                                                overflow: "hidden", // Prevent scroll from child overflow 

                                            }}
                                        >
                                            {contacts?.length === 0 ?
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",  // This centers vertically
                                                        height: "100%",         // Make sure parent has height
                                                    }}
                                                >
                                                    <img
                                                        src={empty_chat}
                                                        style={{
                                                            width: "90%",
                                                            height: "50vh",
                                                            objectFit: "contain"
                                                        }}
                                                        alt="Empty Chat"
                                                    />
                                                </div>
                                                :
                                                <>
                                                    {/* Left: Contact List */}
                                                    <Grid
                                                        item
                                                        xs={4}
                                                        md={4}
                                                        sx={{
                                                            borderRight: "1px solid #ccc",
                                                            maxWidth: "1200px",
                                                            height: "calc(100vh - 200px)", // e.g. subtract 100px for header/margins
                                                            maxHeight: "600px",
                                                            overflowY: "auto",
                                                        }}
                                                    >
                                                        <div style={{ padding: "16px" }}>
                                                            <h6 style={{ fontWeight: 650, marginBottom: "12px" }}>Messages</h6>
                                                            {/* contacts
                                         */}

                                                            <Divider />

                                                            <div>
                                                                <Box sx={{ mt: { xs: 1, md: 1.5 }, mb: 2, backgroundColor: "#F4F6FA", border: "1px solid white", borderRadius: "10px", width: "100%" }}>
                                                                    <OutlinedInput
                                                                    autoComplete="off"
                                                                        placeholder={t('Search here')}
                                                                        id="input-with-icon-adornment"
                                                                        sx={{
                                                                            width: "100%",
                                                                            fontSize: "15px",
                                                                            height: "35px",
                                                                            "& fieldset": { border: 'none' },
                                                                        }}
                                                                        endAdornment={
                                                                            <InputAdornment position="end">

                                                                                <IconButton edge="end" >
                                                                                    <Search sx={{ fontSize: "15px", color: "#222" }} />
                                                                                </IconButton>

                                                                            </InputAdornment>
                                                                        }
                                                                        value={searchTerm}
                                                                        onChange={e => setSearchTerm(e.target.value)}
                                                                    />
                                                                </Box>
                                                            </div>

                                                            {filterContacts.length == 0 ?
                                                                <div
                                                                    style={{
                                                                        flex: 1,
                                                                        // border: "1px solid #e0e0e0",
                                                                        borderRadius: "10px",
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignContent: "center",
                                                                        alignItems: "center",
                                                                        backgroundColor: "transparent",
                                                                        fontSize: "13px",
                                                                        fontWeight: 750
                                                                    }}
                                                                >
                                                                    No Contacts
                                                                </div>
                                                                :
                                                                <>
                                                                    {filterContacts?.map((contact, index) => {
                                                                        const contactRecipientId = contact.receiver_id === userId ? contact.sender_id : contact.receiver_id;
                                                                        const contactRoomId = `room_${Math.min(userId, contactRecipientId)}_${Math.max(userId, contactRecipientId)}`;
                                                                        const isActive = contactRoomId === activeContactRoomId;

                                                                        return (
                                                                            <div
                                                                                key={index}
                                                                                onClick={() => handleContactClick(contact)}
                                                                                style={{
                                                                                    padding: "10px",
                                                                                    marginBottom: "8px",
                                                                                    borderRadius: "8px",
                                                                                    cursor: "pointer",
                                                                                    backgroundColor: isActive ? "#2152CD" : "transparent", // Dark blue
                                                                                    color: isActive ? "white" : "inherit", // Text color white when active
                                                                                }}
                                                                            >
                                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                                        <Avatar variant="square" src={contact?.profile_image} sx={{ borderRadius: "10px" }} />
                                                                                        <div>
                                                                                            <div style={{ fontWeight: 750 }}>{contact?.username}</div>
                                                                                            <div style={{
                                                                                                fontSize: "11px",
                                                                                                color: isActive ? "#ccc" : "#666", // Lighter gray if active
                                                                                                marginTop: "0px",
                                                                                                maxWidth: "180px",
                                                                                                whiteSpace: "nowrap",
                                                                                                overflow: "hidden",
                                                                                                textOverflow: "ellipsis"
                                                                                            }}>
                                                                                                {contact?.message ? contact.message : contact?.image ? "📷 File" : "File"}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div style={{ fontSize: "11px", color: isActive ? "#ccc" : "#999" }}>
                                                                                        {contact?.created_at ? moment(contact?.created_at).format("hh:mm A") : ""}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </>}

                                                        </div>
                                                    </Grid>

                                                    {/* Right: Chat Window */}
                                                    <Grid item xs={8} md={8}>
                                                        <div
                                                            style={{
                                                                maxWidth: "1200px",
                                                                height: "calc(100vh - 200px)", // e.g. subtract 100px for header/margins
                                                                maxHeight: "600px",
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                padding: "16px",
                                                            }}
                                                        >
                                                            {messages?.length === 0 || messages == undefined || null ?
                                                                <div
                                                                    style={{
                                                                        flex: 1,
                                                                        // border: "1px solid #e0e0e0",
                                                                        borderRadius: "10px",
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignContent: "center",
                                                                        alignItems: "center",
                                                                        backgroundColor: "transparent",
                                                                        fontSize: "13px",
                                                                        fontWeight: 750
                                                                    }}
                                                                >
                                                                    No Chat Opened Yet!
                                                                </div>
                                                                :
                                                                <>
                                                                    <h6 style={{ fontWeight: 650, marginBottom: "12px" }}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                            <Avatar variant="square" src={contact?.profile_image} sx={{ borderRadius: "10px" }} />
                                                                            <div>
                                                                                <div style={{ fontWeight: 750 }}>{contact?.username}</div>
                                                                            </div>
                                                                        </div>
                                                                    </h6>

                                                                    <Divider />

                                                                    {/* Chat Container */}
                                                                    <div
                                                                        style={{
                                                                            marginTop: "15px",
                                                                            flex: 1,
                                                                            overflowY: "auto",
                                                                            // border: "1px solid #e0e0e0",
                                                                            borderRadius: "10px",
                                                                            padding: "16px",
                                                                            display: "flex",
                                                                            flexDirection: "column",
                                                                            gap: "12px",
                                                                            backgroundColor: "transparent",
                                                                        }}
                                                                    >
                                                                        {messages.map((msg, index) => (
                                                                            <>
                                                                                <div
                                                                                    key={index}
                                                                                    style={{
                                                                                        marginLeft: "-12px",
                                                                                        display: "flex",
                                                                                        flexDirection: msg.sender_id === userId ? "row-reverse" : "row",
                                                                                        alignItems: "center",
                                                                                        gap: "8px",
                                                                                    }}
                                                                                >
                                                                                    {/* Icon */}
                                                                                    <Avatar variant="square" src={msg.sender_id === userId ? logo : contact?.profile_image} sx={{
                                                                                        width: "35px",
                                                                                        height: "35px",
                                                                                        borderRadius: "10px",
                                                                                        // objectFit: "cover",
                                                                                    }} />

                                                                                    {/* Message Bubble */}
                                                                                    <div
                                                                                        style={{
                                                                                            backgroundColor: msg.sender_id === userId ? "#007bff" : "#F1F6FF",
                                                                                            color: msg.sender_id === userId ? "#ffffff" : "#333333",
                                                                                            padding: "10px 14px",
                                                                                            borderRadius: "10px",
                                                                                            maxWidth: "75%",
                                                                                            fontSize: "14px",
                                                                                            lineHeight: "1.4",
                                                                                            textAlign: msg.sender_id === userId ? "right" : "left",
                                                                                            wordBreak: "break-word",
                                                                                        }}
                                                                                    >
                                                                                        {msg.message}
                                                                                    </div>
                                                                                </div>

                                                                                {/* <small
                                                                                style={{
                                                                                    color: "#888888",
                                                                                    fontSize: "11px",
                                                                                    marginTop: "0-2px",
                                                                                    marginLeft: msg.sender_id === userId ? "auto" : "0",
                                                                                }}
                                                                            >
                                                                                {moment(msg.created_at).format("hh:mm A")}
                                                                            </small> */}
                                                                            </>
                                                                        ))}
                                                                    </div>

                                                                    {/* Input Area */}
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            marginTop: "12px",
                                                                            gap: "10px",
                                                                        }}
                                                                    >
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => setImage(e.target.files[0])}
                                                                            style={{ display: "none" }}
                                                                            id="image-upload"
                                                                        />
                                                                        <label
                                                                            htmlFor="image-upload"
                                                                            style={{
                                                                                backgroundColor: "#eee",
                                                                                padding: "8px 12px",
                                                                                borderRadius: "12px",
                                                                                cursor: "pointer",
                                                                                fontSize: "14px",
                                                                            }}
                                                                        >
                                                                            📎
                                                                        </label>

                                                                        {/* Input + Button wrapper */}
                                                                        <div style={{ position: "relative", flexGrow: 1 }}>
                                                                            <input
                                                                                type="text"
                                                                                value={message}
                                                                                onChange={(e) => setMessage(e.target.value)}
                                                                                placeholder={t("Type a message...")}
                                                                                style={{
                                                                                    width: "100%",
                                                                                    padding: "10px 14px",
                                                                                    paddingRight: "80px", // Extra space for Send button
                                                                                    fontSize: "14px",
                                                                                    borderRadius: "20px",
                                                                                    border: "1px solid #ccc",
                                                                                    outline: "none",
                                                                                    backgroundColor: "transaprent",
                                                                                }}
                                                                            />

                                                                            <IconButton style={{
                                                                                position: "absolute",
                                                                                right: "8px",
                                                                                top: "50%",
                                                                                transform: "translateY(-50%)",
                                                                                // backgroundColor: "#007bff",
                                                                                // color: "#fff",
                                                                                border: "none",
                                                                                padding: "8px 16px",
                                                                                borderRadius: "20px",
                                                                                cursor: "pointer",
                                                                                fontWeight: "bold",
                                                                                fontSize: "14px",
                                                                            }} onClick={sendMessage}>
                                                                                <img src={send_icon} alt="send message" style={{ width: "30px" }} />
                                                                            </IconButton>
                                                                        </div>
                                                                    </div>
                                                                </>}
                                                        </div>
                                                    </Grid>
                                                </>}
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                        
                    </Box >
                }
            />



        </>
    )
}

export default ChatSupport;