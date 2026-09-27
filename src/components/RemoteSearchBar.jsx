import { Form } from "react-router";
import { cn } from "../util/util";
import { useSearchParams } from "react-router";
import { useRef } from "react";

export default function RemoteSearchBar({ playerID, currentView }) {
  const [searchParams, _] = useSearchParams();
  const keyword = searchParams.get("keyword");
  const keywordField = useRef(null);

  const handleSubmit = () => {
    keywordField.current.blur();
  };

  return (
    <div className="grow">
      <Form
        action={`/${playerID}/remote/search`}
        method="get"
        className="relative z-3"
        onSubmit={handleSubmit}
      >
        <input
          className={cn(
            "w-full bg-black text-white! placeholder:text-white! border-white pl-3 py-2 pr-9 rounded-full border-2",
            {
              "bg-white text-black! ": currentView === "search",
            },
          )}
          name="keyword"
          type="text"
          placeholder="Search YouTube"
          defaultValue={keyword}
          required
          ref={keywordField}
        />

        <svg
          className="size-6 absolute right-3 top-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.65" y1="16.65" x2="21" y2="21" />
        </svg>
      </Form>
    </div>
  );
}
