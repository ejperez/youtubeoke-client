import { useEffect, useState } from "react";
import { socket, emitRemoteEvent } from "../util/socket";

export default function useRemoteSync({ playerID }) {
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playerIsPlaying, setPlayerIsPlaying] = useState(null);

  const emitEvent = (action, payload) => {    
    emitRemoteEvent(socket, playerID, action, payload);
  };

  useEffect(() => {
    socket.on("sync-event", (data) => {
      if (String(playerID) !== data.payload.playerID) {
        return;
      }

      switch (data.action) {
        case "current-queue":
          setCurrentQueue(data.payload.queue);
          setCurrentVideo(data.payload.currentVideo);

          break;
        case "player-status-changed":
          setPlayerIsPlaying(data.payload.isPlaying);

          break;
      }
    });

    emitEvent("get-queue");
    emitEvent("get-player-state");

    return () => {
      socket.off("sync-event");
    };
  }, []);

  return { playerIsPlaying, currentQueue, currentVideo, emitEvent };
}
