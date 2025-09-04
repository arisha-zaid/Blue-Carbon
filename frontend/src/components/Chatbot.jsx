// src/components/Chatbot.jsx
import { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-[#1D4ED8] text-white p-4 rounded-full shadow-lg"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white shadow-xl rounded-lg p-4 flex flex-col dark:bg-gray-900 dark:text-gray-100">
          <div className="flex-1 overflow-y-auto">
            <p><strong>FAQ:</strong></p>
            <p>Q: How are CO₂ credits calculated?</p>
            <p>A: Currently using AI estimator (mock data).</p>
            <p>Q: Can I download certificates?</p>
            <p>A: Yes, visit the Certificates page.</p>
          </div>
          <button onClick={() => setOpen(false)} className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Close</button>
        </div>
      )}
    </>
  );
}
