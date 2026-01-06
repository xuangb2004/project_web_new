import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import { AuthContext } from "../context/authContext";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";

const SavedPosts = () => {
  const [posts, setPosts] = useState([]);
  const { currentUser } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/interactions/bookmarks?userId=${currentUser.id}`);
      setPosts(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const handleLike = async (post) => {
    try {
      if (post.is_liked) {
        await axios.delete(`/likes?postId=${post.id}&userId=${currentUser.id}`);
      } else {
        await axios.post(`/likes`, { user_id: currentUser.id, post_id: post.id });
      }
      fetchData();
    } catch (err) { console.log(err); }
  };

  const handleBookmark = async (post) => {
    try {
      // Toggle Bookmark (Lưu/Bỏ lưu)
      await axios.post("/interactions/bookmarks", {
        user_id: currentUser.id,
        post_id: post.id
      });
      fetchData();
    } catch (err) { console.log(err); }
  };

  return (
    <div className="saved-page container" style={{paddingTop: "100px", paddingBottom: "50px", maxWidth:"1024px", margin:"0 auto"}}>
      <h1 style={{marginBottom: "30px", borderBottom: "2px solid teal", display:"inline-block", color:"#333"}}>Tin bài đã lưu</h1>
      
      <div className="posts-list" style={{display:"flex", flexDirection:"column", gap:"20px"}}>
        {posts.length === 0 ? <p style={{textAlign:"center", color:"gray"}}>Chưa lưu bài nào.</p> : posts.map(post => (
          <div className="post-item" key={post.id} style={{display:"flex", gap:"20px", borderBottom:"1px solid #eee", paddingBottom:"20px", alignItems:"center"}}>
            <Link to={`/post/${post.id}`}>
               <img src={post.thumbnail} alt="" style={{width:"180px", height:"110px", objectFit:"cover", borderRadius:"5px"}} />
            </Link>
            
            <div className="content" style={{flex: 1}}>
              <Link to={`/post/${post.id}`} style={{textDecoration:"none", color:"#333"}}>
                <h2 style={{fontSize:"18px", margin:"0 0 8px 0", lineHeight: "1.3"}}>{post.title}</h2>
              </Link>
              <span style={{fontSize:"12px", background:"#eee", padding:"3px 8px", borderRadius:"3px", color:"#666", display:"inline-block", marginBottom:"10px"}}>{post.cat_name}</span>

              {/* ICONS */}
              <div className="actions" style={{display: "flex", gap: "15px"}}>
                <div onClick={() => handleLike(post)} style={{cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: post.is_liked ? "red" : "gray"}}>
                   {post.is_liked ? <FaHeart /> : <FaRegHeart />} <span style={{fontSize:"12px"}}>Thích</span>
                </div>
                <div onClick={() => handleBookmark(post)} style={{cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: "#eab308"}}>
                   <FaBookmark /> <span style={{fontSize:"12px"}}>Đã lưu</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPosts;