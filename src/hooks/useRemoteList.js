import { useState } from "react";
import { useLoaderData, useOutletContext, useParams } from "react-router";
import {
  addToFavorites,
  isInFavorites,
  removeFromFavorites,
} from "../util/faves";
import useRemoteSync from "./useRemoteSync";

export default function useRemoteList() {
  const faves = useLoaderData();
  const { playerID } = useParams();
  const { setFavesCount } = useOutletContext();

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentFaves, setCurrentFaves] = useState(faves);
  const {
    playerIsPlaying,
    currentQueue,
    currentVideo,
    isQueueLoading,
    emitEvent,
  } = useRemoteSync({ playerID });
  const queueIds = [...currentQueue, currentVideo]
    .map((item) => item?.id)
    .filter(Boolean);

  // Common menu options
  const cancelOption = {
    label: "Cancel",
    action: (e) => {
      e.stopPropagation();
      setSelectedVideo(null);
    },
  };

  const playOption = {
    label: "Play",
    action: (e) => {
      e.stopPropagation();
      emitEvent("play-video", { video: selectedVideo });
      setSelectedVideo(null);
    },
  };

  const addToFavoritesOption = {
    label: "Add to favorites",
    action: (e) => {
      const newFaves = addToFavorites(selectedVideo);

      e.stopPropagation();
      setFavesCount(newFaves.length);
      setSelectedVideo(null);
    },
    isDisabled: selectedVideo && isInFavorites(selectedVideo.id),
  };

  const addToQueueOption = {
    label: "Add to queue",
    action: (e) => {
      e.stopPropagation();
      emitEvent("add-to-queue", { video: selectedVideo });
      setSelectedVideo(null);
    },
    isDisabled: selectedVideo && queueIds.includes(selectedVideo.id),
  };

  // Build the menu options
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
    addToFavoritesOption,
    {
      label: "Remove from queue",
      action: (e) => {
        e.stopPropagation();
        emitEvent("remove-from-queue", { video: selectedVideo });
      },
    },
    cancelOption,
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
    cancelOption,
  ];

  const favesMenuOptions = [
    playOption,
    addToQueueOption,
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
    cancelOption,
  ];

  const searchMenuOptions = [
    playOption,
    addToQueueOption,
    addToFavoritesOption,
    cancelOption,
  ];

  const listClickHandler = (item) => {
    setSelectedVideo(item);
  };

  return {
    listClickHandler,
    queueMenuOptions,
    currentMenuOptions,
    currentQueue,
    currentVideo,
    currentFaves,
    selectedVideo,
    favesMenuOptions,
    searchMenuOptions,
    isQueueLoading,
  };
}
