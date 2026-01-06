import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
// Import icon mũi tên nếu muốn đẹp (cài: npm install react-icons)
// hoặc dùng text thường "<" ">" cũng được.

const Menu = ({ cat }) => {
  const [posts, setPosts] = useState([]);
  
  // --- STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4; // Giới hạn 4 bài

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/api/posts/?cat=${cat}`);
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat]);

  // Logic tính toán bài viết cần hiện
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Hàm chuyển trang
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="menu">
      <h2 className="menu-title" style={{
        fontSize: "18px", fontWeight: "bold", textTransform: "uppercase", 
        borderBottom: "2px solid teal", paddingBottom: "5px", marginBottom: "20px", display:"inline-block"
      }}>Bài viết liên quan</h2>
      
      <div className="menu-list">
        {currentPosts.map((post) => (
          // GIỮ NGUYÊN THIẾT KẾ SIDEBAR-POST
          <div className="sidebar-post" key={post.id} style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
            
            <div className="img-container" style={{ width: "100px", height: "70px", flexShrink: 0 }}>
               <Link to={`/post/${post.id}`}>
                  <img 
                    src={post.thumbnail} 
                    alt="" 
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                  />
               </Link>
            </div>
            
            <div className="info" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Link to={`/post/${post.id}`} className="link" style={{ textDecoration: "none", color: "#333" }}>
                 <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 5px 0", lineHeight: "1.4" }}>{post.title}</h4>
              </Link>
              <span className="date" style={{ fontSize: "11px", color: "#999" }}>
                {moment(post.created_at).fromNow()}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* --- PHẦN NÚT PHÂN TRANG --- */}
      {totalPages > 1 && (
        <div className="pagination" style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            style={{ padding: "5px 10px", border: "1px solid #ddd", background: "white", cursor: "pointer", borderRadius: "4px" }}
          >
            &laquo; Trước
          </button>
          
          {/* Hiện số trang */}
          <span style={{ padding: "5px 10px", fontWeight: "bold", fontSize: "14px" }}>
             {currentPage} / {totalPages}
          </span>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            style={{ padding: "5px 10px", border: "1px solid #ddd", background: "white", cursor: "pointer", borderRadius: "4px" }}
          >
            Sau &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;