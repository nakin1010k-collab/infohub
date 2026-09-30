"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError("ไม่สามารถออกจากระบบได้ กรุณาลองอีกครั้ง");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("ไม่สามารถออกจากระบบได้ กรุณาตรวจสอบการตั้งค่าแล้วลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sign-out-wrap">
      <button type="button" className="state-action" onClick={handleSignOut} disabled={loading}>
        {loading ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
      </button>
      {error && <p className="auth-status is-error" role="alert">{error}</p>}
    </div>
  );
}
