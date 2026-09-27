import { useEffect, useState } from "react";
import { getSocket } from "../util/socket";

const emitRemoteEvent = (socket, playerID, action, payload = {}) => {
  socket.emit("sync-event", {
    action: action,
    payload: { playerID: playerID, ...payload },
  });
};

export default function useRemoteSync({ playerID }) {
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playerIsPlaying, setPlayerIsPlaying] = useState(null);
  const socket = getSocket();

  const emitEvent = (action, payload) =>
    emitRemoteEvent(socket, playerID, action, payload);

  useEffect(() => {
    socket.on("sync-event", (data) => {
      if (String(playerID) !== data.payload.playerID) {
        return;
      }

      console.log(data);

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

    return () => {
      socket.off("sync-event");
    };
  }, []);

  return { playerIsPlaying, currentQueue, currentVideo, emitEvent };
}
