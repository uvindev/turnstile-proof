/** @author Uvin Vindula (IAMUVIN) @website https://iamuvin.com */
import { Workbench } from "@/app/_components/workbench";
import { IntentLink } from "@/components/intent-link";

export default function HomePage() {
  const email = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL || "hello@iamuvin.com";
  const checkout = process.env.NEXT_PUBLIC_TEAM_CHECKOUT_URL;
  const teamHref =
    checkout || `mailto:${email}?subject=TurnstileProof%20Team%20pilot`;
  return (
    <main id="top">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="TurnstileProof home">
          <span>TP</span> TurnstileProof
        </a>
        <nav aria-label="Primary navigation">
          <a href="#audit">Audit</a>
          <a href="#boundary">Boundary</a>
          <a href="#team">Team</a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Cloudflare Turnstile release review</p>
          <h1 id="hero-title">A widget is not proof of server enforcement.</h1>
          <p className="lede">
            Review the client challenge, Siteverify gate, failure tests, and
            production hostnames before a protected form reaches users.
          </p>
          <a className="hero-action" href="#audit">
            Audit the supplied integration
          </a>
        </div>
        <aside className="control-chain" aria-label="Required control chain">
          <p>REQUEST CONTROL / 04 LINKS</p>
          <ol>
            <li>
              <span>01</span>
              <strong>Challenge issues a token</strong>
            </li>
            <li>
              <span>02</span>
              <strong>Server calls Siteverify</strong>
            </li>
            <li>
              <span>03</span>
              <strong>Failure denies the action</strong>
            </li>
            <li>
              <span>04</span>
              <strong>Tests cover expiry and replay</strong>
            </li>
          </ol>
        </aside>
      </section>

      <Workbench />

      <section
        className="evidence-section"
        id="boundary"
        aria-labelledby="boundary-title"
      >
        <div>
          <p className="eyebrow">Evidence boundary</p>
          <h2 id="boundary-title">
            Static coverage stops before Cloudflare’s decision.
          </h2>
        </div>
        <div className="boundary-list">
          <article>
            <strong>Source stays in this tab.</strong>
            <p>
              The analyzer does not call a server, retain snippets, or add code
              to analytics events.
            </p>
          </article>
          <article>
            <strong>Heuristics miss wrappers.</strong>
            <p>
              Generated clients, helper functions, and cross-file control flow
              still need repository review.
            </p>
          </article>
          <article>
            <strong>Runtime tests remain mandatory.</strong>
            <p>
              A clean report cannot prove hostname settings, valid secrets,
              availability, or real bot rejection.
            </p>
          </article>
        </div>
        <a
          href="https://developers.cloudflare.com/turnstile/get-started/server-side-validation/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read Cloudflare’s Siteverify requirements
        </a>
      </section>

      <section className="team-section" id="team" aria-labelledby="team-title">
        <div>
          <p className="eyebrow">Commercial hypothesis</p>
          <h2 id="team-title">
            One integration is free. Teams need the check in every pull request.
          </h2>
          <p>
            Team adds repository extraction, multi-form inventory, reviewed
            exceptions, policy history, and pull-request annotations. Price and
            demand are unverified.
          </p>
        </div>
        <aside className="price-block">
          <span>TEAM / TARGET</span>
          <strong>$18</strong>
          <small>per team / month</small>
          <IntentLink event="team_interest" href={teamHref}>
            Request the Team pilot
          </IntentLink>
        </aside>
      </section>

      <footer>
        <div>
          <span>TurnstileProof 0.1</span>
          <span>Local source analysis</span>
        </div>
        <IntentLink
          event="feedback_intent"
          href={`mailto:${email}?subject=TurnstileProof%20feedback`}
        >
          Send product feedback
        </IntentLink>
        <span>
          Built by{" "}
          <a
            href="https://iamuvin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Uvin Vindula
          </a>
        </span>
      </footer>
    </main>
  );
}
