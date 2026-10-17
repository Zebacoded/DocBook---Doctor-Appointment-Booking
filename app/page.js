"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // category id or null = all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: docs, error: e1 } = await supabase
        .from("doctors")
        .select("*, categories(name)")
        .order("id");
      const { data: cats, error: e2 } = await supabase
        .from("categories")
        .select("*")
        .order("id");
      if (e1 || e2) setError((e1 || e2).message);
      setDoctors(docs || []);
      setCategories(cats || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = doctors.filter((d) => {
    const matchesCategory = selected === null || d.category_id === selected;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      d.name.toLowerCase().includes(q) ||
      d.categories?.name?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Hero + search */}
      <section className="text-center py-10">
        <h1 className="text-4xl font-bold">
          Find & Book an <span className="text-blue-600">Appointment</span>
          <br />
          with your favourite <span className="text-blue-600">Doctor</span>
        </h1>
        <p className="text-gray-500 mt-3">
          Search by name or specialty and book in a few clicks.
        </p>
        <div className="mt-6 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search doctors or specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-full px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </section>

      {/* Category filters */}
      <section className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setSelected(null)}
          className={`px-4 py-2 rounded-full text-sm border ${
            selected === null
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`px-4 py-2 rounded-full text-sm border ${
              selected === c.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
            }`}
          >
            {c.name}
          </button>
        ))}
      </section>

      {/* Doctor grid */}
      <section>
        <h2 className="text-xl font-bold mb-4">
          {selected === null
            ? "Popular Doctors"
            : categories.find((c) => c.id === selected)?.name}
        </h2>

        {error && <p className="text-red-600 mb-4">Error: {error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading doctors...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No doctors found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="border rounded-lg p-3 hover:border-blue-500 hover:shadow-sm transition"
              >
                <img
                  src={d.image_url}
                  alt={d.name}
                  className="h-48 w-full object-cover rounded-lg"
                />
                <div className="mt-3 flex flex-col gap-1">
                  <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-1 w-fit">
                    {d.categories?.name}
                  </span>
                  <h3 className="font-bold">{d.name}</h3>
                  <p className="text-blue-600 text-sm">{d.experience}</p>
                  <p className="text-gray-500 text-sm">{d.address}</p>
                  <Link
                    href={`/doctors/${d.id}`}
                    className="mt-2 text-center text-sm border border-blue-600 text-blue-600 rounded-full py-2 hover:bg-blue-600 hover:text-white"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}