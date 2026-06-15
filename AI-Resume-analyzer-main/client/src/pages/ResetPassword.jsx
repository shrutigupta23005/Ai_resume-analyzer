import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }
      );

      alert(res.data.message);
      navigate("/login");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Password Reset Failed"
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reset Password</h2>

      <form onSubmit={handleReset}>
        <div>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <br />

        <button type="submit">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;