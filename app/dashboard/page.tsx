'use client'

import { useEffect, useState } from "react";
import client from "@/lib/api-client";

export default function Dashboard() {
  const [rooms, setRooms] = useState<number>(0);
  const [beds, setBeds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPGProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await client.get("/pg/profile/");

        // 🔥 DEBUG LOG (VERY IMPORTANT)
        console.log("🔥 RAW API RESPONSE:", res.data);

        const data = res.data;

        if (!data) {
          setError("No data received from API");
          return;
        }

        setRooms(data.total_rooms ?? data.rooms ?? 0);
        setBeds(data.total_beds ?? data.beds ?? 0);

      } catch (err: any) {
        console.log("❌ API ERROR:", err?.response?.data || err.message);

        setError(
          err?.response?.data?.detail ||
          "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPGProfile();
  }, []);

  // ======================
  // LOADING STATE
  // ======================
  if (loading) {
    return (
      <div className="p-6">
        <h1>Loading dashboard...</h1>
      </div>
    );
  }

  // ======================
  // ERROR STATE
  // ======================
  if (error) {
    return (
      <div className="p-6 text-red-500">
        <h1>Error:</h1>
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-500">
          Check console for API response
        </p>
      </div>
    );
  }

  // ======================
  // MAIN UI
  // ======================
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="space-y-2">
        <h2 className="text-lg">Rooms: {rooms}</h2>
        <h2 className="text-lg">Beds: {beds}</h2>
      </div>
    </div>
  );
}
