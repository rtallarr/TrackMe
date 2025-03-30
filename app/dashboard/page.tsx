import { WinRate } from "@/app/dashboard/components/chess";
import ThemeChanger from "@/components/ThemeChanger";

export default function Page() {

    return (
        <div>
            <ThemeChanger />
            <WinRate />
        </div>
    );
}