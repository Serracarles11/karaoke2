import Link from "next/link";

export default function Home() {
  return (
    <main className="screen-shell relative min-h-screen overflow-hidden bg-[#08111f] text-white">
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
          className="tv-glass-button rounded-full bg-[linear-gradient(135deg,#ffd36b,#ff8c59)] px-[clamp(24px,2.4vw,38px)] py-[clamp(12px,1.2vw,18px)] text-[clamp(0.95rem,1.1vw,1.15rem)] font-black text-[#1f1305] shadow-[0_10px_40px_rgba(255,146,89,0.32)] transition hover:brightness-105"
        >
          Ir a la pantalla de bolas
        </Link>
      </section>
    </main>
  );
}
