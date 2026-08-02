import Link from "next/link";
import styles from "./editorial.module.css";

// Featured Directors — a sage-green interlude where the director cards sit
// scattered along an arc (mixed sizes and tilts, a hairline circle tracing
// the curve behind them) and pop up one by one, bottom-up, as the section
// scrolls into view. Desktop places each card absolutely from per-card vars;
// under 900px the field collapses back to a wrapping row.

const DIRECTORS = [
  { name: "Noa Vance", role: "Drama · Berlin", img: "/posters/stay-for-tonight.webp", x: "1%", y: "12px", tilt: "-10deg", w: "148px" },
  { name: "Aria Song", role: "Romance · Seoul", img: "/posters/past-lives.jpg", x: "20%", y: "104px", tilt: "-5deg", w: "172px" },
  { name: "Marco Reyes", role: "Series · Chicago", img: "/posters/the-bear.jpg", x: "41.5%", y: "168px", tilt: "0deg", w: "200px" },
  { name: "Yuki Tanaka", role: "Drama · Montana", img: "/posters/die-my-love.jpg", x: "63%", y: "104px", tilt: "5deg", w: "172px" },
  { name: "Sofia Okonkwo", role: "Shorts · Wenzhou", img: "/posters/fish-bone.jpg", x: "82%", y: "12px", tilt: "10deg", w: "148px" },
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
                  transitionDelay: `${i * 0.13}s`,
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
