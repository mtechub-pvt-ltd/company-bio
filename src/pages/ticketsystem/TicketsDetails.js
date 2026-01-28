import React, { useEffect, useMemo, useState } from "react";
import { Box, Avatar, CircularProgress, IconButton, Tooltip } from "@mui/material";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CustomText, { textStyles } from "../../components/CustomText";
import StatusDropdown from "../../components/StatusDropdown";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import GetAppIcon from '@mui/icons-material/GetApp';

import url from "../../url";
// assets
import back from "../../Assets/back.svg";
import details from "../../Assets/tickets/details.svg";
import down from "../../Assets/down.svg";
import proofPlaceholder from "../../Assets/tickets/proof.png";
import dummy from "../../Assets/dummy.png";

import TicketStatusDropdown from "../../components/TicketStatusDropdown";
import { useSelector } from "react-redux";

const FieldRow = ({ label, value, right }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
    <CustomText sx={{ ...textStyles.h1, fontSize: 16, color: "#5E5C5C", fontWeight: 400 }}>{label}</CustomText>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {right || (
        <CustomText sx={{ ...textStyles.h1, fontSize: 14, fontWeight: 400, color: "#172B4D" }}>
          {value ?? "-"}
        </CustomText>
      )}
    </Box>
  </Box>
);

const Badge = ({ text }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      px: 1,
      py: 0.6,
      borderRadius: 1,
      background: "#091E4224",
      color: "#003149",
      fontSize: 12,
    }}
  >
    {text}
  </Box>
);

