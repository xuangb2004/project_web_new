import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { FaUser, FaBookmark, FaList, FaSignOutAlt, FaArrowLeft, FaEdit, FaFileAlt, FaThumbsUp, FaComment, FaEye } from "react-icons/fa";
import "../style_editor.scss"; 

const Profile = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  
  // State để quản lý tab đang active
  const [activeTab, setActiveTab] = useState("account");
  
  // State lưu thông tin User
  const [inputs, setInputs] = useState({
    name: currentUser?.name || currentUser?.username || "",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    dob: currentUser?.dob ? moment(currentUser.dob).format("YYYY-MM-DD") : "",
    gender: currentUser?.gender || "male",
  });

  // State lưu thống kê (MỚI)
  const [stats, setStats] = useState({ savedCount: 0, viewedCount: 0 });
  const [editorStats, setEditorStats] = useState(null);
  const [status, setStatus] = useState(null);

  // Gọi API lấy thống kê khi vào trang
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (currentUser) {
          const res = await axios.get(`http://localhost:8800/api/users/stats/${currentUser.id}`);
          setStats(res.data);
          
          // Nếu là editor, lấy thống kê editor
          if (currentUser.role_id === 2) {
            const editorRes = await axios.get(`http://localhost:8800/api/users/editor-stats/${currentUser.id}`);
            setEditorStats(editorRes.data);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:8800/api/upload", formData);
      const fileName = res.data;
      const avatarUrl = `/upload/${fileName}`; 
      setInputs((prev) => ({ ...prev, avatar: avatarUrl }));
    } catch (err) { 
      console.error(err);
      alert("Lỗi upload ảnh!"); 
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8800/api/users/${currentUser.id}`, inputs);
      const updatedUser = { ...currentUser, ...inputs };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setStatus("Cập nhật thành công!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) { 
      console.error(err);
      setStatus("Lỗi cập nhật!"); 
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="container">
        
        {/* --- SIDEBAR --- */}
        <div className="sidebar">
          <div className="sidebar-home-btn">
            <Link to="/" className="back-link">
               <FaArrowLeft className="icon-arrow" />
               <span className="logo-text">MyNews</span>
               <span className="small-text">Trang chủ</span>
            </Link>
          </div>

          <div className="user-info-header">
            <img src={inputs.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Avatar" />
            <span className="user-name">{inputs.name}</span>
          </div>
          
          <ul className="sidebar-menu">
            <li>
              <FaUser className="icon gray" /> Thông tin tài khoản
            </li>
            
            {/* HIỂN THỊ SỐ LIỆU THỰC TẾ */}
            <li>
              <Link to="/saved-posts" style={{display:"flex", alignItems:"center", width:"100%", color:"inherit", textDecoration:"none"}}>
                 <FaBookmark className="icon gray" /> Tin bài đã lưu 
                 <span className="badge">{stats.savedCount}</span>
              </Link>
            </li>
            <li>
              <Link to="/viewed-posts" style={{display:"flex", alignItems:"center", width:"100%", color:"inherit", textDecoration:"none"}}>
                 <FaList className="icon gray" /> Tin bài đã xem 
                 <span className="badge">{stats.viewedCount}</span>
              </Link>
            </li>
            
            {/* Editor dashboard link - only show if user has editor role */}
            {currentUser?.role_id === 2 && (
              <li>
                <Link to="/editor" style={{display:"flex", alignItems:"center", width:"100%", color:"inherit", textDecoration:"none"}}>
                  <FaFileAlt className="icon gray" /> Quản lý bài viết
                </Link>
              </li>
            )}
            
            <li className="logout" onClick={handleLogout}>
                <FaSignOutAlt className="icon gray" /> Thoát tài khoản
            </li>
          </ul>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="main-profile">
          {/* Tab Buttons */}
          <div className="profile-tab-buttons">
            <button 
              className={`tab-button ${activeTab === "account" ? "active" : ""}`}
              onClick={() => setActiveTab("account")}
            >
              <FaUser className="icon" /> Thông tin tài khoản
            </button>
            {currentUser?.role_id === 2 && (
              <button 
                className={`tab-button ${activeTab === "editor" ? "active" : ""}`}
                onClick={() => setActiveTab("editor")}
              >
                <FaEdit className="icon" /> Thông tin Editor
              </button>
            )}
          </div>

          {activeTab === "account" ? (
            <>
              <h2 className="title">Thông tin tài khoản</h2>
              
              <div className="avatar-section">
                <label>Ảnh đại diện</label>
                <div className="avatar-row">
                  <img src={inputs.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="" />
                  <div className="actions">
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleUpload} />
                    <button type="button" className="btn-change-photo" onClick={() => fileInputRef.current.click()}>Đổi ảnh</button>
                    <p className="note">Định dạng PNG, JPG | Dung lượng tối đa 5MB</p>
                  </div>
                </div>
              </div>

              <form>
                <div className="form-group">
                  <label>Họ và tên <span className="req">*</span></label>
                  <input type="text" name="name" value={inputs.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Email <span className="req">*</span></label>
                    <input type="email" value={inputs.email} disabled className="disabled" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" name="phone" value={inputs.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input type="date" name="dob" value={inputs.dob} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <textarea rows="3" name="address" value={inputs.address} onChange={handleChange}></textarea>
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <div className="radio-group">
                    <label><input type="radio" name="gender" value="male" checked={inputs.gender === 'male'} onChange={handleChange} /> Nam</label>
                    <label><input type="radio" name="gender" value="female" checked={inputs.gender === 'female'} onChange={handleChange} /> Nữ</label>
                  </div>
                </div>

                {status && <p className="status-msg">{status}</p>}

                <div className="form-actions">
                  <button type="submit" className="btn-save" onClick={handleUpdate}>Lưu thay đổi</button>
                </div>
              </form>
            </>
          ) : activeTab === "editor" && currentUser?.role_id === 2 ? (
            <>
              <div className="title-with-badge">
                <h2 className="title">Thông tin Editor</h2>
                {editorStats && (
                  <div className={`status-badge ${editorStats.editor_status}`}>
                    {editorStats.editor_status === 'pending' && '⏳ Đang chờ duyệt'}
                    {editorStats.editor_status === 'approved' && '✅ Đã được duyệt'}
                    {editorStats.editor_status === 'rejected' && '❌ Đã bị từ chối'}
                  </div>
                )}
              </div>
              
              {editorStats ? (
                <div className="editor-profile-content">
                  {editorStats.editor_status === 'pending' && (
                    <div className="status-note-wrapper">
                      <p className="status-note">Tài khoản của bạn đang chờ quản trị viên phê duyệt. Bạn sẽ có thể viết bài sau khi được duyệt.</p>
                    </div>
                  )}

                  {/* Section 2: Thông tin cá nhân */}
                  <div className="editor-section">
                    <h3 className="section-header">Thông tin cá nhân</h3>
                    <div className="form-group">
                      <label>Số năm kinh nghiệm</label>
                      <input type="text" value={editorStats.years_of_experience || 0} disabled className="disabled" />
                    </div>

                    <div className="form-group">
                      <label>Tham gia từ</label>
                      <input type="text" value={editorStats.editor_since ? moment(editorStats.editor_since).format("DD/MM/YYYY") : "N/A"} disabled className="disabled" />
                    </div>
                  </div>

                  {/* Section 3: Thống kê bài viết */}
                  <div className="editor-section">
                    <h3 className="section-header">Thống kê bài viết</h3>
                    <div className="editor-stats-grid">
                      <div className="stat-card">
                        <FaFileAlt className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-value">{editorStats.total_posts || 0}</span>
                          <span className="stat-label">Tổng bài viết</span>
                        </div>
                      </div>
                      <div className="stat-card approved">
                        <FaFileAlt className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-value">{editorStats.approved_posts || 0}</span>
                          <span className="stat-label">Đã duyệt</span>
                        </div>
                      </div>
                      <div className="stat-card pending">
                        <FaFileAlt className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-value">{editorStats.pending_posts || 0}</span>
                          <span className="stat-label">Chờ duyệt</span>
                        </div>
                      </div>
                      <div className="stat-card rejected">
                        <FaFileAlt className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-value">{editorStats.rejected_posts || 0}</span>
                          <span className="stat-label">Bị từ chối</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Tương tác */}
                  <div className="editor-section">
                    <h3 className="section-header">Tương tác</h3>
                    <div className="editor-stats-grid">
                      <div className="stat-card">
                        <FaEye className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-value">{editorStats.total_views || 0}</span>
                          <span className="stat-label">Lượt xem</span>
                        </div>
                      </div>
                      <div className="stat-card">
                        <FaThumbsUp className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-value">{editorStats.total_likes || 0}</span>
                          <span className="stat-label">Lượt thích</span>
                        </div>
                      </div>
                      <div className="stat-card">
                        <FaComment className="stat-icon" />
                        <div className="stat-content">
                          <span className="stat-value">{editorStats.total_comments || 0}</span>
                          <span className="stat-label">Bình luận</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Đang tải thông tin...</p>
              )}
            </>
          ) : null}
        </div>

      </div>
    </div>
  );
};

export default Profile;