import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AniYan — Anime, without the noise",
  description: "Discover your next favorite anime with a calm, ad-free discovery experience.",
  applicationName: "AniYan",
  icons: { icon: "/aniyan-mark.svg" },
  keywords: ["anime", "anime discovery", "episode guide"],
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}