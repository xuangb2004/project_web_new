import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { GoogleLogin } from '@react-oauth/google';
import axios from "../../utils/axios";
const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });
  const [err, setError] = useState(null);

  const navigate = useNavigate();

  // Lưu ý: Bạn cần đảm bảo hàm loginWithGoogle đã được viết trong AuthContext
  const { login, loginWithGoogle, currentUser } = useContext(AuthContext);

  // Hàm xử lý điều hướng dựa trên role_id
  const handleRedirect = (user) => {
    if (user.role_id === 1) {
      navigate("/admin");
    } else if (user.role_id === 2) {
      navigate("/editor");
    } else {
      navigate("/");
    }
  };

  // Redirect nếu đã đăng nhập từ trước
  useEffect(() => {
    if (currentUser) {
      handleRedirect(currentUser);
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Xử lý đăng nhập thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(inputs);
      handleRedirect(user);
    } catch (err) {
      setError(err.response?.data || "Đã xảy ra lỗi đăng nhập");
    }
  };

  // Xử lý đăng nhập Google thành công
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Gửi token Google lên server để xác thực và lấy thông tin user
      const user = await loginWithGoogle(credentialResponse.credential);
      handleRedirect(user);
    } catch (err) {
      console.log(err);
      setError("Đăng nhập Google thất bại!");
    }
  };

  return (
    <div className="auth">
      <form>
        <h1>Đăng Nhập</h1>
        
        <input
          type="text"
          placeholder="username"
          name="username"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          name="password" 
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Đăng Nhập</button>
        
        {/* Nút đăng nhập Google */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Login Failed")}
          />
        </div>

        {err && <p className="error-msg">{err}</p>}
        
        <span>
          Bạn chưa có tài khoản? <Link to="/register">Đăng ký </Link>
        </span>
        
        {/* Link đăng ký Nhà báo */}
        <span style={{ marginTop: '10px', display: 'block', fontSize: '14px' }}>
          Muốn trở thành nhà báo? <Link to="/register-Editor" style={{color: "teal", fontWeight: "bold"}}>Đăng ký tại đây</Link>
        </span>

      </form>
    </div>
  );
};

export default Login;