import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import moment from "moment";
import { AuthContext } from "../context/authContext";
import Menu from "../components/Menu";
import Comments from "../components/Comments";
import Weather from "../components/Weather";
import Trending from "../components/Trending";
// Import icon
import { FaBookmark, FaRegBookmark, FaThumbsUp, FaFlag } from "react-icons/fa"; 

const Single = () => {
  const [post, setPost] = useState({});
  const [likes, setLikes] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const galleryIntervalsRef = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const postId = location.pathname.split("/")[2];
  const { currentUser } = useContext(AuthContext);

  // 1. Fetch Dữ liệu bài viết, Likes & Bookmark
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Lấy thông tin bài viết
        const res = await axios.get(`/posts/${postId}`);
        setPost(res.data);

        // B. --- BỔ SUNG: LẤY DANH SÁCH LIKE ---
        // Dòng này giúp React biết user đã like hay chưa ngay khi load trang
        const resLikes = await axios.get(`/likes?postId=${postId}`);
        setLikes(resLikes.data);

      } catch (err) {
        console.log("Lỗi tải dữ liệu:", err);
      }

      // C. Kiểm tra Report (Nếu lỗi cũng không sao, không chặn các cái khác)
      if (currentUser) {
        try {
          const resReport = await axios.get(`/reports/check?postId=${postId}&userId=${currentUser.id}`);
          // Giả sử bạn có state isReported
          // setIsReported(resReport.data);
        } catch (err) {
          console.log("Lỗi kiểm tra report:", err); // Chỉ log lỗi, không chặn code
        }

        // 3. Lưu lịch sử xem (Chạy độc lập)
        try {
           await axios.post("/users/history", { postId: postId });
           console.log("Đã lưu lịch sử xem");
        } catch (err) {
           console.log("Lỗi lưu lịch sử:", err);
        }
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [postId, currentUser]);

  // 2. Logic xử lý Gallery (Album ảnh trong bài viết) - GIỮ NGUYÊN
  useEffect(() => {
    if (!post.content) return;
    galleryIntervalsRef.current.forEach(id => clearInterval(id));
    galleryIntervalsRef.current = [];
    document.querySelectorAll('.gallery-container[data-initialized]').forEach(el => {
      el.removeAttribute('data-initialized');
    });
    
    const initializeGalleries = () => {
      const galleries = document.querySelectorAll('.gallery-container:not([data-initialized])');
      galleries.forEach((gallery) => {
        gallery.setAttribute('data-initialized', 'true');
        const images = gallery.querySelectorAll('img[data-gallery-image]');
        if (images.length <= 1) return;
        
        const autoPlay = gallery.getAttribute('data-autoplay') !== 'false';
        const interval = parseInt(gallery.getAttribute('data-interval')) || 3000;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'gallery-wrapper';
        images.forEach((img, index) => { img.style.display = index === 0 ? 'block' : 'none'; });
        
        let currentIndex = 0;
        let intervalId = null;
        
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '‹'; prevButton.className = 'gallery-nav-button prev';
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '›'; nextButton.className = 'gallery-nav-button next';
        
        const thumbnailStrip = document.createElement('div');
        thumbnailStrip.className = 'gallery-thumbnail-strip';
        const thumbnails = [];
        
        const showImage = (index) => {
          images.forEach((img, i) => { img.style.display = i === index ? 'block' : 'none'; });
          thumbnails.forEach((thumb, i) => {
            if (i === index) thumb.classList.add('active');
            else thumb.classList.remove('active');
          });
          currentIndex = index;
        };
        
        const nextImage = () => { showImage((currentIndex + 1) % images.length); };
        const prevImage = () => { showImage((currentIndex - 1 + images.length) % images.length); };
        
        const resetAutoPlay = () => {
          if (intervalId) {
            clearInterval(intervalId);
            const idx = galleryIntervalsRef.current.indexOf(intervalId);
            if (idx > -1) galleryIntervalsRef.current.splice(idx, 1);
          }
          if (autoPlay) {
            intervalId = setInterval(nextImage, interval);
            galleryIntervalsRef.current.push(intervalId);
          }
        };
        
        images.forEach((img, index) => {
          const thumbnail = document.createElement('div');
          thumbnail.className = 'gallery-thumbnail';
          if (index === 0) thumbnail.classList.add('active');
          const thumbImg = document.createElement('img');
          thumbImg.src = img.src;
          thumbnail.appendChild(thumbImg);
          thumbnails.push(thumbnail);
          thumbnailStrip.appendChild(thumbnail);
          thumbnail.onclick = () => { showImage(index); resetAutoPlay(); };
        });
        
        prevButton.onclick = () => { prevImage(); resetAutoPlay(); };
        nextButton.onclick = () => { nextImage(); resetAutoPlay(); };
        
        gallery.parentNode.insertBefore(wrapper, gallery);
        wrapper.appendChild(gallery);
        wrapper.appendChild(prevButton);
        wrapper.appendChild(nextButton);
        wrapper.parentNode.insertBefore(thumbnailStrip, wrapper.nextSibling);
        
        if (autoPlay) {
          intervalId = setInterval(nextImage, interval);
          galleryIntervalsRef.current.push(intervalId);
        }
      });
    };
    const timer = setTimeout(initializeGalleries, 100);
    return () => { clearTimeout(timer); galleryIntervalsRef.current.forEach(id => clearInterval(id)); galleryIntervalsRef.current = []; };
  }, [post.content]);

  // 3. Xử lý Like & Bookmark & Delete
  // Giả sử bạn có state 'likes' chứa danh sách user_id đã like
