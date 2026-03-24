"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Page() {
  const [name, setName] = useState("");
  const [desk, setDesk] = useState("1");
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchQueue();

    const channel = supabase
      .channel("realtime_queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue" },
        fetchQueue
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchQueue = async () => {
    const { data } = await supabase
      .from("queue")
      .select("*")
      .order("created_at");

    setQueue(data || []);
  };

  const addClient = async () => {
    if (!name) return;
    await supabase.from("queue").insert([{ name }]);
    setName("");
  };

  const callNext = async () => {
    if (!queue.length) return;

    const next = queue[0];
    setCurrent({ ...next, desk });

    audioRef.current?.play().catch(() => {});

    await supabase.from("history").insert([
      { name: next.name, desk }
    ]);

    await supabase.from("queue").delete().eq("id", next.id);
  };

  return (
    <div className="p-6">
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" />

      <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" />
      <button onClick={addClient}>Agregar</button>

      <select value={desk} onChange={e => setDesk(e.target.value)}>
        {[1,2,3,4,5,6,7].map(d => (
          <option key={d} value={d}>Escritorio {d}</option>
        ))}
      </select>

      <button onClick={callNext}>Llamar</button>

      {queue.map((c,i) => (
        <div key={c.id}>{i+1}. {c.name}</div>
      ))}

      <h1>{current?.name}</h1>
    </div>
  );
}
