"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({ children }) {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const ok = sessionStorage.getItem("roqa_admin_ok");
    if (ok === "1") {
      setAllowed(true);
    } else {
      router.replace("/");
    }
  }, [router]);

  if (!allowed) return null;
  return children;
}
