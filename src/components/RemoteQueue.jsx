import List from "./List";
import useRemoteList from "../hooks/useRemoteList";

export default function RemoteQueue() {
  const {
    currentQueue,
    currentVideo,
    currentMenuOptions,
    listClickHandler,
    queueMenuOptions,
    selectedVideo,
  } = useRemoteList();

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
