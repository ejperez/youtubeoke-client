import { useLoaderData, useParams, useOutletContext } from "react-router";
import { removeFromFavorites } from "../util/faves";
import { useState } from "react";
import List from "./List";
import useRemoteSync from "../hooks/useRemoteSync";

export default function RemoteFaves() {
  const faves = useLoaderData();
  const { playerID } = useParams();
  const { setFavesCount } = useOutletContext();
  const { emitEvent } = useRemoteSync({ playerID });

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentFaves, setCurrentFaves] = useState(faves);

  const modalCancelHandler = (e) => {
    e.stopPropagation();
    setSelectedVideo(null);
  };

  const menuOptions = [
    {
      label: "Play",
      action: (e) => {
        e.stopPropagation();
        emitEvent("play-video", { video: selectedVideo });
        setSelectedVideo(null);
      },
    },
    {
      label: "Add to queue",
      action: (e) => {
        e.stopPropagation();
        emitEvent("add-to-queue", { video: selectedVideo });
        setSelectedVideo(null);
      },
    },
    {
      label: "Remove from favorites",
      action: async (e) => {
        const faves = await removeFromFavorites(selectedVideo.id);

        e.stopPropagation();
        setFavesCount(faves.length);
        setCurrentFaves(faves);
        setSelectedVideo(null);
      },
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
      <div className="pb-2 text-sm font-bold">YOUR FAVORITES</div>
      <List
        items={currentFaves}
        selectedItem={selectedVideo}
        menuOptions={menuOptions}
        onSelect={listClickHandler}
      />
    </div>
  );
}
