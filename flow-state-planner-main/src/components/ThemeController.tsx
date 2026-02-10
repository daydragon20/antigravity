import { useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";

export function ThemeController() {
    const { preferences } = useProfile();

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        let themeToApply = preferences.theme;

        // On first mount, use localStorage if available to prevent flash
        if (themeToApply === "system") {
            const cached = localStorage.getItem("app-theme");
            if (cached && cached !== "system") {
                themeToApply = cached as any;
            } else {
                themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            }
        }

        root.classList.add(themeToApply);
        localStorage.setItem("app-theme", themeToApply);
    }, [preferences.theme]);

    return null;
}
