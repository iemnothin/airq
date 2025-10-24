import { useEffect, useState } from "react";
import axios from "axios";

export default function useForecast() {
  const [forecast, setForecast] = useState({});
  const [error, setError] = useState(null);

  const fetchForecast = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/forecast");
      setForecast(res.data);
    } catch (err) {
      setError("Gagal memuat data prediksi (kode 500).");
    }
  };

  useEffect(() => {
    fetchForecast();
    const interval = setInterval(fetchForecast, 3600000);
    return () => clearInterval(interval);
  }, []);

  return { forecast, error, fetchForecast };
}
