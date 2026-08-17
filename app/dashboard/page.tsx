import { cookies } from "next/headers";
import { Playtime } from "@/app/dashboard/components/steam";
import { WinRate } from "./components/chess";
import { SpotifyTopTracks } from "./components/spotify";

export default async function Page() {
  const cookieStore = await cookies();
  const usernamesCookie = cookieStore.get("usernames")?.value;

  let usernames = null;
  if (usernamesCookie) {
    try {
      usernames = JSON.parse(usernamesCookie);
    } catch (error) {
      console.error("Error parsing usernames cookie:", error);
    }
  }

  return (
    <div className="py-8 px-4 md:px-8 lg:px-16 xl:px-32">
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <div className="flex-2">
          <SpotifyTopTracks />
        </div>

        <div className="flex-1">
          {usernames && usernames["Chess.com"] ? <WinRate /> : null}
        </div>
      </div>

      <div className="mt-8">
        {usernames && usernames["Steam"] ? <Playtime steamId={usernames["Steam"]} /> : null}
      </div>
    </div>
  );
}