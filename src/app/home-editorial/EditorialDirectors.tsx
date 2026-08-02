import Link from "next/link";
import styles from "./editorial.module.css";

// Featured Directors — a sage-green interlude where the director cards run
// DOWN the stage along a vertical arc (a rightward-bulging crescent, sizes
// growing toward the apex, a hairline circle tracing the curve) and pop up
// one by one from the bottom of the arc as the section scrolls into view.
// Desktop places each card absolutely from per-card vars; under 900px the
// field collapses back to a wrapping row.

const DIRECTORS = [
  { name: "Noa Vance", role: "Drama · Berlin", img: "/posters/stay-for-tonight.webp", x: "16%", y: "0px", tilt: "-8deg", w: "152px" },
  { name: "Aria Song", role: "Romance · Seoul", img: "/posters/past-lives.jpg", x: "40%", y: "185px", tilt: "-4deg", w: "168px" },
  { name: "Marco Reyes", role: "Series · Chicago", img: "/posters/the-bear.jpg", x: "56%", y: "395px", tilt: "0deg", w: "198px" },
  { name: "Yuki Tanaka", role: "Drama · Montana", img: "/posters/die-my-love.jpg", x: "40%", y: "610px", tilt: "4deg", w: "168px" },
  { name: "Sofia Okonkwo", role: "Shorts · Wenzhou", img: "/posters/fish-bone.jpg", x: "16%", y: "800px", tilt: "8deg", w: "152px" },
];

export default function EditorialDirectors() {
  return (
    <section className={styles.directorsStage}>
      <div className={styles.wrap}>
        <div className={`${styles.directorsHead} scroll-reveal`}>
          <span className={styles.eyebrow}>Design in Motion</span>
          <h2 className={styles.directorsTitle}>Featured Directors</h2>
          <p className={styles.directorsSub}>
            The voices shaping this season&apos;s slate — follow them from first pitch to premiere.
          </p>
        </div>

        <div className={`${styles.dirField} scroll-reveal`}>
          <span className={styles.dirArcLine} aria-hidden="true" />
          {DIRECTORS.map((d, i) => (
            <Link
              key={d.name}
              href="/market/creators"
              aria-label={`See ${d.name}'s profile`}
              className={`${styles.dirCard} dir-pop`}
              style={
                {
                  backgroundImage: `url(${d.img})`,
                  "--dx": d.x,
                  "--dy": d.y,
                  "--tilt": d.tilt,
                  "--w": d.w,
                  // 從下到上: the bottom of the arc rises first.
                  transitionDelay: `${(DIRECTORS.length - 1 - i) * 0.13}s`,
                } as React.CSSProperties
              }
            >
              <span className={styles.dirCardText}>
                <span className={styles.dirName}>{d.name}</span>
                <span className={styles.dirRole}>{d.role}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className={`${styles.directorsCta} scroll-reveal`}>
          <Link href="/market/creators" className={`${styles.btn} ${styles.btnGhost}`}>
            Meet all directors →
          </Link>
        </div>
      </div>
    </section>
  );
}
