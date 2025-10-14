import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Customer");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserName: name,
          Email: email,
          Password: password,
          Role: role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Реєстрація успішна! Перенаправляємо на сторінку входу...");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(`Помилка при реєстрації: ${data.message || "невідома помилка"}`);
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
        <h2>Реєстрація в HarvestMood</h2>
        {/* <p>Створіть новий обліковий запис</p> */}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Ім'я користувача</label>
            <input
              type="text"
              placeholder="Введіть ваше ім'я"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
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
              placeholder="Створіть надійний пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <div className="role-selection">
              <label>Оберіть вашу роль:</label>
            </div>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
            >
              <option value="Customer">Покупець</option>
              <option value="Farmer">Фермер</option>
            </select>
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Реєстрація..." : "Зареєструватись"}
          </button>
        </form>

        {message && (
          <p className={`message ${message.includes("успішна") ? "" : "error"}`}>
            {message}
          </p>
        )}

        <div className="auth-switch">
          {/* <p>Вже маєте акаунт?</p> */}
          <button 
            type="button" 
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Увійти
          </button>
        </div>

        <div className="additional-info">
          <p><strong>Фермер:</strong> Може додавати товари та керувати ними</p>
          <p><strong>Покупець:</strong> Може купувати товари та переглядати історію замовлень</p>
        </div>
      </div>
    </div>
  );
};

export default Register;