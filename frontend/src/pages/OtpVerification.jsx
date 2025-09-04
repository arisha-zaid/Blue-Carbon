import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OtpVerification() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp === "1234") {
      navigate("/dashboard");
    } else {
      alert("Invalid OTP. Try 1234 for demo.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleVerify}
        className="bg-white shadow-md p-8 rounded-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-800"
        >
          Verify
        </button>
      </form>
    </div>
  );
}
