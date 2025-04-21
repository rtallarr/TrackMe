'use client'

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const cardData = [
    { title: "Spotify", description: "Track your top songs and artists." },
    { title: "Steam", description: "See your playtime stats and favorite games.", prompt: "Steam ID" },
    { title: "Github", description: "View your contribution history." },
    { title: "Chess.com", description: "Track wins, losses, and rating.", prompt: "Username" },
    { title: "Lichess", description: "Analyze your recent matches." },
    { title: "Valorant", description: "View your match history and rank." },
    { title: "League of Legends", description: "Get your stats and match history." },
    { title: "Runescape/OSRS", description: "Track your skills and quests.", prompt: "Username", open: true },
    { title: "Twitter", description: "Analyze your tweets and growth." },
];

export default function AppGrid() {
    const [usernames, setUsernames] = useState<Record<string, string>>({});
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        const stored = localStorage.getItem("appsUsernames");
        if (stored) {
            setUsernames(JSON.parse(stored));
        }
    }, []);

    const setUsername = async (appName: string) => {
        const input = inputRefs.current[appName];
        const newUsername = input?.value.trim() || "";

        if (!newUsername) {
            toast.info(`Please enter a valid ${appName} username.`);
            return;
        }
      
        const updatedUsernames = {
          ...usernames,
          [appName]: newUsername,
        };
      
        setUsernames(updatedUsernames);
        localStorage.setItem("appsUsernames", JSON.stringify(updatedUsernames));
        
        try {
            const res = await fetch("/api/save-usernames", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUsernames),
                credentials: 'include'
            });

            if (res.ok) {
                toast.success(`Saved ${appName} username.`);
            } else {
                toast.error(`Failed to save ${appName} username.`);
            }
        } catch {
            toast.error("Server error. Try again later.");
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardData.map((card, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="space-y-2">
                            <p>{card.description}</p>
                            {card.prompt && (
                                <Input
                                id={`username-${index}`}
                                placeholder={card.prompt}
                                defaultValue={usernames[card.title] || ""}
                                ref={(el) => { inputRefs.current[card.title] = el; }}
                                />
                            )}
                        </CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" className="m-auto w-full" onClick={() => setUsername(card.title)}>
                            Connect
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}