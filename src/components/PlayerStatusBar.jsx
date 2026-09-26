export default function PlayerStatusBar({ currentVideo, queue }) {
  return (
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
  );
}
