import { useEffect, useState } from "react";
import { generateCode } from "../util/util";

export default function usePlayerId() {
  const [playerID, setPlayerID] = useState(null);

  useEffect(() => {
    const savedPlayerID = localStorage.getItem("playerID");

    if (savedPlayerID) {
      setPlayerID(savedPlayerID);
    } else {
      const newPlayerID = generateCode();
      localStorage.setItem("playerID", newPlayerID);
      setPlayerID(newPlayerID);
    }
  }, []);

  return playerID;
}
