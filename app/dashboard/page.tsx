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
    <div className="space-y-8 py-8 px-64">
      <SpotifyTopTracks />
      {usernames && usernames["Steam"] ? (
        <Playtime steamId={usernames["Steam"]} />
      ) : null}
      {usernames && usernames["Chess.com"] ? (
        <WinRate />
      ) : null}
    </div>
  );
}