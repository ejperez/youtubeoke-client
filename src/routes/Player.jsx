import { useEffect, useState, useRef } from "react";
import { generateCode } from "../util/util";
import { getSocket } from "../util/socket";
import PlayerFrame from "../components/PlayerFrame";
import PlayerHome from "../components/PlayerHome";

export default function Player() {
  const [playerID, setPlayerID] = useState(null);
  const socket = getSocket();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [queue, setQueue] = useState([]);
  const [hasError, setHasError] = useState(false);
  const queueRef = useRef(queue);
  const currentVideoRef = useRef(currentVideo);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const playerInstance = useRef(null);

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

    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }

    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;

    // Update queue and current video references for socket synchronization
    queueRef.current = queue;
    currentVideoRef.current = currentVideo;

    // Save queue and current video to localStorage
    localStorage.setItem("queue", JSON.stringify([currentVideo, ...queue]));
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

  const handleOnError = () => {
    setHasError(true);
  };

  const handleOnReady = (e) => {
    playerInstance.current = e.target;
  };

  const handleStateChange = (isPlaying) => {
    socket.emit("sync-event", {
      action: "player-status-changed",
      payload: {
        playerID: playerID,
        isPlaying: isPlaying,
      },
    });
  };

  const handleSkip = () => {
    playNextInQueue();
    setHasError(false);
  };

  const handlePlayInYT = () => {
    document.location.href = `https://www.youtube.com/watch?v=${currentVideo.id}`;
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
          const queueIds = queueRef.current.map((item) => item.id);

          if (queueIds.includes(data.payload.video.id)) {
            return;
          }

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
        case "restart-current-video":
          playerInstance.current?.seekTo(0);
          playerInstance.current?.playVideo();
          broadcastQueue();

          break;
        case "pause-current-video":
          playerInstance.current?.pauseVideo();
          broadcastQueue();

          break;
        case "play-current-video":
          playerInstance.current?.playVideo();
          broadcastQueue();

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
          <div className="flex gap-1 shrink-0">
            <img
              className="w-5"
              src={`${import.meta.env.VITE_BASE_PATH}logo.png`}
              alt="Youtubeoke Logo"
            />
            <div className="font-extrabold">Youtubeoke</div>
          </div>
          <div className="flex w-full min-w-0 grow gap-1">
            {currentVideo && (
              <div className="truncate text-green-500">
                NOW PLAYING: <em>{currentVideo.title}</em>
              </div>
            )}
            {queue[0] && (
              <div className="truncate text-yellow-500">
                NEXT SONG: <em>{queue[0].title}</em>
              </div>
            )}
          </div>
          <div className="flex shrink-0">
            <div className="pr-1 text-red-500">RESERVED</div>
            <div>{queue.length}</div>
          </div>
        </div>

        {currentVideo && !hasError ? (
          <PlayerFrame
            videoID={currentVideo.id}
            onEnd={playNextInQueue}
            onError={handleOnError}
            onReady={handleOnReady}
            onPlay={() => {
              handleStateChange(true);
            }}
            onPause={() => {
              handleStateChange(false);
            }}
          />
        ) : hasError ? (
          <div className="relative flex items-center justify-center h-full w-full text-2xl bg-red-950">
            <div className="text-center">
              <h2 className="my-4 text-4xl">Oops!</h2>
              We can't play the song "{currentVideo.title}"<br />
              Click "Watch on YouTube" to play it or click the "Skip" button to
              play the next song.
              <div className="flex gap-2 justify-center mt-4">
                <button
                  type="button"
                  className="w-52 px-4 py-2 my-4 text-2xl text-black bg-white rounded-full"
                  onClick={handlePlayInYT}
                >
                  Watch on YouTube
                </button>
                <button
                  type="button"
                  className="w-52 px-4 py-2 my-4 text-2xl text-black bg-white rounded-full"
                  onClick={handleSkip}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        ) : (
          <PlayerHome playerID={playerID} />
        )}
      </div>
    </>
  );
}
