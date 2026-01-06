import React from "react";

const Footer = () => {
  const iconStyle = { width: "18px", height: "18px", minWidth: "18px", color: "#666", marginTop: "2px" };

  return (
    <footer>
      <div className="footer-container-final">

        <div className="col-left">
          <div className="section">
            <h3>TRỤ SỞ CHÍNH</h3>
            <ul>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>123 Đường ABC, Quận 1, Thành phố XYZ</span>
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span>Điện thoại: +84 123 456 789</span>
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
                  <path d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 12v2H8v-2h8zm2-2v-2H6v2H4v-4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v4h-2z"/>
                  <circle cx="18" cy="11.5" r="1"/>
                </svg>
                <span>Fax: +84 987 654 321</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-right">
          <h3>CÔNG TY TNHH MYNEWS</h3>

          <div className="logo-brand">
            <h2 style={{color: "teal", margin: 0}}>MyNews</h2>
            <span style={{marginLeft: "10px", fontSize: "11px", color: "#777", fontWeight: "bold"}}>Dự án mẫu</span>
          </div>

          <p className="license-title">TRANG THÔNG TIN MẪU DÙNG CHO DỰ ÁN HỌC TẬP.</p>

          <div className="info-text">
            <p>Địa chỉ: 123 Đường ABC, Quận 1, Thành phố XYZ</p>
            <p>Điện thoại liên hệ: +84 123 456 789</p>
            <p>Email hỗ trợ: support@mynews.vn</p>
            <p>Chịu trách nhiệm nội dung: <b>Nguyễn Văn A</b> - Dự án học tập.</p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
