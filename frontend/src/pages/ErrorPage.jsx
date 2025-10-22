// src/pages/ErrorPage.jsx
import React from "react";

export default function ErrorPage({ code = 500, message = "Internal Server Error" }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-red-600">{code}</h1>
      <p className="text-2xl mt-4 text-gray-700">{message}</p>
      <p className="mt-2 text-gray-500">Server sedang tidak dapat merespons. Coba beberapa saat lagi.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Muat Ulang
      </button>
    </div>
  );
}
