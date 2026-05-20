import Link from "next/link";
import LoadingScreenMusic from "./components/LoadingScreenMusic";

export default function Home() {
  return (
    <main className="screen-shell relative min-h-screen overflow-hidden bg-[#08111f] text-white">
      <LoadingScreenMusic />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/intro-poster.jpg"
        aria-hidden="true"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/intro-optimized.webm" type="video/webm" />
        <source src="/intro-optimized.mp4" type="video/mp4" />
      </video>

      <section className="screen-fill relative z-10 flex min-h-screen items-end justify-center px-6 pb-[max(8vh,2.5rem)] pt-10">
        <Link
          href="/bombo"
          className="loading-button"
        >
          Jugar
        </Link>
      </section>
    </main>
  );
}
