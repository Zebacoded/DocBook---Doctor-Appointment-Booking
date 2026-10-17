"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

function todayISO() {
  const t = new Date();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}-${m}-${d}`;
}

export default function MyBookings() {
  const [user, setUser] = useState(undefined); // undefined = still checking
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("appointments")
      .select("*, doctors(name, address, image_url)")
      .order("date");
    setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) load();
      else setLoading(false);
    });
  }, []);

  async function cancel(id) {
    if (!confirm("Cancel this appointment?")) return;
    await supabase.from("appointments").delete().eq("id", id);
    load();
  }

  if (user === undefined) return <p className="text-gray-500">Loading...</p>;

  if (user === null) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-blue-600 underline">
          log in
        </Link>{" "}
        to see your bookings.
      </p>
    );
  }

  const today = todayISO();
  const list = bookings.filter((b) =>
    tab === "upcoming" ? b.date >= today : b.date < today
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>

      <div className="flex gap-2 mb-5">
        {["upcoming", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm border capitalize ${
              tab === t
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-blue-50 text-blue-600 border-blue-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500">No {tab} appointments.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((b) => (
            <div
              key={b.id}
              className="border rounded-lg p-4 flex items-center gap-4"
            >
              <img
                src={b.doctors?.image_url}
                alt={b.doctors?.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold">{b.doctors?.name}</h3>
                <p className="text-gray-500 text-sm">{b.doctors?.address}</p>
                <p className="text-sm mt-1">
                  {b.date} at {b.time_slot}
                </p>
                {b.note && (
                  <p className="text-gray-500 text-sm">Note: {b.note}</p>
                )}
              </div>
              {tab === "upcoming" && (
                <button
                  onClick={() => cancel(b.id)}
                  className="border border-red-500 text-red-500 rounded-full px-4 py-1 text-sm hover:bg-red-50"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}