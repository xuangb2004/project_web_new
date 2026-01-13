import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import axios from "../utils/axios";
import "../style_admin.scss";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [editors, setEditors] = useState([]);
  const [pendingEditors, setPendingEditors] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);

  // --- LOGIC NGÀY THÁNG ---
  const today = new Date().toISOString().split('T')[0]; // Ngày hôm nay
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // Hàm chọn nhanh ngày
  const handleQuickSelect = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else if (currentUser.role_id !== 1) {
      navigate("/");
      alert("Bạn không có quyền truy cập trang Admin!");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get("/admin/stats");
        setStats(statsRes.data);

        const editorsRes = await axios.get("/admin/editors");
        setEditors(editorsRes.data);

        const pendingEditorsRes = await axios.get("/admin/editors/pending");
        setPendingEditors(pendingEditorsRes.data);

        const postsRes = await axios.get("/admin/posts/pending");
        setPendingPosts(postsRes.data);

        const reportsRes = await axios.get("/admin/reports");
        setReportedPosts(reportsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [activeTab]);

  // --- FETCH CHART DATA ---
  useEffect(() => {
    const fetchChart = async () => {
      // Validate: Nếu ngày bắt đầu lớn hơn ngày kết thúc thì không gọi API
      if (startDate > endDate) return;

      try {
        const res = await axios.get(`/admin/stats/interactions?startDate=${startDate}&endDate=${endDate}`);
        setChartData({
          labels: res.data.map(d => moment(d.date).format("DD/MM")), // Format ngày đẹp hơn (13/01)
          datasets: [
            { label: 'Lượt xem', data: res.data.map(d => d.views), backgroundColor: '#4bc0c0' },
            { label: 'Lượt thích', data: res.data.map(d => d.likes), backgroundColor: '#ff6384' },
            { label: 'Bình luận', data: res.data.map(d => d.comments), backgroundColor: '#36a2eb' },
          ],
        });
      } catch (err) { console.log(err); }
    };
    
    if (startDate && endDate) fetchChart();
  }, [startDate, endDate]);

  const handleApproveEditor = async (userId) => {
    try {
      const res = await axios.put(`/admin/users/${userId}/status`, { status: "approved" });
      if (res.data && res.data.emailSent === false) {
        alert("Đã duyệt Editor thành công, nhưng email thông báo không gửi được.");
      } else {
        alert("Đã duyệt Editor thành công!");
      }
      setPendingEditors(pendingEditors.filter((editor) => editor.id !== userId));
      // Refresh list editor chính thức để cập nhật số lượng
      const updatedEditors = await axios.get("/admin/editors");
      setEditors(updatedEditors.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi duyệt Editor!");
    }
  };

  const handleRejectEditor = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối Editor này?")) return;
    try {
      const res = await axios.put(`/admin/users/${userId}/status`, { status: "rejected" });
      if (res.data && res.data.emailSent === false) {
        alert("Đã từ chối Editor, nhưng email thông báo không gửi được.");
      } else {
        alert("Đã từ chối Editor!");
      }
      setPendingEditors(pendingEditors.filter((editor) => editor.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi từ chối Editor!");
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      await axios.put(`/admin/posts/${postId}/status`, { status: "approved" });
      alert("Đã duyệt bài viết thành công!");
      setPendingPosts(pendingPosts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi duyệt bài viết!");
    }
  };

  const handleRejectPost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối bài viết này?")) return;
    try {
      await axios.put(`/admin/posts/${postId}/status`, { status: "rejected" });
      alert("Đã từ chối bài viết!");
      setPendingPosts(pendingPosts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi từ chối bài viết!");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?")) return;
    try {
      await axios.delete(`/admin/posts/${postId}`);
      alert("Đã xóa bài viết!");
      setPendingPosts(pendingPosts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa bài viết!");
    }
  };

  const handleDismissReport = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn loại bỏ báo cáo này? Bài viết sẽ được giữ lại.")) return;
    try {
      await axios.delete(`/admin/reports/${postId}`);
      alert("Đã loại bỏ báo cáo!");
      setReportedPosts(reportedPosts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi loại bỏ báo cáo!");
    }
  };

  const handleDeleteEditor = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Editor này? Hành động này không thể hoàn tác.")) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      alert("Đã xóa Editor!");
      setEditors(editors.filter((editor) => editor.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa Editor!");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!currentUser) return null;

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <h2>Admin Panel</h2>
        </div>
        <nav>
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <i className="icon">📊</i> Tổng Quan
          </button>
          <button
            className={activeTab === "editors" ? "active" : ""}
            onClick={() => setActiveTab("editors")}
          >
            <i className="icon">👥</i> Quản Lý Editor
          </button>
          <button
            className={activeTab === "pending-editors" ? "active" : ""}
            onClick={() => setActiveTab("pending-editors")}
          >
            <i className="icon">⏳</i> Duyệt Editor
            {pendingEditors.length > 0 && (
              <span className="badge">{pendingEditors.length}</span>
            )}
          </button>
          <button
            className={activeTab === "posts" ? "active" : ""}
            onClick={() => setActiveTab("posts")}
          >
            <i className="icon">📝</i> Duyệt Bài Viết
            {pendingPosts.length > 0 && (
              <span className="badge">{pendingPosts.length}</span>
            )}
          </button>
          <button
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => setActiveTab("reports")}
          >
            <i className="icon">🚩</i> Báo Cáo
            {reportedPosts.length > 0 && (
              <span className="badge">{reportedPosts.length}</span>
            )}
          </button>
        </nav>
        <div className="logout-area">
          <button onClick={handleLogout}>🚪 Đăng Xuất</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">
        <header>
          <h1>
            Xin chào, <span>{currentUser.username}</span>
          </h1>
          <p>Chào mừng trở lại trang quản trị hệ thống.</p>
        </header>

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && stats && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="card blue">
                <h3>Tổng Lượt Xem</h3>
                <p className="number">{stats.total_views?.toLocaleString()}</p>
                <span className="desc">Toàn trang web</span>
              </div>
              <div className="card green">
                <h3>Bài Viết</h3>
                <p className="number">{stats.total_posts}</p>
                <span className="desc">Đã xuất bản</span>
              </div>
              <div className="card orange">
                <h3>Chờ Duyệt</h3>
                <p className="number">{stats.pending_posts}</p>
                <span className="desc">Cần xử lý ngay</span>
              </div>
              <div className="card purple">
                <h3>Editors</h3>
                {/* SỬA LỖI HIỂN THỊ Ở ĐÂY: Dùng editors.length thay vì stats.total_editors */}
                <p className="number">{editors.length}</p>
                <span className="desc">Nhân sự nội dung</span>
              </div>
            </div>

            {/* --- KHU VỰC BIỂU ĐỒ --- */}
            <div className="chart-container" style={{background: 'white', padding: '20px', margin: '20px 0', borderRadius: '8px', boxShadow: "0 2px 8px rgba(0,0,0,0.1)"}}>
              <div className="chart-header" style={{display:"flex", flexWrap: "wrap", justifyContent:"space-between", alignItems:"center", marginBottom:"20px", gap: "15px"}}>
                <h3 style={{margin: 0}}>Thống kê tương tác</h3>
                
                <div className="filters" style={{display:"flex", alignItems:"center", gap:"15px", flexWrap: "wrap"}}>
                   <div className="quick-actions" style={{display: "flex", gap: "5px"}}>
                      <button onClick={() => handleQuickSelect(7)} style={{padding: "6px 12px", fontSize: "13px", border: "1px solid #ddd", background: "#f8f9fa", cursor: "pointer", borderRadius: "4px"}}>7 ngày</button>
                      <button onClick={() => handleQuickSelect(30)} style={{padding: "6px 12px", fontSize: "13px", border: "1px solid #ddd", background: "#f8f9fa", cursor: "pointer", borderRadius: "4px"}}>30 ngày</button>
                   </div>
                   <span style={{color: "#ccc"}}>|</span>
                   <div className="date-inputs" style={{display: "flex", alignItems: "center", gap: "10px"}}>
                      <div style={{position: "relative"}}>
                        <span style={{fontSize: "11px", color: "#666", display: "block", marginBottom: "2px"}}>Từ ngày</span>
                        <input 
                            type="date" 
                            value={startDate} 
                            max={endDate}
                            onChange={e => setStartDate(e.target.value)}
                            style={{padding: "6px", border: "1px solid #ddd", borderRadius: "4px"}}
                        />
                      </div>
                      <span style={{marginTop: "18px", color: "#666"}}>➔</span>
                      <div style={{position: "relative"}}>
                        <span style={{fontSize: "11px", color: "#666", display: "block", marginBottom: "2px"}}>Đến ngày</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            min={startDate}
                            max={today}
                            onChange={e => setEndDate(e.target.value)}
                            style={{padding: "6px", border: "1px solid #ddd", borderRadius: "4px"}}
                        />
                      </div>
                   </div>
                </div>
              </div>
              <div style={{height: "400px"}}>
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: EDITORS (GIAO DIỆN CARD MỚI) */}
        {activeTab === "editors" && (
          <div className="editors-section">
            <h2 style={{ marginBottom: "20px" }}>Danh Sách Editor Chính Thức ({editors.length})</h2>
            <div className="grid-container">
              {editors.map((editor) => (
                <div className="editor-card" key={editor.id}>
                  <div className="card-header">
                    <img
                      src={editor.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt=""
                    />
                    <div className="status-badge active">Đang hoạt động</div>
                  </div>
                  <div className="card-body">
                    <h3>{editor.name || editor.username}</h3>
                    <p className="email">{editor.email}</p>
                    
                    <div className="stats-row">
                      <div className="stat">
                        <strong>{editor.years_of_experience}</strong>
                        <span>Năm KN</span>
                      </div>
                      <div className="stat">
                        <strong>{editor.post_count}</strong>
                        <span>Bài viết</span>
                      </div>
                      <div className="stat">
                        <strong>{editor.total_views?.toLocaleString()}</strong>
                        <span>Views</span>
                      </div>
                    </div>
                    
                    <p className="join-date">Tham gia: {new Date(editor.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="card-footer">
                    <button 
                      className="btn-delete-full" 
                      onClick={() => handleDeleteEditor(editor.id)}
                    >
                      Xóa Editor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PENDING EDITORS (GIAO DIỆN CARD MỚI) */}
        {activeTab === "pending-editors" && (
          <div className="editors-section">
            <h2 style={{ marginBottom: "20px" }}>Yêu Cầu Đăng Ký ({pendingEditors.length})</h2>
            {pendingEditors.length === 0 ? (
              <div className="empty-state">
                <p>🎉 Tuyệt vời! Không có yêu cầu nào đang chờ xử lý.</p>
              </div>
            ) : (
              <div className="grid-container">
                {pendingEditors.map((editor) => (
                  <div className="editor-card pending" key={editor.id}>
                    <div className="card-header">
                      <img
                        src={editor.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt=""
                      />
                      <div className="status-badge pending">Chờ duyệt</div>
                    </div>
                    <div className="card-body">
                      <h3>{editor.name || editor.username}</h3>
                      <p className="email">{editor.email}</p>
                      
                      <div className="info-box">
                         <p><strong>Kinh nghiệm:</strong> {editor.years_of_experience ?? 0} năm</p>
                         <p><strong>Ngày ĐK:</strong> {new Date(editor.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="card-footer dual-actions">
                      <button
                        className="btn-approve"
                        onClick={() => handleApproveEditor(editor.id)}
                      >
                        ✅ Duyệt
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRejectEditor(editor.id)}
                      >
                        ❌ Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* TAB: REPORTS */}
        {activeTab === "reports" && (
          <div className="reports-section">
            <h2>Báo Cáo Vi Phạm</h2>
            {reportedPosts.length === 0 ? (
              <p className="empty-state">🎉 Không có bài viết nào bị báo cáo!</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style={{width: "30%"}}>Bài Viết</th>
                      <th style={{width: "30%"}}>Lý Do Báo Cáo</th> {/* THÊM CỘT NÀY */}
                      <th>Tác Giả</th>
                      <th style={{textAlign: "center"}}>Số Lượng</th>
                      <th style={{textAlign: "center"}}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportedPosts.map((post) => (
                      <tr key={post.id}>
                        <td>
                          {/* Link xem bài viết đã sửa ở bước trước */}
                          <a href={`/post/${post.id}`} target="_blank" rel="noreferrer" className="post-link">
                            {post.title} <span style={{fontSize: "12px", color: "#4361ee"}}>↗</span>
                          </a>
                        </td>
                        
                        {/* --- THÊM PHẦN HIỂN THỊ LÝ DO --- */}
                        <td>
                           <div style={{
                              maxHeight: "80px", 
                              overflowY: "auto", 
                              fontSize: "13px", 
                              color: "#d32f2f", 
                              background: "#fff5f5", 
                              padding: "5px", 
                              borderRadius: "4px"
                           }}>
                              {post.reasons}
                           </div>
                        </td>
                        {/* -------------------------------- */}

                        <td>
                          <div className="user-info">
                            <div style={{display: "flex", flexDirection: "column"}}>
                                <strong>{post.author_name}</strong>
                            </div>
                          </div>
                        </td>
                        <td style={{textAlign: "center"}}>
                            <span className="badge-report">{post.report_count}</span>
                        </td>
                        <td style={{textAlign: "center"}}>
                          <div style={{display: "flex", gap: "8px", justifyContent: "center"}}>
                            <button
                              className="btn-delete-report"
                              onClick={() => handleDeletePost(post.id)}
                              title="Xóa bài viết vĩnh viễn"
                            >
                              🗑️ Xóa Bài
                            </button>
                            <button
                              className="btn-dismiss-report"
                              onClick={() => handleDismissReport(post.id)}
                              title="Báo cáo sai - Giữ bài viết"
                            >
                              ✅ Giữ Bài
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: POSTS (Giữ nguyên) */}
        {activeTab === "posts" && (
          <div className="posts-section">
            <h2>Bài Viết Chờ Duyệt</h2>
            {pendingPosts.length === 0 ? (
              <p className="empty-state">🎉 Không có bài viết nào cần duyệt!</p>
            ) : (
              <div className="posts-grid">
                {pendingPosts.map((post) => (
                  <div className="post-card" key={post.id}>
                    <div className="post-header">
                      <span className="category">{post.category_name}</span>
                      <span className="date">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3><a 
                        href={`/post/${post.id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                        className="post-preview-link"
                      >
                        {post.title} <span style={{fontSize: "12px", color: "#4361ee"}}>↗</span>
                      </a></h3>
                    <div className="author">
                      Tác giả: <strong>{post.author_name}</strong>
                    </div>
                    <div className="actions">
                      <button
                        className="btn-approve"
                        onClick={() => handleApprovePost(post.id)}
                      >
                        ✅ Duyệt
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRejectPost(post.id)}
                      >
                        ❌ Từ chối
                      </button>
                      <button
                        className="btn-reject"
                        style={{backgroundColor: "#d32f2f"}}
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;