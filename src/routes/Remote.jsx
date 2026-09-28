import { useParams, Outlet } from "react-router";
import Loader from "../components/Loader";
import RemoteSearchBar from "../components/RemoteSearchBar";
import RemoteNav from "../components/RemoteNav";
import useRemoteView from "../hooks/useRemoteView";
import useFavesCount from "../hooks/useFavesCount";
import RemoteLogo from "../components/RemoteLogo";

export default function Remote() {
  const { playerID } = useParams();
  const { currentView } = useRemoteView();
  const { favesCount, setFavesCount } = useFavesCount();

  return (
    <>
      <header className="flex fixed top-0 z-1 w-full bg-black/50 py-1 px-2 gap-1">
        <RemoteLogo />
        <RemoteSearchBar playerID={playerID} currentView={currentView} />
        <RemoteNav
          playerID={playerID}
          currentView={currentView}
          favesCount={favesCount}
        />
      </header>

      <div className="mt-14">
        <Loader>
          <Outlet
            context={{
              setFavesCount,
            }}
          />
        </Loader>
      </div>
    </>
  );
}
