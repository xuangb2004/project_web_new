import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "../utils/axios";
import moment from "moment";
import { AuthContext } from "../context/authContext";
import {
  FaEye,
  FaComment,
  FaThumbsUp,
  FaChartLine,
  FaArrowLeft,
  FaCalendarAlt,
} from "react-icons/fa";
import "../style_posts_detail.scss";

const PostsDetail = () => {
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const postId = location.pathname.split("/")[2];
  const [stats, setStats] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Check if user is logged in
      if (!currentUser) {
        setError("Bạn cần đăng nhập để xem thống kê");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch post details first
        const postRes = await axios.get(`/posts/${postId}`);
        const postData = postRes.data;

        // Check if current user is the owner of the post
        // We need to get the user_id from the post. Let's check the post structure
        // The post should have user_id field, but we might need to fetch it differently
        // For now, let's fetch the post with user_id included
        
        // Fetch statistics with user_id parameter
        const statsRes = await axios.get(`/posts/${postId}/stats?user_id=${currentUser.id}`);
        setPost(postData);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching post details:", err);
        if (err.response?.status === 403) {
          setError("Bạn không có quyền xem thống kê bài viết này. Chỉ người tạo bài viết mới có thể xem thống kê.");
        } else if (err.response?.status === 404) {
          setError("Không tìm thấy bài viết");
        } else {
          setError("Không thể tải thống kê bài viết");
        }
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId, currentUser]);

  if (loading) {
    return (
      <div className="posts-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p style={{ fontSize: "16px", color: "#666" }}>Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error || (!loading && !post)) {
    return (
      <div className="posts-detail-container">
        <div className="error-state">
          <div className="error-message">
            {error || "Không tìm thấy bài viết"}
          </div>
          <div className="action-buttons">
            <Link to="/editor" className="breadcrumb-link primary">
              <FaArrowLeft /> Quay lại trang quản lý
            </Link>
            <Link to="/" className="breadcrumb-link secondary">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-detail-container">
      <div className="container">
        {/* Header */}
        <div className="header-section">
          <div className="breadcrumb-nav">
            <Link to={`/post/${postId}`} className="breadcrumb-link primary">
              <FaArrowLeft /> Quay lại bài viết
            </Link>
            <Link to="/editor" className="breadcrumb-link secondary">
              <FaArrowLeft /> Quản lý bài viết
            </Link>
          </div>
          <div className="title-section">
            <h1>Thống kê bài viết</h1>
            <h2>{post.title}</h2>
            <div className="post-meta">
              <div className="meta-item">
                <FaCalendarAlt />
                <span>Đăng ngày: {moment(post.date).format("DD/MM/YYYY HH:mm")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {/* Total Reads Card */}
          <div className="stat-card card-purple">
            <div className="card-content">
              <div className="stat-icon-wrapper">
                <FaEye className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3 className="stat-label">Tổng lượt đọc</h3>
                <p className="stat-value">{post.view_count || 0}</p>
              </div>
            </div>
          </div>

          {/* New Reads Today Card */}
          <div className="stat-card card-pink">
            <div className="card-content">
              <div className="stat-icon-wrapper">
                <FaChartLine className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3 className="stat-label">Lượt đọc mới hôm nay</h3>
                <p className="stat-value">{stats?.newReadsToday || 0}</p>
              </div>
            </div>
          </div>

          {/* Total Comments Card */}
          <div className="stat-card card-blue">
            <div className="card-content">
              <div className="stat-icon-wrapper">
                <FaComment className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3 className="stat-label">Tổng số bình luận</h3>
                <p className="stat-value">{stats?.totalComments || 0}</p>
              </div>
            </div>
          </div>

          {/* New Comments Today Card */}
          <div className="stat-card card-green">
            <div className="card-content">
              <div className="stat-icon-wrapper">
                <FaComment className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3 className="stat-label">Bình luận mới hôm nay</h3>
                <p className="stat-value">{stats?.newCommentsToday || 0}</p>
              </div>
            </div>
          </div>

          {/* Total Likes Card */}
          <div className="stat-card card-yellow">
            <div className="card-content">
              <div className="stat-icon-wrapper">
                <FaThumbsUp className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3 className="stat-label">Tổng số lượt thích</h3>
                <p className="stat-value">{stats?.totalLikes || 0}</p>
              </div>
            </div>
          </div>

          {/* New Likes Today Card */}
          <div className="stat-card card-cyan">
            <div className="card-content">
              <div className="stat-icon-wrapper">
                <FaThumbsUp className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3 className="stat-label">Lượt thích mới hôm nay</h3>
                <p className="stat-value">{stats?.newLikesToday || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reads Per Day Chart */}
        <div className="chart-section">
          <div className="section-header">
            <FaChartLine className="section-icon" />
            <h2>Lượt đọc theo ngày (30 ngày gần nhất)</h2>
          </div>
          <div className="chart-content">
            {stats?.readsPerDay && stats.readsPerDay.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table className="chart-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Số lượt đọc</th>
                      <th>Biểu đồ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.readsPerDay.map((item, index) => {
                      const maxReads = Math.max(
                        ...stats.readsPerDay.map((d) => d.read_count)
                      );
                      const percentage = maxReads > 0 ? (item.read_count / maxReads) * 100 : 0;
                      return (
                        <tr key={index}>
                          <td>{moment(item.date).format("DD/MM/YYYY")}</td>
                          <td>{item.read_count}</td>
                          <td>
                            <div className="chart-bar-container">
                              <div
                                className="chart-bar"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <FaChartLine className="empty-icon" />
                <p>Chưa có dữ liệu lượt đọc</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="section-header">
            <h2>Tóm tắt</h2>
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <p className="summary-label">Tổng lượt đọc</p>
              <p className="summary-value">{post.view_count || 0}</p>
            </div>
            <div className="summary-item highlight-reads">
              <p className="summary-label">Lượt đọc hôm nay</p>
              <p className="summary-value highlight">+{stats?.newReadsToday || 0}</p>
            </div>
            <div className="summary-item">
              <p className="summary-label">Tổng bình luận</p>
              <p className="summary-value">{stats?.totalComments || 0}</p>
            </div>
            <div className="summary-item highlight-comments">
              <p className="summary-label">Bình luận hôm nay</p>
              <p className="summary-value highlight">+{stats?.newCommentsToday || 0}</p>
            </div>
            <div className="summary-item">
              <p className="summary-label">Tổng lượt thích</p>
              <p className="summary-value">{stats?.totalLikes || 0}</p>
            </div>
            <div className="summary-item highlight-likes">
              <p className="summary-label">Lượt thích hôm nay</p>
              <p className="summary-value highlight">+{stats?.newLikesToday || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsDetail;

