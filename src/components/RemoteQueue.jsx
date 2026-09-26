import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { addToFavorites, isInFavorites } from "../util/faves";
import { getSocket } from "../util/socket";
import {
  pauseCurrentVideo,
  playCurrentVideo,
  playVideo,
  removeFromQueue,
  restartCurrentVideo,
} from "../util/yt";
import List from "./List";

export default function RemoteQueue() {
  const { playerID } = useParams();
  const socket = getSocket();
  const { updateFavesCount } = useOutletContext();

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playerIsPlaying, setPlayerIsPlaying] = useState(null);

  const modalCancelHandler = (e) => {
    e.stopPropagation();
    setSelectedVideo(null);
  };

  useEffect(() => {
    socket.on("sync-event", (data) => {
      if (String(playerID) !== data.payload.playerID) {
        return;
      }

      console.log(data);

      switch (data.action) {
        case "current-queue":
          setCurrentQueue(
            data.payload.queue.map((item) => {
              item.isFavorited = isInFavorites(item.id);

              return item;
            }),
          );

          if (data.payload.currentVideo) {
            data.payload.currentVideo.isFavorited = isInFavorites(
              data.payload.currentVideo.id,
            );
            setCurrentVideo(data.payload.currentVideo);
          }

          break;
        case "player-status-changed":
          setPlayerIsPlaying(data.payload.isPlaying);

          break;
      }
    });

    socket.emit("sync-event", {
      action: "get-queue",
      payload: {
        playerID: playerID,
      },
    });

    return () => {
      socket.off("sync-event");
    };
  }, []);

  const queueMenuOptions = [
    {
      label: "Play",
      action: (e) => {
        e.stopPropagation();
        playVideo(playerID, selectedVideo);
        removeFromQueue(playerID, selectedVideo);
        setSelectedVideo(null);
      },
    },
    {
      label: "Add to favorites",
      action: (e) => {
        const newFaves = addToFavorites(selectedVideo);

        e.stopPropagation();
        updateFavesCount(newFaves.length);
        setSelectedVideo(null);
      },
      isDisabled: selectedVideo && selectedVideo.isFavorited,
    },
    {
      label: "Remove from queue",
      action: (e) => {
        e.stopPropagation();
        removeFromQueue(playerID, selectedVideo);
      },
    },
    {
      label: "Cancel",
      action: modalCancelHandler,
    },
  ];

  const currentMenuOptions = [
    {
      label: "Restart",
      action: (e) => {
        e.stopPropagation();
        restartCurrentVideo(playerID);
        setSelectedVideo(null);
      },
    },
    {
      label: playerIsPlaying ? "Pause" : "Play",
      action: (e) => {
        e.stopPropagation();

        if (playerIsPlaying) {
          pauseCurrentVideo(playerID);
        } else {
          playCurrentVideo(playerID);
        }
      },
    },
    {
      label: "Add to favorites",
      action: (e) => {
        const newFaves = addToFavorites(currentVideo);

        e.stopPropagation();
        updateFavesCount(newFaves.length);
        setSelectedVideo(null);
      },
      isDisabled: currentVideo && currentVideo.isFavorited,
    },
    {
      label: "Cancel",
      action: modalCancelHandler,
    },
  ];

  const listClickHandler = (item) => {
    setSelectedVideo(item);
  };

  return (
    <div className="px-4">
      <div className="pb-2 text-sm font-bold">NOW PLAYING</div>

      {currentVideo && (
        <List
          items={[currentVideo]}
          selectedItem={selectedVideo}
          menuOptions={currentMenuOptions}
          onSelect={listClickHandler}
          emptyMessage="Nothing"
        />
      )}

      {/* <ul className="flex flex-col gap-2">
        {currentVideo ? (
          [currentVideo].map((item) => (
            <ListItem
              key={item.id}
              item={item}
              menuOptions={currentMenuOptions}
              onSelect={listClickHandler}
            />
          ))
        ) : (
          <div className="italic">Nothing</div>
        )}
      </ul> */}

      <div className="pb-2 pt-4 text-sm font-bold">IN QUEUE</div>
      <List
        items={currentQueue}
        selectedItem={selectedVideo}
        menuOptions={queueMenuOptions}
        onSelect={listClickHandler}
        emptyMessage="Nothing"
      />
    </div>
  );
}
