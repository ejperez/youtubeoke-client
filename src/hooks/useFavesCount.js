import { useState, useEffect } from "react";
import { getFavorites } from "../util/faves";

export default function useFavesCount() {
  const [favesCount, setFavesCount] = useState(0);

  useEffect(() => {
    const faves = getFavorites();
    setFavesCount(faves.length);
  }, []);

  return { favesCount, setFavesCount };
}
