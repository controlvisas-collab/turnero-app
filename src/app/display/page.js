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

    const interval = setInterval(fetchCurrent, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchCurrent = async () => {
    const { data } = await supabase
      .from("queue")
      .select("*")
      .eq("status", "serving")
      .order("created_at", { ascending: true })
      .limit(1);

    if (data && data.length > 0) {
      const next = data[0];

      if (current?.id !== next.id && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }

      setCurrent(next);
    } else {
      setCurrent(null);
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
          <div className="text-7xl font-bold mb-6">
            {current.name}
          </div>

          <div className="text-4xl bg-red-600 px-8 py-4 rounded-xl">
            Pase a escritorio {current.desk || 1}
          </div>
        </>
      ) : (
        <div className="text-4xl">
          Esperando clientes...
        </div>
      )}
    </div>
  );
}
