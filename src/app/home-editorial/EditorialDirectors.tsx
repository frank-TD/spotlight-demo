import Link from "next/link";
import styles from "./editorial.module.css";

// Featured Directors — a sage-green interlude of tilted director cards that
// pop up one by one as the section scrolls into view (the row carries the
// scroll-reveal class; per-card stagger rides transition-delay vars).

const DIRECTORS = [
  { name: "Noa Vance", role: "Drama · Berlin", img: "/posters/stay-for-tonight.webp", tilt: "-7deg", lift: "18px" },
  { name: "Aria Song", role: "Romance · Seoul", img: "/posters/past-lives.jpg", tilt: "-3deg", lift: "0px" },
  { name: "Marco Reyes", role: "Series · Chicago", img: "/posters/the-bear.jpg", tilt: "0deg", lift: "-14px" },
  { name: "Yuki Tanaka", role: "Drama · Montana", img: "/posters/die-my-love.jpg", tilt: "3deg", lift: "0px" },
  { name: "Sofia Okonkwo", role: "Shorts · Wenzhou", img: "/posters/fish-bone.jpg", tilt: "7deg", lift: "18px" },
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

        <div className={`${styles.dirRow} scroll-reveal`}>
          {DIRECTORS.map((d, i) => (
            <Link
              key={d.name}
              href="/market/creators"
              aria-label={`See ${d.name}'s profile`}
              className={`${styles.dirCard} dir-pop`}
              style={
                {
                  backgroundImage: `url(${d.img})`,
                  "--tilt": d.tilt,
                  "--lift": d.lift,
                  transitionDelay: `${i * 0.12}s`,
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
