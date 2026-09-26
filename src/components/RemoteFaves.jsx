import { useLoaderData, useParams, useOutletContext } from "react-router";
import { removeFromFavorites } from "../util/faves";
import { useState } from "react";
import { playVideo } from "../util/yt";
import { addToQueue } from "../util/yt";
import List from "./List";

export default function RemoteFaves() {
  const faves = useLoaderData();
  const { playerID } = useParams();
  const { updateFavesCount } = useOutletContext();

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

        playVideo(playerID, selectedVideo);
        setSelectedVideo(null);
      },
    },
    {
      label: "Add to queue",
      action: (e) => {
        e.stopPropagation();

        addToQueue(playerID, selectedVideo);
        setSelectedVideo(null);
      },
    },
    {
      label: "Remove from favorites",
      action: async (e) => {
        const faves = await removeFromFavorites(selectedVideo.id);

        e.stopPropagation();
        updateFavesCount(faves.length);
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
