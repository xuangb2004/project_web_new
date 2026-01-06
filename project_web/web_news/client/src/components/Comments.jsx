import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import axios from "../utils/axios";
import moment from "moment";
// Thêm icon Sửa, Xóa
import { FaTrash, FaPen } from "react-icons/fa"; 

const Comments = ({ postId }) => {
  const { currentUser } = useContext(AuthContext);
  const [desc, setDesc] = useState("");
  const [comments, setComments] = useState([]);
  
  // State cho Reply
  const [replyingTo, setReplyingTo] = useState(null); 
  const [replyDesc, setReplyDesc] = useState("");

  // State cho Edit (Sửa)
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/comments?postId=${postId}`);
      setComments(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // --- GỬI COMMENT ---
  const handleSend = async (e, parentId = null) => {
    e.preventDefault();
    if (!currentUser) return alert("Bạn cần đăng nhập!");

    const content = parentId ? replyDesc : desc;
    if (!content.trim()) return;

    try {
      await axios.post(`/comments`, {
        desc: content,
        post_id: postId,
        user_id: currentUser.id,
        parent_id: parentId
      });
      if (parentId) { setReplyingTo(null); setReplyDesc(""); } else { setDesc(""); }
      fetchComments();
    } catch (err) { console.log(err); }
  };

  // --- XÓA COMMENT ---
  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await axios.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      alert(err.response.data);
    }
  };

  // --- BẮT ĐẦU SỬA ---
  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setReplyingTo(null); // Tắt reply nếu đang mở
  };

  // --- LƯU SỬA ---
  const handleSaveEdit = async (commentId) => {
    try {
      await axios.put(`/comments/${commentId}`, {
        content: editContent
      });
      setEditingCommentId(null);
      setEditContent("");
      fetchComments();
    } catch (err) {
      console.log(err);
    }
  };

  // --- HỦY SỬA ---
  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  // --- HELPER RENDER 1 COMMENT ---
  const renderCommentItem = (comment) => {
    const isOwner = currentUser && currentUser.id === comment.user_id;
    const isEditing = editingCommentId === comment.id;

    return (
      <div className="comment" key={comment.id}>
        <img src={comment.avatar} alt="" />
        <div className="info" style={{width: "100%"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
             <span>{comment.username}</span>
             {/* Chỉ hiện nút Sửa/Xóa nếu là chính chủ */}
             {isOwner && !isEditing && (
                <div style={{display:"flex", gap:"10px", fontSize:"12px"}}>
                   <FaPen style={{cursor:"pointer", color:"#555"}} onClick={() => startEdit(comment)} title="Sửa" />
                   <FaTrash style={{cursor:"pointer", color:"#d32f2f"}} onClick={() => handleDelete(comment.id)} title="Xóa" />
                </div>
             )}
          </div>
          
          {/* Nếu đang Sửa -> Hiện ô Input. Nếu không -> Hiện nội dung */}
          {isEditing ? (
             <div className="edit-box" style={{marginTop:"5px"}}>
                <input 
                  type="text" 
                  value={editContent} 
                  autoFocus
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{padding:"5px", width:"100%", border:"1px solid teal", borderRadius:"3px"}}
                />
                <div style={{marginTop:"5px", display:"flex", gap:"5px"}}>
                   <button onClick={() => handleSaveEdit(comment.id)} style={{padding:"3px 10px", background:"teal", color:"white", border:"none", borderRadius:"3px", cursor:"pointer", fontSize:"11px"}}>Lưu</button>
                   <button onClick={cancelEdit} style={{padding:"3px 10px", background:"#ccc", color:"black", border:"none", borderRadius:"3px", cursor:"pointer", fontSize:"11px"}}>Hủy</button>
                </div>
             </div>
          ) : (
             <p>{comment.content}</p>
          )}

          <div className="actions">
             <span className="date">{moment(comment.created_at).fromNow()}</span>
             {!isEditing && <span className="reply-btn" onClick={() => setReplyingTo(comment.id)}>Trả lời</span>}
          </div>
        </div>
      </div>
    );
  };

  // Lọc comment cha và con
  const rootComments = comments.filter(c => c.parent_id === null);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser?.avatar} alt="" />
        <input type="text" placeholder="Viết bình luận..." value={desc} onChange={e => setDesc(e.target.value)} />
        <button onClick={(e) => handleSend(e, null)}>Gửi</button>
      </div>
      
      {rootComments.map((comment) => (
        <div key={comment.id} className="comment-thread">
          
          {/* Render Comment Cha */}
          {renderCommentItem(comment)}

          {/* Form Reply */}
          {replyingTo === comment.id && (
            <div className="write reply-input">
               <input autoFocus type="text" placeholder={`Trả lời ${comment.username}...`} value={replyDesc} onChange={e => setReplyDesc(e.target.value)} />
               <button onClick={(e) => handleSend(e, comment.id)}>Gửi</button>
               <button className="cancel-btn" onClick={() => setReplyingTo(null)}>Hủy</button>
            </div>
          )}

          {/* Render List Comment Con */}
          <div className="replies">
            {getReplies(comment.id).map(reply => renderCommentItem(reply))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comments;