import { cookies } from "next/headers";
import { Playtime } from "@/app/dashboard/components/steam";
import { WinRate } from "./components/chess";

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
    <div>
      {usernames && usernames["Steam"] ? (
        <Playtime steamId={usernames["Steam"]} />
      ) : (
        <p>No steam ID set</p>
      )}
      <WinRate />
    </div>
  );
}

// App ID
// schedule I - 3164500
// rust - 252490