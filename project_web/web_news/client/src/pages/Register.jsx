import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [err, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", inputs);
      navigate("/login");
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="auth">
      <form>
        <h1>Đăng Ký</h1> 
        
        <input
          required
          type="text"
          placeholder="username"
          name="username"
          onChange={handleChange}
        />
        <input
          required
          type="email"
          placeholder="email"
          name="email"
          onChange={handleChange}
        />
        <input
          required
          type="password"
          placeholder="password"
          name="password"
          onChange={handleChange}
        />
        <button onClick={handleSubmit}>Đăng Ký</button>
        {err && <p>{err}</p>}
        <span>
          Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </span>
      </form>
    </div>
  );
};
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8800/api/auth/register", inputs);
      navigate("/login");
    } catch (err) {
      // SỬA DÒNG NÀY: Thêm dấu ? vào sau response
      // Nếu err.response không tồn tại (do server sập), nó sẽ in ra dòng text phía sau thay vì báo lỗi
      setError(err.response?.data || "Lỗi kết nối Server!"); 
    }
  };
export default Register;