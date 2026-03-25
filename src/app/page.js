"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Page() {
  const [waiting, setWaiting] = useState([]);
  const [serving, setServing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [desk, setDesk] = useState("1");

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

    if (!data) return;

    setWaiting(data.filter(c => c.status === "waiting"));
    setServing(data.filter(c => c.status === "serving"));
    setCompleted(data.filter(c => c.status === "done"));
  };

  // ✅ AGREGAR CLIENTE (CORREGIDO)
  const addClient = async () => {
    const name = prompt("Nombre del cliente");
    if (!name) return;

    await supabase.from("queue").insert([
      { name, status: "waiting" }
    ]);

    fetchQueue();
  };

  // ✅ LLAMAR SIGUIENTE (CORREGIDO)
  const callNext = async () => {
    if (!waiting.length) return;

    const next = waiting[0];

    // pasar actual a done
    if (serving.length) {
      await supabase
        .from("queue")
        .update({ status: "done" })
        .eq("id", serving[0].id);
    }

    // nuevo a serving
    await supabase
      .from("queue")
      .update({ status: "serving", desk })
      .eq("id", next.id);

    fetchQueue();
  };

  // ✅ FINALIZAR ATENCIÓN (CORRECTO Y BIEN UBICADO)
  const finishCurrent = async () => {
    if (!serving.length) return;

    await supabase
      .from("queue")
      .update({ status: "done" })
      .eq("id", serving[0].id);

    fetchQueue();
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
          <h1 className="text-xl font-bold">Desk {desk}</h1>

          <div className="flex gap-3">
            <button
              onClick={addClient}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              + Add visitor
            </button>

            <button
              onClick={finishCurrent}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg"
            >
              Finish
            </button>

            <button
              onClick={callNext}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Call next
            </button>
          </div>
        </div>

        {/* SELECT DESK */}
        <select
          value={desk}
          onChange={(e) => setDesk(e.target.value)}
          className="mb-4 border p-2 rounded"
        >
          {[1,2,3,4,5,6,7].map(d => (
            <option key={d} value={d}>
              Escritorio {d}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-6">

          {/* SERVING */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold mb-3">Serving now</h2>

            {serving.length ? serving.map(c => (
              <div key={c.id} className="p-3 bg-green-200 rounded mb-2">
                {c.name} (Desk {c.desk})
              </div>
            )) : (
              <div className="text-gray-400">No one</div>
            )}
          </div>

          {/* WAITING */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold mb-3">
              Waiting ({waiting.length})
            </h2>

            {waiting.map((c, i) => (
              <div key={c.id} className="p-3 border rounded mb-2">
                {i + 1}. {c.name}
              </div>
            ))}
          </div>

          {/* COMPLETED */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-bold mb-3">Completed</h2>

            {completed.map(c => (
              <div key={c.id} className="p-3 bg-gray-200 rounded mb-2">
                {c.name}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
