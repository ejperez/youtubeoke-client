import { useEffect, useState, useRef } from "react";
import { generateCode } from "../util/util";
import { getSocket } from "../util/socket";
import PlayerFrame from "../components/PlayerFrame";
import PlayerHome from "../components/PlayerHome";
import { QRCode } from "react-qr-code";

export default function Player() {
  const [playerID, setPlayerID] = useState(null);
  const socket = getSocket();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [queue, setQueue] = useState([]);
  const [hasError, setHasError] = useState(false);
  const remoteLink = `${document.location.href}/#${playerID}/remote`;
  const queueRef = useRef(queue);
  const currentVideoRef = useRef(currentVideo);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Get player ID from localStorage or generate a new one
    const savedPlayerID = localStorage.getItem("playerID");

    if (savedPlayerID) {
      setPlayerID(savedPlayerID);
    } else {
      const newPlayerID = generateCode();
      localStorage.setItem("playerID", newPlayerID);
      setPlayerID(newPlayerID);
    }

    // Load queue and current video from localStorage
    const savedQueue = localStorage.getItem("queue");
    const savedCurrentVideo = localStorage.getItem("currentVideo");

    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }
    if (savedCurrentVideo) {
      setCurrentVideo(JSON.parse(savedCurrentVideo));
    }

    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;

    // Update queue and current video references for socket synchronization
    queueRef.current = queue;
    currentVideoRef.current = currentVideo;

    // Save queue and current video to localStorage
    localStorage.setItem("queue", JSON.stringify(queue));
    localStorage.setItem("currentVideo", JSON.stringify(currentVideo));
  }, [queue, currentVideo, isInitialLoad]);

  const playNextInQueue = () => {
    if (queue.length > 0) {
      setCurrentVideo(queue[0]);
      setQueue((queue) => queue.slice(1));
    } else {
      setCurrentVideo(null);
    }
  };

  const broadcastQueue = () => {
    socket.emit("sync-event", {
      action: "current-queue",
      payload: {
        playerID: playerID,
        queue: queueRef.current,
        currentVideo: currentVideoRef.current,
      },
    });
  };

  const handleError = () => {
    setHasError(true);
  };

  const handleSkip = () => {
    playNextInQueue();
    setHasError(false);
  };

  // Autoplay first item in queue if nothing is playing
  useEffect(() => {
    if (!currentVideo) {
      playNextInQueue();
    }
  }, [queue, currentVideo]);

  // Broadcast queue and current video to server
  useEffect(() => {
    broadcastQueue();
  }, [queue, currentVideo, playerID]);

  // Handle sync events from server
  useEffect(() => {
    socket.on("sync-event", (data) => {
      if (playerID !== data.payload.playerID) {
        return;
      }

      switch (data.action) {
        case "play-item":
          setCurrentVideo(data.payload.video);

          break;
        case "add-to-queue":
          setQueue((queue) => [...queue, data.payload.video]);

          break;
        case "get-queue":
          broadcastQueue();

          break;
        case "remove-from-queue":
          setQueue((queue) =>
            queue.filter((item) => item.id !== data.payload.video.id),
          );

          break;
      }
    });

    return () => {
      socket.off("sync-event");
    };
  }, [playerID]);

  // Render the player
  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="flex z-50 gap-1 justify-between p-1 w-full text-sm bg-black">
          <div className="flex gap-1 w-64 font-extrabold">
            <img
              className="w-5"
              src={`${import.meta.env.VITE_BASE_PATH}logo.png`}
              alt="Youtubeoke Logo"
            />
            Youtubeoke
          </div>
          <div className="flex w-full min-w-0 grow">
            {currentVideo && (
              <>
                <span className="pr-1 text-green-500 shrink-0">
                  NOW PLAYING
                </span>
                <span className="truncate">{currentVideo.title}</span>
              </>
            )}
          </div>
          <div className="flex pl-2 w-full min-w-0 grow">
            {queue[0] && (
              <>
                <span className="pr-1 text-yellow-500 shrink-0">COMING UP</span>
                <span className="truncate">{queue[0].title}</span>
              </>
            )}
          </div>
          <div className="w-72 text-right">
            <span className="pr-1 text-red-500">RESERVED</span>
            {queue.length}
          </div>
        </div>

        {currentVideo ? (
          <PlayerFrame
            videoID={currentVideo.id}
            onEnd={playNextInQueue}
            onError={handleError}
          />
        ) : (
          <PlayerHome playerID={playerID} />
        )}
      </div>

      {hasError && currentVideo && (
        <div className="absolute top-5 py-4 w-full text-2xl text-center rounded-2xl border-8 border-red-800">
          <h2 className="my-4 text-4xl">Oops!</h2>
          We can't play the song "{currentVideo.title}"<br />
          Click "Watch on YouTube" to play it or click the "Skip" button to play
          the next song.
          <br />
          <button
            type="button"
            className="px-4 py-2 my-4 text-2xl text-black bg-white rounded-full"
            onClick={handleSkip}
          >
            SKIP
          </button>
        </div>
      )}

      {currentVideo && (
        <div className="absolute bottom-10 z-50 p-1 w-full">
          <QRCode
            className="p-1 bg-white rounded-xl opacity-75 size-32"
            value={remoteLink}
          />
        </div>
      )}
    </>
  );
}
