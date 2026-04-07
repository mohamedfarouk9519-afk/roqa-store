"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
  alert(error.message);
  return;
}

    if (data.session) {
      document.cookie = `sb-access-token=${data.session.access_token}; path=/`;
      window.location.href = "/admin";
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#fcf5f7",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          border: "1px solid #efc8d5",
          borderRadius: 24,
          padding: 24,
          display: "grid",
          gap: 14,
          direction: "rtl",
        }}
      >
        <h2 style={{ margin: 0, color: "#c0527c" }}>تسجيل دخول الأدمن</h2>

        <input
          type="email"
          placeholder="الإيميل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            height: 46,
            borderRadius: 14,
            border: "1px solid #e9c7d3",
            padding: "0 14px",
          }}
        />

        <input
          type="password"
          placeholder="الباسورد"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            height: 46,
            borderRadius: 14,
            border: "1px solid #e9c7d3",
            padding: "0 14px",
          }}
        />

        <button
          type="submit"
          style={{
            height: 50,
            border: "none",
            borderRadius: 16,
            background: "#d86a97",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          دخول
        </button>
      </form>
    </main>
  );
}