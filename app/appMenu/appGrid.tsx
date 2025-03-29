'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const cardData = [
    {
        title: "Spotify",
        description: "This is the description for card 1.",
        footer: "Footer 1",
    },
    {
        title: "Github",
        description: "This is the description for card 2.",
        footer: "Footer 2",
    },
    {
        title: "Chess.com",
        description: "This is the description for card 3.",
        footer: "Footer 3",
        username: "",
    },
    {
        title: "Lichess",
        description: "This is the description for card 4.",
        footer: "Footer 4",
    },
    {
        title: "Valorant",
        description: "This is the description for card 5.",
        footer: "Footer 5",
    },
    {
        title: "League of legends",
        description: "This is the description for card 6.",
        footer: "Footer 6",
    },
    {
        title: "OSRS",
        description: "This is the description for card 7.",
        footer: "Footer 7",
    },
    {
        title: "Runescape",
        description: "This is the description for card 8.",
        footer: "Footer 8",
    },
    {
        title: "Twitter",
        description: "This is the description for card 9.",
        footer: "Footer 9",
    },
];

export default function AppGrid() {
    const setUsername = (index: number) => {
        const card = cardData[index];
        if (card.username !== undefined) {
            card.username = "NewUsername";
            console.log(`Username set for ${card.title}:`, card.username);
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cardData.map((cardData, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>{cardData.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                            {cardData.description}
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Username for app" />
                        </CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" className="m-auto w-full" onClick={() => setUsername(index)}>Connect</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}