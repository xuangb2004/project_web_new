import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import axios from "../utils/axios";
import { FaThumbsUp, FaComment, FaEye, FaClock, FaSort } from "react-icons/fa";
import "../style_editor.scss";

const defaultAvatar =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const EditorPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState(null); // null, 'likes', 'comments', 'views', 'time'

  const fetchMyPosts = useCallback(async () => {
    if (!currentUser) return;
    try {
      const url = sortBy 
        ? `/posts?uid=${currentUser.id}&sortBy=${sortBy}`
        : `/posts?uid=${currentUser.id}`;
      const res = await axios.get(url);
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [currentUser, sortBy]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }
    fetchMyPosts();
  }, [currentUser, navigate, fetchMyPosts]);

  const handleDelete = async (id) => {
    if (!currentUser) {
      alert("Bạn cần đăng nhập để xóa bài viết!");
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa bài viết này?");
    if (!confirmed) return;

    try {
      await axios.delete(`/posts/${id}`, {
        data: { user_id: currentUser.id }
      });
      
      // Refresh the posts list
      fetchMyPosts();
      alert("Bài viết đã được xóa thành công!");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert(err.response?.data || "Có lỗi xảy ra khi xóa bài viết!");
    }
  };

  if (!currentUser) return null;

  const isPending = currentUser.status === 'pending';

  return (
    <div className="editor-dashboard">
      <div className="sidebar">
        <div className="user-profile">
          <img
            src={currentUser.avatar || defaultAvatar}
            alt=""
            className="avatar"
          />
          <h3>{currentUser.name || currentUser.username}</h3>
          <span>Editor</span>
        </div>
        <div className="menu">
          <button className="active">Bài viết của tôi</button>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </div>

      <div className="main-content-editor">
        <div className="header">
          <h1>Quản lý bài viết</h1>
          {isPending ? (
            <button className="btn-create" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              + Viết bài mới
            </button>
          ) : (
            <Link to="/write" className="btn-create">
              + Viết bài mới
            </Link>
          )}
        </div>

        {isPending && (
          <div style={{ 
            padding: '15px', 
            marginBottom: '20px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '5px',
            color: '#856404'
          }}>
            <strong>Thông báo:</strong> Tài khoản của bạn đang chờ được duyệt. Bạn chưa có quyền viết bài viết mới. Vui lòng chờ quản trị viên phê duyệt tài khoản của bạn.
          </div>
        )}

        {/* Sorting Buttons */}
        {posts.length > 0 && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
              <FaSort /> Sắp xếp theo:
            </span>
            <button
              onClick={() => setSortBy(sortBy === 'likes' ? null : 'likes')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '5px',
                background: sortBy === 'likes' ? '#667eea' : '#e9ecef',
                color: sortBy === 'likes' ? 'white' : '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: sortBy === 'likes' ? 'bold' : 'normal'
              }}
            >
              <FaThumbsUp /> Lượt thích
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'comments' ? null : 'comments')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '5px',
                background: sortBy === 'comments' ? '#667eea' : '#e9ecef',
                color: sortBy === 'comments' ? 'white' : '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: sortBy === 'comments' ? 'bold' : 'normal'
              }}
            >
              <FaComment /> Bình luận
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'views' ? null : 'views')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '5px',
                background: sortBy === 'views' ? '#667eea' : '#e9ecef',
                color: sortBy === 'views' ? 'white' : '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: sortBy === 'views' ? 'bold' : 'normal'
              }}
            >
              <FaEye /> Lượt đọc
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'time' ? null : 'time')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '5px',
                background: sortBy === 'time' ? '#667eea' : '#e9ecef',
                color: sortBy === 'time' ? 'white' : '#333',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: sortBy === 'time' ? 'bold' : 'normal'
              }}
            >
              <FaClock /> Thời gian
            </button>
            {sortBy && (
              <button
                onClick={() => setSortBy(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #dc3545',
                  borderRadius: '5px',
                  background: 'white',
                  color: '#dc3545',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        <div className="posts-list">
          {posts.length === 0 ? (
            <p>Bạn chưa có bài viết nào.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thống kê</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <img src={post.thumbnail} alt="" className="thumb" />
                    </td>
                    <td>{post.title}</td>
                    <td>{post.cat_name}</td>
                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${post.status}`}>
                        {post.status}
                      </span>
                    </td>
                    <td>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaThumbsUp style={{ color: '#667eea' }} />
                          <span>{post.like_count || 0}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaComment style={{ color: '#4facfe' }} />
                          <span>{post.comment_count || 0}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <FaEye style={{ color: '#f5576c' }} />
                          <span>{post.view_count || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        {isPending ? (
                          <button className="btn-edit" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                            Sửa
                          </button>
                        ) : (
                          <Link to={`/write?edit=${post.id}`} state={post} className="btn-edit">
                            Sửa
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="btn-delete"
                          disabled={isPending}
                          style={isPending ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                        >
                          Xóa
                        </button>
                        <Link to={`/post/${post.id}`} className="btn-view">
                          Xem
                        </Link>
                        <Link 
                          to={`/post/${post.id}/stats`} 
                          className="btn-stats"
                          style={{
                            padding: "6px 12px",
                            background: "#667eea",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "14px",
                            display: "inline-block",
                            marginLeft: "5px"
                          }}
                        >
                          Thống kê
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
