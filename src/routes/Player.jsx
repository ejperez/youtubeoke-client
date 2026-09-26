import PlayerFrame from "../components/PlayerFrame";
import PlayerHome from "../components/PlayerHome";
import PlayerStatusBar from "../components/PlayerStatusBar";
import PlayerError from "../components/PlayerError";
import usePlayerId from "../hooks/usePlayerId";
import usePlayerQueue from "../hooks/usePlayerQueue";
import usePlayerSync from "../hooks/usePlayerSync";

export default function Player() {
  const playerID = usePlayerId();
  const {
    currentVideo,
    setCurrentVideo,
    queue,
    setQueue,
    hasError,
    queueRef,
    currentVideoRef,
    playNextInQueue,
    handleOnError,
    handleSkip,
  } = usePlayerQueue();
  const { handleOnReady, handleStateChange } = usePlayerSync({
    playerID,
    queue,
    currentVideo,
    setCurrentVideo,
    setQueue,
    queueRef,
    currentVideoRef,
  });

  return (
    <div className="flex flex-col h-screen">
      <PlayerStatusBar currentVideo={currentVideo} queue={queue} />

      {currentVideo && !hasError ? (
        <PlayerFrame
          videoID={currentVideo.id}
          onEnd={playNextInQueue}
          onError={handleOnError}
          onReady={handleOnReady}
          onPlay={() => handleStateChange(true)}
          onPause={() => handleStateChange(false)}
        />
      ) : hasError ? (
        <PlayerError video={currentVideo} onSkip={handleSkip} />
      ) : (
        <PlayerHome playerID={playerID} />
      )}
    </div>
  );
}
