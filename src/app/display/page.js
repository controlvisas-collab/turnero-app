"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Display() {
  const [current, setCurrent] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchCurrent();

    const channel = supabase
      .channel("realtime_display")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue" },
        fetchCurrent
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchCurrent = async () => {
    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("status", "serving")
      .limit(1)
      .limit(1);

    if (data) {
      setCurrent(data);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="h-screen bg-blue-900 text-white flex flex-col items-center justify-center">

      <audio
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      />

      {current ? (
        <>
          <div className="text-6xl font-bold mb-6">
            {current.name}
          </div>

          <div className="text-4xl bg-red-600 px-6 py-4 rounded-xl">
            Pase a escritorio {current.desk || 1}
          </div>
        </>
      ) : (
        <div className="text-3xl">
          Esperando clientes...
        </div>
      )}
    </div>
  );
}
