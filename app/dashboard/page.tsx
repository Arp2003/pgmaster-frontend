import { useEffect, useState } from "react";
import client from "@/lib/api-client";

export default function Dashboard() {
  const [rooms, setRooms] = useState(0);
  const [beds, setBeds] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPGProfile = async () => {
      try {
        const res = await client.get("/pg/profile/");

        // ⚠️ Adjust these keys if backend response differs
        const data = res.data;

        setRooms(data.total_rooms ?? data.rooms ?? 0);
        setBeds(data.total_beds ?? data.beds ?? 0);
      } catch (error) {
        console.log("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPGProfile();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <div>
        <h2>Rooms: {rooms}</h2>
        <h2>Beds: {beds}</h2>
      </div>
    </div>
  );
}
