import { useEffect, useState } from "react";
import axios from "axios";

export default function useAirQuality() {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);

  const fetchAirQuality = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/air-quality");
      setData(res.data);
    } catch (err) {
      setError("Gagal memuat data kualitas udara (kode 500).");
    }
  };

  useEffect(() => {
    fetchAirQuality();
    const interval = setInterval(fetchAirQuality, 3600000);
    return () => clearInterval(interval);
  }, []);

  return { data, error, fetchAirQuality };
}
