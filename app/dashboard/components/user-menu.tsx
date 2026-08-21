"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type User = {
    id: string;
    username: string;
};

export function UserMenu() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await fetch("/api/auth/me", {
                    cache: "no-store",
                });

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();
                setUser(data.user ?? null);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    if (loading) {
        return null;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/account/login">Login</Link>
                </Button>

                <Button asChild>
                    <Link href="/account/register">Create account</Link>
                </Button>
            </div>
        );
    }

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
        });

        setUser(null);
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm">
                {user.username}
            </span>

            <Button
                variant="outline"
                onClick={handleLogout}
            >
                Logout
            </Button>
        </div>
    );
}