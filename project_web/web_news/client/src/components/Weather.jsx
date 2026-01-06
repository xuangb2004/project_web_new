import React, { useEffect, useState } from "react";
import axios from "axios";

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        console.log("Đang lấy dữ liệu thời tiết...");
        
        // --- SỬA LỖI CORS TẠI ĐÂY ---
        // Thêm { withCredentials: false } để không gửi Cookie lên API thời tiết
        const res = await axios.get(
          "https://api.open-meteo.com/v1/forecast?latitude=21.02&longitude=105.83&current_weather=true",
          { withCredentials: false } 
        );
        
        console.log("Dữ liệu thời tiết:", res.data);
        setWeather(res.data.current_weather);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi lấy thời tiết:", err);
        setError("Không thể tải thời tiết");
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherDesc = (code) => {
    if (code === 0) return "Trời quang";
    if (code >= 1 && code <= 3) return "Có mây";
    if (code >= 45 && code <= 48) return "Sương mù";
    if (code >= 51 && code <= 67) return "Mưa nhỏ";
    if (code >= 80 && code <= 99) return "Mưa rào/Dông";
    return "Không xác định";
  };

  if (loading) return (
    <div style={{ marginTop: "30px", padding: "15px", background: "#f0f0f0", borderRadius: "8px", textAlign: "center", fontSize: "12px", color: "#666" }}>
      ⏳ Đang tải thời tiết...
    </div>
  );

  if (error) return (
    <div style={{ marginTop: "30px", padding: "15px", background: "#ffebee", borderRadius: "8px", textAlign: "center", fontSize: "12px", color: "red" }}>
      ⚠️ {error}
    </div>
  );

  return (
    <div className="weather-widget" style={{ 
        marginTop: "30px", 
        padding: "20px", 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px", 
        color: "white",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        fontFamily: "Segoe UI, sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "8px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>📍 Hà Nội</h3>
        <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px" }}>Live</span>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
           <div style={{ fontSize: "36px", fontWeight: "bold", lineHeight: "1" }}>
             {Math.round(weather.temperature)}°C
           </div>
           <div style={{ fontSize: "14px", marginTop: "5px", opacity: 0.9 }}>
             {getWeatherDesc(weather.weathercode)}
           </div>
        </div>
        
        <div style={{ textAlign: "right", fontSize: "13px", opacity: 0.9 }}>
           <div style={{ marginBottom: "4px" }}>💨 Gió: {weather.windspeed} km/h</div>
           <div>🧭 Hướng: {weather.winddirection}°</div>
        </div>
      </div>
    </div>
  );
};

export default Weather;