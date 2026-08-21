"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ShareCardButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleShare = async () => {
        setLoading(true);

        try {
            const response = await fetch("/api/card", {
                method: "POST",
            });

            const data = await response.json();

            if (response.status === 401) {
                router.push("/login?redirect=/dashboard");
                return;
            }

            if (!response.ok) {
                throw new Error(data.error ?? "Failed to create card");
            }

            router.push(`/card/${data.card.slug}`);
        } catch (error) {
            console.error("Share card error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleShare}
            disabled={loading}
        >
            {loading ? "Creating card..." : "Share Card"}
        </Button>
    );
}