// và biến 'currentUser' từ context

const handleLike = async () => {
  if (!currentUser) return; // Bắt buộc đăng nhập

  // Kiểm tra xem user hiện tại đã có trong danh sách like chưa
  const hasLiked = likes.includes(currentUser.id);

  try {
    if (hasLiked) {
      // TRƯỜNG HỢP 1: Đã like rồi -> Gọi API DELETE để Bỏ Like
      // Lưu ý: Controller deleteLike của bạn dùng req.query
      await axios.delete(`/likes?postId=${post.id}&userId=${currentUser.id}`);
      
      // Cập nhật UI ngay lập tức (Optional)
      setLikes(likes.filter((id) => id !== currentUser.id));
    } else {
      // TRƯỜNG HỢP 2: Chưa like -> Gọi API POST để Thêm Like
      await axios.post("/likes", { post_id: post.id, user_id: currentUser.id });
      
      // Cập nhật UI ngay lập tức (Optional)
      setLikes([...likes, currentUser.id]);
    }
  } catch (err) {
    console.log(err);
  }
};

  const handleBookmark = async () => {
    if (!currentUser) return alert("Bạn cần đăng nhập để lưu bài!");
    try {
      await axios.post("/interactions/bookmarks", { user_id: currentUser.id, post_id: postId });
      setIsSaved(!isSaved);
    } catch (err) { console.log(err); }
  };

  const handleReport = () => {
    if (!currentUser) return alert("Bạn cần đăng nhập để báo cáo bài viết!");
    if (isReported) return alert("Bạn đã báo cáo bài viết này rồi!");
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim()) return alert("Vui lòng nhập lý do báo cáo!");

    try {
      await axios.post("/reports", { 
        user_id: currentUser.id,
        post_id: postId, 
        reason: reportReason 
      });
      setIsReported(true);
      setShowReportModal(false);
      setReportReason("");
      alert("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét bài viết này.");
    } catch (err) {
      console.log(err);
      alert("Lỗi khi gửi báo cáo!");
    }
  };

  const handleDelete = async () => {
    if(!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      await axios.delete(`/posts/${postId}`, { data: { user_id: currentUser.id } }); // Gửi kèm user_id để check quyền
      navigate("/");
    } catch (err) { console.log(err); }
  };

  // --- LOGIC CHẶN XEM BÀI CHƯA DUYỆT ---
  const isAuthor = currentUser && post.uid && currentUser.id === post.uid;
  const isAdmin = currentUser && currentUser.role === 'admin';

  // Kiểm tra: Nếu bài chưa load xong thì bỏ qua, nếu load xong rồi mới check
  if (post.status && post.status !== "approved" && !isAuthor && !isAdmin) {
    return (
      <div className="single" style={{ marginTop: "100px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <h2 style={{ color: "#d32f2f" }}>Không thể truy cập</h2>
        <p>Bài viết này đang ở trạng thái <b>Chờ duyệt</b> hoặc đã bị ẩn.</p>
        <p>Chỉ tác giả bài viết mới có thể xem bản nháp này.</p>
        <Link to="/" style={{ padding: "10px 20px", background: "teal", color: "white", borderRadius: "5px" }}>
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (!post.title) return <div className="single" style={{marginTop: "100px", textAlign:"center"}}>Đang tải bài viết...</div>;

  return (
    <>
    <div className="single">
      
      {/* --- CỘT TRÁI: NỘI DUNG CHÍNH (70%) --- */}
      <div className="content">
        
        {/* Gợi ý: Thêm cảnh báo cho tác giả nếu đang xem bài chờ duyệt */}
        {post.status === 'pending' && (
            <div style={{
                padding: "15px", 
                marginBottom: "20px", 
                background: "#fff3cd", 
                color: "#856404", 
                border: "1px solid #ffeeba",
                borderRadius: "5px"
            }}>
                <strong>Lưu ý:</strong> Bài viết này đang chờ duyệt. Chỉ bạn (tác giả) mới nhìn thấy nội dung này.
            </div>
        )}
        
        {/* THÊM CLASS 'hero-image' ĐỂ KHỚP VỚI CSS STYLE MỚI */}
        <img src={post.thumbnail} alt="" className="hero-image" />
        
        {/* Thông tin User & Nút Sửa/Xóa */}
        <div className="user">
          {post.avatar && <img src={post.avatar} alt="" />}
          <div className="info">
            <span>{post.username}</span>
            <p>Đăng {moment(post.date).fromNow()} • {post.view_count || 0} lượt xem</p>
          </div>
          {currentUser && currentUser.username === post.username && (
            <div className="edit">
              <Link to={`/write?edit=${post.id}`}><button className="btn-edit">Sửa bài</button></Link>
              <button onClick={handleDelete} className="btn-delete">Xóa bài</button>
            </div>
          )}
        </div>

        {/* Tiêu đề bài viết */}
        <h1>{post.title}</h1>

        {/* --- KHU VỰC TƯƠNG TÁC (LIKE & SAVE) --- */}
        <div className="interactions">
          <button onClick={handleLike} className={`like-button ${likes.includes(currentUser?.id) ? 'liked' : ''}`}>
            <FaThumbsUp /> {likes.includes(currentUser?.id) ? "Đã thích" : "Thích"} ({likes.length})
          </button>

          <button onClick={handleBookmark} className={`bookmark-button ${isSaved ? 'saved' : ''}`}>
            {isSaved ? <FaBookmark /> : <FaRegBookmark />} 
            {isSaved ? "Đã lưu" : "Lưu bài"}
          </button>

          <button onClick={handleReport} className={`report-button ${isReported ? 'reported' : ''}`} style={{marginLeft: "10px", color: isReported ? "red" : "gray", border: "none", background: "none", cursor: "pointer"}}>
            <FaFlag /> {isReported ? "Đã báo cáo" : "Báo cáo"}
          </button>
        </div>

        {/* Nội dung bài viết (Rich Text) */}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
        
        <hr className="post-content-separator" />
        
        {/* Bình luận */}
        <h3>Bình luận</h3>
        <Comments postId={postId} />
      </div>

      {/* --- CỘT PHẢI: MENU STICKY (30%) --- */}
      <div className="menu-container">
        {/* Truyền cat_name vào Menu để lấy bài liên quan */}
        <Menu cat={post.cat_name} />
        <Weather/>
      </div>
    </div>

    {/* REPORT MODAL */}
    {showReportModal && (
      <div className="modal-overlay" style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
        justifyContent: "center", alignItems: "center", zIndex: 1000
      }}>
        <div className="modal-content" style={{
          backgroundColor: "white", padding: "20px", borderRadius: "8px",
          width: "400px", maxWidth: "90%"
        }}>
          <h3 style={{marginTop: 0}}>Báo cáo bài viết</h3>
          <p>Hãy cho chúng tôi biết lý do bạn báo cáo bài viết này:</p>
          <textarea 
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Nhập lý do..."
            style={{width: "100%", height: "100px", padding: "10px", marginBottom: "10px"}}
          />
          <div style={{display: "flex", justifyContent: "flex-end", gap: "10px"}}>
            <button onClick={() => setShowReportModal(false)} style={{
              padding: "8px 16px", border: "1px solid #ccc", background: "white", cursor: "pointer", borderRadius: "4px"
            }}>Hủy</button>
            <button onClick={submitReport} style={{
              padding: "8px 16px", border: "none", background: "#d32f2f", color: "white", cursor: "pointer", borderRadius: "4px"
            }}>Gửi Báo Cáo</button>
          </div>
        </div>
      </div>
    )}

    <Trending />
    </>
  );
};

export default Single;