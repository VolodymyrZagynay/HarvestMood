import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("Успішний вхід! Перенаправляємо...");
        setTimeout(() => {
          if (data.user.Role === 'Farmer') {
            navigate('/add-product');
          } else {
            navigate('/products');
          }
        }, 1500);
      } else {
        setMessage(data.message || "Невірний логін або пароль");
      }
    } catch (err) {
      setMessage("Помилка з'єднання з сервером");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container-wrapper">
      <div className="auth-container">
        <h2>Вхід до HarvestMood</h2>
        <p>Увійдіть у свій обліковий запис</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Електронна пошта</label>
            <input
              type="email"
              placeholder="Введіть вашу електронну пошту"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="Введіть ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Вхід..." : "Увійти"}
          </button>
        </form>

        {message && (
          <p className={`message ${message.includes("Успішний") ? "" : "error"}`}>
            {message}
          </p>
        )}

        <div className="auth-switch">
          <p>Ще не маєте акаунта?</p>
          <button 
            type="button" 
            onClick={() => navigate('/register')}
            disabled={isLoading}
          >
            Зареєструватися
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;