export default function TicketDetails({ ticketId: propTicketId, onBack }) {
  const { t } = useTranslation();
  const ticketId = propTicketId;

  const [state, setState] = useState({
    loading: true,
    error: null,
    ticket: null,
    comments: [],
    attachments: [],
    permissions: undefined,
  });

  const rawEncryptedToken = localStorage.getItem("token");
  const { token } = useSelector((state) => state.auth);

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        const res = await fetch(`${url}/tickets/${ticketId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const json = await res.json();
        console.log("tickets details data", json)
        const data = json?.data ?? {};
        setState({
          loading: false,
          error: null,
          ticket: data.ticket ?? null,
          comments: Array.isArray(data.comments) ? data.comments : [],
          attachments: Array.isArray(data.attachments) ? data.attachments : [],
          permissions: data.permissions,
        });
      } catch (err) {
        console.error("❌ TicketDetails fetch error:", err);
        setState((s) => ({ ...s, loading: false, error: err.message }));
      }
    })();
  }, [ticketId, token]);

  const { loading, ticket, comments, attachments } = state;
  console.log("attachments", attachments)
  console.log("ticket", ticket)

  const formattedCreatedAt = useMemo(() => {
    if (!ticket?.created_at) return "-";
    const d = new Date(ticket.created_at);
    return d
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", " -");
  }, [ticket?.created_at]);



  const commentBadge = (c) => c?.comment_type || c?.type || "Unknown";

  // -------- Status list (for dropdown) ----------
  const [statuses, setStatuses] = useState([]);
  useEffect(() => {
    async function fetchStatuses() {
      try {
        const res = await fetch(`${url}/tickets/statuses`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        const arr = json?.data?.statuses || [];
        setStatuses(arr.map((s) => s.value));
      } catch (err) {
        console.error("Failed to load statuses", err);
      }
    }
    fetchStatuses();
  }, [token]);

  async function handleStatusChange(value) {
    try {
      setUpdating(true);
      const res = await fetch(`${url}/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: value }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.message || "Failed to update status");
        return;
      }

      if (!json.error && json.data?.ticket) {
        setState((prev) => ({
          ...prev,
          ticket: { ...(prev.ticket || {}), ...json.data.ticket },
        }));
      }
    } catch (err) {
      console.error("Failed to update ticket status", err);
    } finally {
      setUpdating(false);
    }
  }
  /// image upload
  const [imageUrls, setImageUrls] = useState([]);      // uploaded URLs to send in add-comment
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);


  async function uploadImage(file) {
    const form = new FormData();
    // if your backend expects "file" instead of "image", change the key accordingly
    form.append("image", file);

    const res = await fetch(`${url}/upload/image`, {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    if (!res.ok || json.error || !json?.data?.url) {
      throw new Error(json?.message || "Upload failed");
    }
    return json.data.url;
  }

  async function handlePickFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);
      for (const f of files) {
        const url = await uploadImage(f);
        console.log("✅ Image uploaded:", url);
        toast.success("Image uploaded successfully.");
        setImageUrls((prev) => [...prev, url]);
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImageUrl(idx) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }


  // -------- Add comment ----------
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  async function handleAddComment() {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    try {
      setAddingComment(true);
      const formData = new FormData();
      formData.append("content", newComment);
      formData.append("isInternal", "false");

      if (imageUrls.length) {
        formData.append("imageUrls", JSON.stringify(imageUrls)); // backend expects JSON array string
      }

      const res = await fetch(`${url}/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.message || "Failed to add comment");
        return;
      }

      console.log("📝 Comment submitted with imageUrls:", imageUrls);
      toast.success("Comment added successfully");

      if (json.data?.comment) {
        setState((s) => ({ ...s, comments: [json.data.comment, ...s.comments] }));
      }

      setNewComment("");
      setImageUrls([]); // clear thumbnails after posting
    } catch (err) {
      console.error("Failed to add comment:", err);
      toast.error("Something went wrong");
    } finally {
      setAddingComment(false);
    }
  }


  const [priorities, setPriorities] = useState([]);
  const [updatingPriority, setUpdatingPriority] = useState(false);

  useEffect(() => {
    async function fetchPriorities() {
      try {
        const res = await fetch(`${url}/tickets/priorities`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        const arr = json?.data?.priorities || [];
        setPriorities(arr.map((p) => p.value)); // ["low","medium","high","critical"]
      } catch (err) {
        console.error("Failed to load priorities", err);
      }
    }
    if (token) fetchPriorities();
  }, [token]);

  async function handlePriorityChange(value) {
    try {
      setUpdatingPriority(true);

      const res = await fetch(`${url}/tickets/${ticketId}/priority`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priority: value }),
      });

      const json = await res.json();
      toast.success(json.message);

      if (!res.ok || json.error) {
        toast.error(json.message || "Failed to update priority");
        return;
      }

      // Update in-place
      setState((prev) => ({
        ...prev,
        ticket: { ...(prev.ticket || {}), priority: value },
      }));

      // toast.success("Priority updated");
    } catch (err) {
      console.error("Failed to update ticket priority", err);
      toast.error("Something went wrong");
    } finally {
      setUpdatingPriority(false);
    }
  }

  if (!ticketId) {
    return (
      <Box sx={{ p: 2 }}>
        <CustomText sx={{ ...textStyles.h1, fontSize: 16, color: "#5E5C5C" }}>
          {t("ticketsTable.empty") || "No ticket selected"}
        </CustomText>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "70vh",
        }}
      >
        <CircularProgress size={40} thickness={4} sx={{ color: "#006EC2" }} />
      </Box>
    );
  }
  const normalizeUrl = (u) => {
    if (!u) return null;
    // ensure string + trim + remove any accidental surrounding quotes
    const s = String(u).trim().replace(/^['"]+|['"]+$/g, "");
    if (!s) return null;
    // already absolute? use as-is
    if (/^https?:\/\//i.test(s)) return s;
    // backend-relative path → prefix with BASE_URL (avoid double slash issues)
    return `${url}${s.startsWith("/") ? "" : "/"}${s}`;
  };
  const getAttachmentUrl = (att) => {
    if (!att?.file_path) return null;
    
    // Remove leading slash from file_path to avoid double slashes
    const cleanPath = att.file_path.startsWith("/") ? att.file_path.slice(1) : att.file_path;
    const fullUrl = `${url}${cleanPath}`;
    return fullUrl;
  };

  // Alternative URL construction methods for debugging
  const getAlternativeAttachmentUrl = (att) => {
    if (!att?.file_path) return null;
    
    // Method 1: Direct path (what we're using now)
    const cleanPath = att.file_path.startsWith("/") ? att.file_path.slice(1) : att.file_path;
    const url1 = `${url}${cleanPath}`;
    
    // Method 2: Keep the leading slash but remove trailing slash from base URL
    const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    const url2 = `${baseUrl}${att.file_path}`;
    
    // Method 3: Direct file path without base URL (if it's already absolute)
    const url3 = att.file_path.startsWith("http") ? att.file_path : null;
    
    console.log("🔍 Alternative URLs for debugging:", {
      fileName: att.file_name,
      method1: url1,
      method2: url2,
      method3: url3,
    });
    
    return url1; // Return the primary method
  };
  return (
    <Box sx={{ py: 2, px: 1 }}>
      {/* Top bar */}
      <Box
        display="flex" gap={1} px={1.5} p={1} bgcolor={'white'} borderRadius={2} py={1.5} border={'2px solid #dcdfe4'}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={onBack}>
          <img src={back} style={{ width: 30, height: 30 }} />
          <CustomText sx={{ ...textStyles.h1, fontWeight: 500, fontSize: "14px", color: "#626F86" }}>
            {t("ticketDetails.back")} / {ticket?.subject ?? "-"}
          </CustomText>
        </Box>
      </Box>

      {/* Header block */}
      <Box sx={{ background: "#fff", mt: 1 }}>
        <Box sx={{ p: 2 }} borderRadius={2} py={1.5} border={'2px solid #dcdfe4'}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <img src={details} alt="details" />
              <CustomText sx={{ ...textStyles.h1, fontWeight: 500, fontSize: "14px", color: "#172B4D" }}>
                {ticket?.ticket_id ? ticket.ticket_id.substring(0, 6) : "-"}
              </CustomText>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <TicketStatusDropdown
                currentStatus={ticket?.status ?? "open"}
                statusOptions={statuses}
                onChange={handleStatusChange}
                loading={updating}
              />
            </Box>
          </Box>

          <CustomText
            sx={{ ...textStyles.h1, fontSize: 20, fontWeight: 600, mt: 3, color: "#003149", textAlign: "left" }}
          >
            {ticket?.subject ?? "-"}
          </CustomText>

          <CustomText
            sx={{
              ...textStyles.h1,
              fontSize: 16,
              fontWeight: 400,
              lineHeight: "24px",
              textAlign: "left",
              color: "#5E5C5C",
              mt: 2,
            }}
          >
            {ticket?.description || t("ticketDetails.header.description")}
          </CustomText>

          {/* Details */}
          <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr" }, gap: 2 }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CustomText sx={{ ...textStyles.h1, fontSize: 18, fontWeight: 600, color: "#000" }}>
                  {t("ticketDetails.taskDetails")}
                </CustomText>
                <img src={down} width={40} height={30} />
              </Box>
              <FieldRow label={t("ticketDetails.fields.createdBy")} value={ticket?.creator_name ?? "-"} />
              <FieldRow label={t("ticketDetails.fields.createdOn")} value={formattedCreatedAt} />
              <FieldRow
                label={t("ticketDetails.fields.priority")}
                right={

                  //         <TicketStatusDropdown
                  //   currentStatus={ticket?.priority ?? "low"}
                  //   statusOptions={priorities}
                  //   onChange={handlePriorityChange}
                  //   loading={updatingPriority}
                  // />
                  <Box sx={{ pointerEvents: "none" }}>
                    <StatusDropdown currentStatus={ticket?.priority ?? "low"} />
                  </Box>
                }
              />
              <FieldRow label={t("ticketDetails.fields.type")} value={ticket?.category ?? "-"} />
            </Box>

            {/* Attachments */}


            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {attachments.length === 0 ? (
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: 1,
                    mt: 2,
                    overflow: "hidden",
                    bgcolor: "#00000005",
                    position: "relative",
                  }}
                >
                  <img
                    src={proofPlaceholder}
                    alt="proof"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
              ) : (
                attachments.map((att) => {
                  const url = getAttachmentUrl(att);
                  
                 
                  
                  return (
                    <Box
                      key={att.attachment_id}
                      sx={{
                        width: 150,
                        height: 150,
                        borderRadius: 1,
                        mt: 2,
                        overflow: "hidden",
                        bgcolor: "#00000005",
                        position: "relative", // important for overlay
                      }}
                    >
                      <img
                        src={url}
                        alt={att.file_name || ""}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        loading="lazy"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          console.error("❌ Attachment image failed to load:", {
                            url: e.currentTarget.src,
                            fileName: att.file_name,
                            attachmentId: att.attachment_id,
                            error: e
                          });
                          
                          // Try alternative URL format
                          const alternativeUrl = getAlternativeAttachmentUrl(att);
                          if (alternativeUrl && alternativeUrl !== e.currentTarget.src) {
                            console.log("🔄 Trying alternative URL:", alternativeUrl);
                            e.currentTarget.src = alternativeUrl;
                          } else {
                            e.currentTarget.src = proofPlaceholder;
                          }
                        }}
                        onLoad={(e) => {
                          console.log("✅ Attachment image loaded successfully:", {
                            url: e.currentTarget.src,
                            fileName: att.file_name,
                            attachmentId: att.attachment_id
                          });
                        }}
                      />
                      {/* Small download button overlay */}
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(255,255,255,0.8)",
                          "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                        }}
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = att.file_name || "attachment";
                          link.click();
                        }}
                      >
                        <GetAppIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })
              )}
            </Box>

            {/* Debug section for attachments - remove this in production */}
          

          </Box>
        </Box>
      </Box>

      {/* Add Comment */}
      <Box sx={{ p: 2, background: "#fff", mt: 2, border: '2px solid #dcdfe4', borderRadius: 1 }}>
        <CustomText sx={{ ...textStyles.h1, fontSize: 18, fontWeight: 600, color: "#000", textAlign: "left" }}>
          {t("ticketDetails.addComment")}
        </CustomText>


        <Box sx={{ 
          display: "flex", 
          gap: { xs: 0.5, sm: 1 }, 
          mt: 1, 
          alignItems: "center",
          flexWrap: { xs: "wrap", sm: "nowrap" }
        }}>
          {/* Left slot: either the attach icon or the thumbnails */}
          {imageUrls.length === 0 ? (
            <Tooltip title={uploading ? "Uploading..." : "Attach image(s)"}>
              <span>
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || addingComment}
                  size="small"
                  sx={{ 
                    border: "1px dashed #B6C2CF",
                    minWidth: { xs: 36, sm: 40 },
                    minHeight: { xs: 36, sm: 40 }
                  }}
                >
                  {uploading ? <CircularProgress size={16} /> : <AttachFileRoundedIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 0.75 }, flexWrap: "wrap" }}>
              {imageUrls.slice(0, 3).map((url, idx) => {
                const finalUrl = normalizeUrl(url);
                console.log("🖼 Rendering thumbnail:", { raw: url, normalized: finalUrl });

                return (
                  <Box
                    key={url + idx}
                    sx={{
                      width: { xs: 35, sm: 40 },
                      height: { xs: 35, sm: 40 },
                      position: "relative",
                      borderRadius: 5,
                      border: "1px solid #E4E6EF",
                      bgcolor: "#FAFBFC",
                    }}
                  >
                    {/* inner wrapper just for image clipping */}
                    <Box sx={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 5 }}>
                      <img
                        crossOrigin="anonymous"
                        src={finalUrl}
                        alt={`thumb-${idx}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>

                    {/* cross floats outside the top-right corner */}
                    <IconButton
                      onClick={() => removeImageUrl(idx)}
                      sx={{
                        width: { xs: 16, sm: 18 },
                        height: { xs: 16, sm: 18 },
                        fontSize: { xs: 10, sm: 12 },
                        position: "absolute",
                        top: { xs: -6, sm: -8 },
                        right: { xs: -6, sm: -8 },
                        bgcolor: "#fff",
                        boxShadow: 1,
                        "&:hover": { bgcolor: "#fff" },
                      }}
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}

              {imageUrls.length > 3 && (
                <Box
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    borderRadius: 1,
                    border: "1px dashed #B6C2CF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: { xs: 10, sm: 12 },
                    color: "#5E5C5C",
                  }}
                  title={imageUrls.slice(3).join("\n")}
                >
                  +{imageUrls.length - 3}
                </Box>
              )}
            </Box>
          )}

          {/* Hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handlePickFiles}
          />

          {/* Comment input */}
          <input
            className="project_input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("ticketDetails.input.commentPlaceholder")}
            style={{ 
              flex: 1, 
              height: 40,
              minWidth: { xs: "200px", sm: "250px" }
            }}
            disabled={addingComment}
          />

          {/* Add button */}
          <button
            onClick={handleAddComment}
            disabled={addingComment}
            style={{
              padding: { xs: "0 12px", sm: "0 16px" },
              background: "#006EC2",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              fontFamily: "Poppins, sans-serif",
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: addingComment ? "not-allowed" : "pointer",
              minWidth: { xs: "60px", sm: "80px" },
              fontSize: { xs: "12px", sm: "14px" }
            }}
          >
            {addingComment && <CircularProgress size={16} thickness={5} sx={{ color: "#fff" }} />}
            <span>{t("common.add")}</span>
          </button>
        </Box>

        {/* Comments & Audits */}
        <Box sx={{ mt: 2, borderRadius: 2 }}>
          {comments.length === 0 ? (
            <CustomText sx={{ ...textStyles.h1, fontSize: 14, color: "#5E5C5C" }}>
              {t("ticketsTable.empty")}
            </CustomText>
          ) : (
            comments.map((c) => {
              const key = c.comment_id || c.id || c.created_at;

              // AUDIT ROW: same bordered row, but only a centered badge with action text
              if (c?.type === "audit") {
                const label = c?.content || c?.action_type || "Audit";
                return (
                  <Box key={key} sx={{ p: 2, borderBottom: "1px solid #EEF2F7" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Badge text={label} />
                    </Box>
                  </Box>
                );
              }

              // COMMENT ROW: existing full layout
              return (
                <Box key={key} sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: "1px solid #EEF2F7" }}>
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: { xs: 1, sm: 1.6 },
                      width: { xs: "100%", sm: "auto" }
                    }}>
                      <Avatar
                        src={
                          c.user_avatar ||
                          (Array.isArray(c.image_urls) && c.image_urls.length > 0
                            ? normalizeUrl(c.image_urls[0])   // first uploaded image
                            : dummy)
                        }
                        alt={c.user_name || "user"}
                        sx={{ 
                          width: { xs: 40, sm: 50 }, 
                          height: { xs: 40, sm: 50 }, 
                          borderRadius: "50%" 
                        }}
                        imgProps={{
                          crossOrigin: "anonymous",          // try anonymous CORS fetch
                          referrerPolicy: "no-referrer",     // avoid referer blocks
                          onError: (e) => {
                            console.error("❌ Avatar failed to load", {
                              url: e.currentTarget.src,
                              commentId: c.id || c.comment_id,
                              user: c.user_name,
                            });
                            // fallback to dummy
                            e.currentTarget.src = dummy;
                          },
                          onLoad: (e) => {
                            console.log("✅ Avatar loaded OK", {
                              url: e.currentTarget.src,
                              commentId: c.id || c.comment_id,
                              user: c.user_name,
                            });
                          },
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <CustomText sx={{ 
                          ...textStyles.h1, 
                          fontSize: { xs: 16, sm: 20 }, 
                          color: "#100F0F", 
                          fontWeight: 700,
                          wordBreak: "break-word"
                        }}>
                          {c.user_name || "-"}
                        </CustomText>
                        <CustomText sx={{ 
                          ...textStyles.h1, 
                          fontSize: { xs: 12, sm: 14 }, 
                          color: "#5E5C5C", 
                          fontWeight: 400, 
                          pt: 0.8 
                        }}>
                          {c.user_role || "-"}
                        </CustomText>
                        <CustomText sx={{ 
                          ...textStyles.h1, 
                          fontSize: { xs: 13, sm: 14 }, 
                          color: "#5E5C5C", 
                          fontWeight: 400, 
                          mt: 1,
                          wordBreak: "break-word",
                          lineHeight: 1.4
                        }}>
                          {c.content || "-"}
                        </CustomText>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 1,
                      justifyContent: { xs: "flex-start", sm: "flex-end" },
                      width: { xs: "100%", sm: "auto" },
                      mt: { xs: 0.5, sm: 0 }
                    }}>
                      <Badge text={commentBadge(c)} />
                      <CustomText sx={{ 
                        fontSize: { xs: 11, sm: 13 }, 
                        color: "#5E5C5C",
                        whiteSpace: "nowrap"
                      }}>
                        {c.created_at
                          ? new Date(c.created_at)
                            .toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            .replace(/ /g, "-")
                            .replace(",", "")
                          : "-"}
                      </CustomText>
                    </Box>
                  </Box>

                  {c.comment_type === "status_change" && (c.old_value || c.new_value) ? (
                    <Box sx={{ 
                      display: "flex", 
                      gap: 1, 
                      mt: 1,
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" }
                    }}>
                      <StatusDropdown currentStatus={c.old_value || "-"} />
                      <StatusDropdown currentStatus={c.new_value || "-"} />
                    </Box>
                  ) : null}
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
}






