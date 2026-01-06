import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import moment from "moment";
import { AuthContext } from "../context/authContext";
import { FaTrashAlt, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa"; // Import thêm icon

const ViewedPosts = () => {
  const [posts, setPosts] = useState([]);
  const { currentUser } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/interactions/history?userId=${currentUser.id}`);
      setPosts(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  // Xử lý Like ngay tại danh sách
  const handleLike = async (post) => {
    try {
      if (post.is_liked) {
        await axios.delete(`/likes?postId=${post.id}&userId=${currentUser.id}`);
      } else {
        await axios.post(`/likes`, { user_id: currentUser.id, post_id: post.id });
      }
      fetchData(); // Reload lại danh sách để cập nhật icon
    } catch (err) { console.log(err); }
  };

  // Xử lý Bookmark ngay tại danh sách
  const handleBookmark = async (post) => {
    try {
      await axios.post("/interactions/bookmarks", {
        user_id: currentUser.id,
        post_id: post.id
      });
      fetchData(); // Reload lại
    } catch (err) { console.log(err); }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Xóa toàn bộ lịch sử?")) return;
    try {
      await axios.delete(`/interactions/history?userId=${currentUser.id}`);
      setPosts([]);
    } catch (err) { console.log(err); }
  };

  return (
    <div className="viewed-page container" style={{paddingTop: "100px", paddingBottom: "50px", maxWidth:"1024px", margin:"0 auto"}}>
      
      <div className="header" style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "10px"}}>
        <h1 style={{margin: 0, fontSize: "24px", color: "#333"}}>Lịch sử xem tin</h1>
        {posts.length > 0 && (
          <button onClick={handleClearHistory} style={{display: "flex", alignItems: "center", gap: "5px", padding: "8px 15px", backgroundColor: "#ff4d4f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold"}}>
            <FaTrashAlt /> Xóa tất cả
          </button>
        )}
      </div>

      <div className="posts-list" style={{display:"flex", flexDirection:"column", gap:"20px"}}>
        {posts.length === 0 ? <p style={{textAlign:"center", color:"gray"}}>Lịch sử trống.</p> : posts.map(post => (
          <div className="post-item" key={post.id + Math.random()} style={{display:"flex", gap:"20px", borderBottom:"1px solid #eee", paddingBottom:"20px", alignItems:"center"}}>
            
            <Link to={`/post/${post.id}`}>
               <img src={post.thumbnail} alt="" style={{width:"180px", height:"110px", objectFit:"cover", borderRadius:"5px"}} />
            </Link>
            
            <div className="content" style={{flex: 1}}>
              <Link to={`/post/${post.id}`} style={{textDecoration:"none", color:"#333"}}>
                <h2 style={{fontSize:"18px", margin:"0 0 8px 0", lineHeight: "1.3"}}>{post.title}</h2>
              </Link>
              
              <div style={{fontSize:"13px", color:"gray", marginBottom:"10px"}}>
                 <span style={{color: "teal", fontWeight: "bold", marginRight:"10px"}}>{post.cat_name}</span> 
                 <span>{moment(post.viewed_at).fromNow()}</span>
              </div>

              {/* KHU VỰC ICON TƯƠNG TÁC */}
              <div className="actions" style={{display: "flex", gap: "15px"}}>
                {/* Nút Like */}
                <div 
                  onClick={() => handleLike(post)} 
                  style={{cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: post.is_liked ? "red" : "gray"}}
                  title={post.is_liked ? "Bỏ thích" : "Thích"}
                >
                   {post.is_liked ? <FaHeart /> : <FaRegHeart />} 
                   <span style={{fontSize:"12px"}}>Thích</span>
                </div>

                {/* Nút Bookmark */}
                <div 
                  onClick={() => handleBookmark(post)} 
                  style={{cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: post.is_saved ? "#eab308" : "gray"}}
                  title={post.is_saved ? "Bỏ lưu" : "Lưu lại"}
                >
                   {post.is_saved ? <FaBookmark /> : <FaRegBookmark />}
                   <span style={{fontSize:"12px"}}>Lưu</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewedPosts;