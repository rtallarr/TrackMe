'use client'

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const cardData = [
    { title: "Spotify", description: "This is the description for card 1.", footer: "Footer 1" },
    { title: "Github", description: "This is the description for card 2.", footer: "Footer 2" },
    { title: "Chess.com", description: "This is the description for card 3.", footer: "Footer 3", open: true },
    { title: "Lichess", description: "This is the description for card 4.", footer: "Footer 4" },
    { title: "Valorant", description: "This is the description for card 5.", footer: "Footer 5" },
    { title: "League of legends", description: "This is the description for card 6.", footer: "Footer 6" },
    { title: "OSRS", description: "This is the description for card 7.", footer: "Footer 7", open: true },
    { title: "Runescape", description: "This is the description for card 8.", footer: "Footer 8", open: true },
    { title: "Twitter", description: "This is the description for card 9.", footer: "Footer 9" },
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

    const setUsername = (appName: string) => {
        const input = inputRefs.current[appName];
        const newUsername = input?.value || "";

        const updatedUsernames = {
            ...usernames,
            [appName]: newUsername,
        };

        setUsernames(updatedUsernames);
        localStorage.setItem("appsUsernames", JSON.stringify(updatedUsernames));
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardData.map((card, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="space-y-2">
                            <p>{card.description}</p>
                            {card.open && (                    
                                <Input
                                id={`username-${index}`}
                                placeholder="Username"
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