import {ABOUT_PAGE_CONTENT} from '~/constants/about';

export function AboutPage() {
  const {closing, eyebrow, heading, introduction, promise, story, tagline} =
    ABOUT_PAGE_CONTENT;

  return (
    <article className="about-page">
      <header className="about-page__header">
        <p className="about-page__eyebrow">{eyebrow}</p>
        <h1>{heading}</h1>
        <p className="about-page__introduction">{introduction}</p>
      </header>

      <div className="about-page__cards">
        <section className="about-page__card" aria-labelledby="about-story">
          <h2 id="about-story">{story.heading}</h2>
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="about-page__card" aria-labelledby="about-promise">
          <h2 id="about-promise">{promise.heading}</h2>
          <ul className="about-page__promises">
            {promise.items.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="about-page__closing">
        <p>{closing}</p>
        <p>{tagline}</p>
      </footer>
    </article>
  );
}
