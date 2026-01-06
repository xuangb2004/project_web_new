import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const RegisterEditor = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    age: "",
    years_of_experience: "",
  });
  const [err, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...inputs,
        age: inputs.age ? Number(inputs.age) : null,
        years_of_experience: inputs.years_of_experience
          ? Number(inputs.years_of_experience)
          : null,
      };
      await axios.post("/auth/editor-register", payload);
      navigate("/login");
    } catch (error) {
      // Extract error message from response
      let errorMessage = "Đã xảy ra lỗi đăng ký!";
      if (error.response?.data) {
        // If data is a string, use it directly
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } 
        // If data is an object, try to extract message
        else if (typeof error.response.data === 'object') {
          errorMessage = error.response.data.message || error.response.data.sqlMessage || JSON.stringify(error.response.data);
        }
      }
      setError(errorMessage);
      console.error(error);
    }
  };

  return (
    <div className="auth">
      <form onSubmit={handleSubmit}>
        <h1>Đăng Ký Editor</h1>

        <input
          required
          type="text"
          placeholder="email"
          name="email"
          value={inputs.email}
          onChange={handleChange}
        />
        <input
          required
          type="text"
          placeholder="username"
          name="username"
          value={inputs.username}
          onChange={handleChange}
        />
        <input
          required
          type="password"
          placeholder="password"
          name="password"
          value={inputs.password}
          onChange={handleChange}
        />
        <input
          required
          type="text"
          placeholder="name"
          name="name"
          value={inputs.name}
          onChange={handleChange}
        />
        <input
          required
          type="number"
          placeholder="age"
          name="age"
          value={inputs.age}
          onChange={handleChange}
        />
        <input
          required
          type="number"
          placeholder="years_of_experience"
          name="years_of_experience"
          value={inputs.years_of_experience}
          onChange={handleChange}
        />

        <button type="submit">Đăng Ký</button>
        {err && <p>{err}</p>}
        <span>
          Bạn đã có tài khoản?{" "}
          <Link to="/login">Đăng nhập </Link>
        </span>
        <button onClick={() => navigate("/login")}>Home</button>
      </form>
    </div>
  );
};

export default RegisterEditor;