import { useEffect, useState } from "react";
import axios from "axios";

export default function useMape() {
  const [mapeResults, setMapeResults] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMape = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/mape");
        setMapeResults(res.data);
      } catch (err) {
        setError("Gagal memuat data akurasi (MAPE).");
      }
    };
    fetchMape();
  }, []);

  return { mapeResults, error };
}
