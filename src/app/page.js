"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Page() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

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

  const callNext = async () => {
    if (!queue.length) return;

    const next = queue[0];
    setCurrent(next);

    await supabase.from("history").insert([
      { name: next.name, desk: 1 }
    ]);

    await supabase.from("queue").delete().eq("id", next.id);
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-20 bg-green-900 text-white flex flex-col items-center py-4 space-y-6">
        <div className="text-xl font-bold">Q</div>
        <div>🏠</div>
        <div>📋</div>
        <div>⚙️</div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Desk 1</h1>
          <button
            onClick={callNext}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Call next
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* SERVING */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold mb-3">Serving now</h2>

            {current ? (
              <div className="p-3 bg-green-100 rounded">
                {current.name}
              </div>
            ) : (
              <div className="text-gray-400">No one</div>
            )}
          </div>

          {/* WAITING */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold mb-3">
              Waiting ({queue.length})
            </h2>

            {queue.map((c, i) => (
              <div
                key={c.id}
                className="p-3 border rounded mb-2 bg-gray-50"
              >
                {i + 1}. {c.name}
              </div>
            ))}
          </div>

          {/* COMPLETED */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold mb-3">Completed</h2>
            <div className="text-gray-400">
              (puedes conectar history aquí)
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
