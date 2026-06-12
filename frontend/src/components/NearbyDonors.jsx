import { useEffect, useState } from "react";
import API from "../api/axios";
import DonorCard from "./DonorCard";

export default function NearbyDonors({ profile }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile || profile.role !== "hospital") {
      setLoading(false);
      setDonors([]);
      setError("Nearby donor data is available for hospitals only.");
      return;
    }

    const fetchDonors = async () => {
      if (!profile.location?.coordinates?.length) {
        setError("Hospital location is required to load donors.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const lat = profile.location.coordinates[1];
        const lng = profile.location.coordinates[0];
        const res = await API.get(`/request/donors?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
        setDonors(res.data);
        setError("");
      } catch (err) {
        setError(err.response?.data || "Unable to fetch donors.");
        setDonors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [profile]);

  return (
    <section className="card" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, color: "#e11d48", fontWeight: 700 }}>Nearby donors</div>
          <h2 style={{ margin: "6px 0 0", fontSize: 22, color: "#111827" }}>Real donors near your hospital</h2>
        </div>
        <div style={{ color: "#475569", fontSize: 14 }}>Updated now</div>
      </div>

      {loading ? (
        <div style={{ padding: 24, borderRadius: 18, background: "#f8fafc", color: "#475569" }}>Loading active donors...</div>
      ) : error ? (
        <div style={{ padding: 24, borderRadius: 18, background: "#fee2e2", color: "#991b1b" }}>{error}</div>
      ) : donors.length === 0 ? (
        <div style={{ padding: 24, borderRadius: 18, background: "#f8fafc", color: "#475569" }}>No active donors available right now.</div>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          {donors.map((donor) => (
            <DonorCard key={donor._id || donor.id} donor={donor} />
          ))}
        </div>
      )}
    </section>
  );
}
