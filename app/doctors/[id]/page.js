"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

const ALL_SLOTS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM",
];

function tomorrowISO() {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}-${m}-${d}`;
}

export default function DoctorPage({ params }) {
  const doctorId = Number(params.id);
  const [doctor, setDoctor] = useState(null);
  const [user, setUser] = useState(null);
  const [date, setDate] = useState(tomorrowISO());
  const [taken, setTaken] = useState([]);
  const [slot, setSlot] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("doctors")
      .select("*, categories(name)")
      .eq("id", doctorId)
      .single()
      .then(({ data }) => setDoctor(data));
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
  }, [doctorId]);

  async function loadTaken() {
    const { data } = await supabase.rpc("taken_slots", {
      p_doctor: doctorId,
      p_date: date,
    });
    setTaken((data || []).map((r) => r.time_slot));
  }

  useEffect(() => {
    if (date) {
      setSlot("");
      loadTaken();
    }
  }, [date, doctorId]);

  async function book() {
    setError("");
    setMessage("");
    setSaving(true);
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      doctor_id: doctorId,
      date,
      time_slot: slot,
      note,
    });
    setSaving(false);
    if (error) {
      if (error.code === "23505") {
        setError("Sorry, that slot was just taken. Please pick another.");
      } else {
        setError(error.message);
      }
      loadTaken();
      return;
    }
    setMessage(`Booked ${slot} on ${date}.`);
    setSlot("");
    setNote("");
    loadTaken();
  }

  if (!doctor) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      {/* Doctor info */}
      <div className="grid md:grid-cols-3 gap-6 border rounded-lg p-5">
        <img
          src={doctor.image_url}
          alt={doctor.name}
          className="rounded-lg w-full h-72 object-cover"
        />
        <div className="md:col-span-2 flex flex-col gap-2">
          <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-1 w-fit">
            {doctor.categories?.name}
          </span>
          <h1 className="text-2xl font-bold">{doctor.name}</h1>
          <p className="text-gray-600">{doctor.experience} of experience</p>
          <p className="text-gray-600">{doctor.address}</p>
          <h2 className="font-bold mt-3">About</h2>
          <p className="text-gray-600">{doctor.bio}</p>
        </div>
      </div>

      {/* Booking */}
      <div className="border rounded-lg p-5 mt-6">
        <h2 className="text-xl font-bold mb-4">Book an appointment</h2>

        {!user ? (
          <p>
            Please{" "}
            <Link href="/login" className="text-blue-600 underline">
              log in
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="text-blue-600 underline">
              sign up
            </Link>{" "}
            to book.
          </p>
        ) : (
          <>
            <label className="block text-sm font-medium mb-1">Select date</label>
            <input
              type="date"
              value={date}
              min={tomorrowISO()}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-md px-3 py-2"
            />

            <p className="text-sm font-medium mt-5 mb-2">Select time slot</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {ALL_SLOTS.map((s) => {
                const isTaken = taken.includes(s);
                return (
                  <button
                    key={s}
                    disabled={isTaken}
                    onClick={() => setSlot(s)}
                    className={`border rounded-full py-2 text-sm ${
                      isTaken
                        ? "bg-gray-100 text-gray-400 line-through cursor-not-allowed"
                        : slot === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <textarea
              placeholder="Note for the doctor (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border rounded-md px-3 py-2 w-full mt-5"
              rows={3}
            />

            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
            {message && (
              <p className="text-green-700 text-sm mt-3">
                {message}{" "}
                <Link href="/my-bookings" className="underline">
                  View my bookings
                </Link>
              </p>
            )}

            <button
              onClick={book}
              disabled={!date || !slot || saving}
              className="mt-4 bg-blue-600 text-white rounded-full px-6 py-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Booking..." : "Confirm booking"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}