import { useState } from "react";
import { useLoaderData, useParams } from "react-router";
import useRemoteSync from "../hooks/useRemoteSync";
import { addToFavorites, isInFavorites } from "../util/faves";
import { getNextPage } from "../util/yt";
import ErrorComponent from "./ErrorComponent";
import List from "./List";
import { AnimatedMessage } from "./Loader";

export default function RemoteSearch() {
  const { items, hasNextPage } = useLoaderData();
  const { playerID } = useParams();
  const { emitEvent, currentQueue, currentVideo } = useRemoteSync({ playerID });
  const queueIds = [...currentQueue, currentVideo]
    .map((item) => item?.id)
    .filter(Boolean);

  const [currentItems, setCurrentItems] = useState(items);
  const [currentHasNextPage, setCurrentHasNextPage] = useState(hasNextPage);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);

  const loadMoreHandler = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { items, hasNextPage } = await getNextPage();

      setCurrentItems((currentItems) => {
        return [...currentItems, ...items];
      });
      setCurrentHasNextPage(hasNextPage);
    } catch (error) {
      setError(error.message);
    }

    setIsLoading(false);
  };

  const listClickHandler = (item) => {
    setSelectedVideo(item);
  };

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
      isDisabled: selectedVideo && queueIds.includes(selectedVideo.id),
    },
    {
      label: "Add to favorites",
      action: (e) => {
        e.stopPropagation();
        addToFavorites(selectedVideo);
        setSelectedVideo(null);
      },
      isDisabled: selectedVideo && isInFavorites(selectedVideo.id),
    },
    {
      label: "Cancel",
      action: modalCancelHandler,
    },
  ];

  return (
    <div className="px-4">
      {currentItems.length === 0 ? (
        <div className="pb-2 text-sm font-bold">NO RESULTS</div>
      ) : (
        <>
          <div className="pb-2 text-sm font-bold">SEARCH RESULTS</div>

          <List
            items={currentItems.filter(
              (obj, index, self) =>
                index === self.findIndex((o) => o.id === obj.id),
            )}
            selectedItem={selectedVideo}
            menuOptions={menuOptions}
            onSelect={listClickHandler}
          />

          {currentHasNextPage && !isLoading && (
            <button
              className="w-full p-2 bg-white/50 my-2 rounded-2xl"
              type="button"
              onClick={loadMoreHandler}
              disabled={isLoading}
            >
              Load more
            </button>
          )}

          {isLoading && (
            <div className="my-2 h-10">
              <AnimatedMessage message="Loading more..." heightClass="h-10" />
            </div>
          )}

          {error && <ErrorComponent className="mt-2" message={error} />}
        </>
      )}
    </div>
  );
}
