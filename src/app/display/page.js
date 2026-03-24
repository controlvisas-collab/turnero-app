"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Display() {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const channel = supabase
      .channel("realtime_history")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "history" },
        (payload) => setCurrent(payload.new)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <div>
      {current ? (
        <>
          <h1>{current.name}</h1>
          <h2>Escritorio {current.desk}</h2>
        </>
      ) : (
        <div>Esperando...</div>
      )}
    </div>
  );
}
