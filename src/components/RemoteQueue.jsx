import { useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { addToFavorites, isInFavorites } from "../util/faves";
import List from "./List";
import useRemoteSync from "../hooks/useRemoteSync";

export default function RemoteQueue() {
  const { playerID } = useParams();
  const { setFavesCount } = useOutletContext();

  const [selectedVideo, setSelectedVideo] = useState(null);
  const { playerIsPlaying, currentQueue, currentVideo, emitEvent } =
    useRemoteSync({ playerID });

  const modalCancelHandler = (e) => {
    e.stopPropagation();
    setSelectedVideo(null);
  };

  const queueMenuOptions = [
    {
      label: "Play",
      action: (e) => {
        e.stopPropagation();
        emitEvent("play-video", { video: selectedVideo });
        emitEvent("remove-from-queue", { video: selectedVideo });
        setSelectedVideo(null);
      },
    },
    {
      label: "Add to favorites",
      action: (e) => {
        const newFaves = addToFavorites(selectedVideo);

        e.stopPropagation();
        setFavesCount(newFaves.length);
        setSelectedVideo(null);
      },
      isDisabled: selectedVideo && isInFavorites(selectedVideo.id),
    },
    {
      label: "Remove from queue",
      action: (e) => {
        e.stopPropagation();
        emitEvent("remove-from-queue", { video: selectedVideo });
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
        emitEvent("restart-current-video");
        setSelectedVideo(null);
      },
    },
    {
      label: playerIsPlaying ? "Pause" : "Play",
      action: (e) => {
        e.stopPropagation();

        if (playerIsPlaying) {
          emitEvent("pause-current-video");
        } else {
          emitEvent("play-current-video");
        }
      },
    },
    {
      label: "Add to favorites",
      action: (e) => {
        const newFaves = addToFavorites(currentVideo);

        e.stopPropagation();
        setFavesCount(newFaves.length);
        setSelectedVideo(null);
      },
      isDisabled: currentVideo && isInFavorites(currentVideo.id),
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
