import { useEffect, useState, useMemo, useRef } from "react";
import { generateCode } from "../util/util";
import { getSocket } from "../util/socket";
import PlayerFrame from "../components/PlayerFrame";
import PlayerHome from "../components/PlayerHome";
import { QRCode } from "react-qr-code";

export default function Player() {
  const id = useMemo(generateCode, []);
  const socket = getSocket();
  const [currentVideo, setCurrentVideo] = useState(null);
  const [queue, setQueue] = useState([]);
  const [hasError, setHasError] = useState(false);
  const remoteLink = `${document.location.href}/#${id}/remote`;
  const queueRef = useRef(queue);
  const currentVideoRef = useRef(currentVideo);

  useEffect(() => {
    queueRef.current = queue;
    currentVideoRef.current = currentVideo;
  }, [queue, currentVideo]);

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
        playerID: id,
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

  useEffect(() => {
    broadcastQueue();
  }, [queue, currentVideo]);

  useEffect(() => {
    socket.on("sync-event", (data) => {
      if (id !== data.payload.playerID) {
        return;
      }

      console.log(data);

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
  }, []);

  return (
    <>
      <div className="flex flex-col h-screen">
        {currentVideo ? (
          <PlayerFrame
            videoID={currentVideo.id}
            onEnd={playNextInQueue}
            onError={handleError}
          />
        ) : (
          <PlayerHome playerID={id} />
        )}

        <div className="flex z-50 gap-1 justify-between p-1 w-full text-lg bg-black">
          <div className="flex gap-1 w-72 font-extrabold">
            <img
              className="w-8"
              src={`${import.meta.env.VITE_BASE_PATH}logo.png`}
              alt="Youtubeoke Logo"
            />
            Youtubeoke
          </div>
          <div className="flex w-full truncate grow">
            {currentVideo && (
              <>
                <span className="pr-1 text-green-500">NOW PLAYING:</span>
                {currentVideo.title}
              </>
            )}
          </div>
          <div className="flex pl-2 w-full truncate grow">
            {queue[0] && (
              <>
                <span className="pr-1 text-yellow-500">COMING UP:</span>
                {queue[0].title}
              </>
            )}
          </div>
          <div className="w-72 text-right">
            <span className="pr-1 text-red-500">RESERVED:</span>
            {queue.length}
          </div>
        </div>
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
