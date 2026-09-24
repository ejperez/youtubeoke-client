import { useNavigation } from "react-router";

export function Spinner({ message = "Loading..." }) {
  return (
    <div className="relative flex items-center justify-center w-full overflow-hidden h-20">
      <div
        className="absolute inset-y-0 -left-1/2 -right-1/2 -z-10 opacity-50
         bg-[linear-gradient(-60deg,#f20_50%,#000_50%)]
         h-20
         animate-slide"
      ></div>
      <div
        className="absolute inset-y-0 -left-1/2 -right-1/2 -z-10 opacity-50
         bg-[linear-gradient(-60deg,#f20_50%,#000_50%)]
         h-20
         animate-slide [animation-duration:1s]"
      ></div>
      <div
        className="absolute inset-y-0 -left-1/2 -right-1/2 -z-10 opacity-50
         bg-[linear-gradient(-60deg,#f20_50%,#000_50%)]
         h-20
         animate-slide [animation-duration:2s]"
      ></div>
      <div className="">{message}</div>
    </div>
  );
}

export default function Loader({ children }) {
  const { state } = useNavigation();

  return state === "loading" ? <Spinner /> : children;
}
