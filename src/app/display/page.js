"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.https://yjwsihigrrduhvnxzqad.supabase.co,
  process.env.sb_publishable_nitzwBj1-NNQnn8gFFxzSg_VqgvW_Sp
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
