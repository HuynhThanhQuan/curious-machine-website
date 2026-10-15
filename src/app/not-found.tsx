import Link from "next/link";
export const metadata = { title: "Page not found" };
export default function NotFound() {
  return (
    <main id="content" className="lab-page">
      <article className="lab-article">
        <Link className="lab-back" href="/">← Curious Machine</Link>
        <h1>Page not found.</h1>
        <p>This page does not exist or has moved.</p>
        <p>
          <Link href="/">Back to the home page</Link>
        </p>
      </article>
    </main>
  );
}
