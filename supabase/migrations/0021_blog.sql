-- Blog: posts written in the site editor, reviewed by an admin, then published.
-- All reads and writes go through the server (service role), which also
-- sanitises content before it is stored.
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) BETWEEN 3 AND 90),
  title         TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 150),
  excerpt       TEXT NOT NULL DEFAULT '',
  content_html  TEXT NOT NULL DEFAULT '',
  cover_url     TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  author_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  review_note   TEXT,
  word_count    INT NOT NULL DEFAULT 0,
  views         INT NOT NULL DEFAULT 0,
  submitted_at  TIMESTAMPTZ,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_published ON blog_posts (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS blog_posts_author ON blog_posts (author_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_pending ON blog_posts (submitted_at) WHERE status = 'pending';

-- One view per visitor per post per day.
CREATE TABLE IF NOT EXISTS blog_post_views (
  post_id     UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  viewer_hash TEXT NOT NULL,
  day         DATE NOT NULL DEFAULT current_date,
  PRIMARY KEY (post_id, viewer_hash, day)
);

CREATE OR REPLACE FUNCTION blog_count_view(p_post UUID, p_viewer TEXT) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO blog_post_views (post_id, viewer_hash) VALUES (p_post, p_viewer) ON CONFLICT DO NOTHING;
  IF FOUND THEN
    UPDATE blog_posts SET views = views + 1 WHERE id = p_post;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END $$;
REVOKE ALL ON FUNCTION blog_count_view(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION blog_count_view(UUID, TEXT) TO service_role;

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;
GRANT ALL ON blog_posts, blog_post_views TO service_role;

-- Public bucket for cover and inline images (uploads go through the server).
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- The first post.
INSERT INTO blog_posts (slug, title, excerpt, content_html, cover_url, tags, author_name, status, word_count, submitted_at, published_at, created_at, updated_at)
VALUES (
  'my-rapido-sde-1-off-campus-interview-experience-2026',
  'My Rapido SDE-1 Off-Campus Interview Experience (2026)',
  'Rapido''s off-campus SDE-1 process was an online assessment, two technical rounds (DSA, then DSA plus a system-design-lite round), and one culture/HM round focused on ownership and…',
  $post$<h2>Key Takeaways</h2>
<ul>
<li><p>Rapido's off-campus SDE-1 process was an online assessment, two technical rounds (DSA, then DSA plus a system-design-lite round), and one culture/HM round focused on ownership and speed.</p></li>
<li><p>Rapido doesn't run much campus hiring for engineering roles, so almost everyone in their SDE-1 pipeline comes in off-campus, through a referral or a cold application, same as I did.</p></li>
<li><p>The system design round centered on ride-matching logic, and my first answer completely ignored cancellations, which is exactly the edge case the interviewer pushed on.</p></li>
<li><p>The culture round tested speed of decision-making more than polish, in a way that rewarded an honest, imperfect answer over a rehearsed one.</p></li>
</ul>
<h2>The Challenge: An Off-Campus Application With No Cohort to Compare Notes With</h2>
<p>I graduated without an offer I actually wanted, one of those results where the companies my college's placement drive brought in just didn't overlap with what I was hoping for. Rapido wasn't on any campus list I'd seen, which made sense once I actually looked into it, since most of their engineering hiring seems to happen off-campus rather than through college drives. That meant no placement cell deadlines, no WhatsApp group of classmates going through the same rounds, just me tracking my own applications in a spreadsheet that got emptier and more discouraging by the week.</p>
<p>I applied cold through Rapido's careers page in early July, mostly on a whim after reading about the scale of their real-time driver-matching system, the kind of problem that sounded genuinely interesting rather than just resume-worthy. I didn't expect much given how many of my other cold applications had gone nowhere that month.</p>
<h2>How I Prepared Without a Placement Cell Timeline to Anchor Me</h2>
<p>Off-campus prep, at least in my experience, has a specific kind of loneliness to it. There's no deadline forcing your hand, no group of peers to benchmark against, just your own discipline holding the whole thing together. I split roughly six weeks between DSA, arrays, trees, and graphs mostly, and light system design, since I'd read enough about Rapido's core problem space, real-time location and matching, to guess that a design round was likely even at the SDE-1 level.</p>
<p>I also spent real time trying to understand Rapido's actual product beyond the app icon on my phone, reading about how bike-taxi dispatch differs from a standard e-commerce or content platform, mostly because I wanted my system design answers to reflect the domain rather than sound like a generic textbook parking-lot problem recycled for a different company.</p>
<h2>Applying to Rapido: A Cold Application That Actually Worked</h2>
<p>Unlike a couple of my other attempts that month, the cold application to Rapido actually converted. A recruiter reached out about two weeks later, and the call was mostly logistics, current status, notice period, since I'd graduated recently, and a quick gut check on why a ride-hailing and logistics company interested me specifically. I gave an honest answer, that the matching and dispatch problem sounded more technically interesting to me than most of the other off-campus applications I'd sent that month, and the recruiter didn't seem to mind that it wasn't a rehearsed answer.</p>
<h2>Inside Rapido's Online Assessment and First Technical Round</h2>
<p>The OA had two coding problems, a sliding window question on maximum sum subarray and a graph problem on finding the shortest path in a weighted grid, both fairly standard for the level. I cleared it comfortably and got the technical round invite about eight days later.</p>
<p>The first technical round opened with a coding problem, detect a cycle in a directed graph, which I solved cleanly using DFS with a recursion stack, then moved into a resume discussion where the interviewer specifically asked about a personal project involving real-time data updates, clearly probing for any prior exposure to the kind of problems Rapido actually deals with. I didn't have deep experience there, and said so honestly rather than stretching a vague resume line further than it could hold.</p>
<h2>The Second Technical Round: Where I Missed the Cancellation Case</h2>
<p>The second round is the one I still think about. The question was a system-design-lite prompt: design a basic version of a rider-driver matching system, given a rider's location and a set of nearby drivers, assign the closest available one. I sketched a reasonable enough first pass, a proximity-based matching function using something like a grid-based spatial index, and felt fairly confident until the interviewer asked, "what happens if the driver you matched cancels thirty seconds later?"</p>
<p>I hadn't accounted for that at all. My first design assumed a clean, one-shot match with no failure path, which is a fairly significant gap for a system whose entire domain revolves around exactly that kind of real-world unreliability. I sat with it for a few seconds, admitted the gap directly, "I didn't design for that, let me think through it," and worked out a retry mechanism that re-queried nearby drivers and maintained a short exclusion list so the same cancelling driver wouldn't get immediately reselected. It wasn't a polished answer, but it was a real one, built live instead of recited from memory.</p>
<blockquote><p><strong>What actually mattered:</strong> naming the gap out loud, "I didn't design for that," instead of quietly hoping the interviewer wouldn't notice, is what turned a genuine design flaw into a round I still passed.</p></blockquote>
<h2>The Culture Round: Speed Over Polish</h2>
<p>The final round was with an engineering manager, and it leaned heavily on decision-making under time pressure, which tracks given how fast-moving Rapido's actual product cycles apparently are. He asked about a time I'd had to ship something imperfect because waiting for a better version wasn't realistic, and I talked about a college project where I chose a simpler data structure over a more "correct" one with two days left before a demo, since debugging the more complex option under that timeline felt like the bigger risk. He asked if I'd regret that choice with more time available, and I said no, for that specific deadline, but that the same instinct would worry me on something with real users depending on it, which seemed to land as the right kind of nuance rather than a rehearsed one-liner.</p>
<h2>The Result: My Rapido Offer</h2>
<p>The offer came six days later, through a recruiter call that felt almost understated given how much uncertainty had led up to it. There was no placement cell announcement, no group of classmates to share the moment with immediately, just a phone call, a number, and then the slightly strange task of telling people who hadn't been tracking the process as closely as I had that it had actually worked out.</p>
<h2>Key Takeaways for Anyone Preparing for an Off-Campus Rapido Interview</h2>
<p>If I were prepping for this exact process again:</p>
<ul>
<li><p>I would practice designing for failure cases from the start, not just the happy path, since the cancellation follow-up in my design round exposed a gap I should have anticipated given Rapido's domain.</p></li>
<li><p>I would keep applying in parallel instead of pinning hope on any single cold application, since the Rapido offer came from the one response out of many that actually converted.</p></li>
<li><p>I would trust an honest "I didn't design for that" over stalling or bluffing, since admitting the gap directly is what let me recover instead of getting stuck defending a flawed design.</p></li>
</ul>
<p>If you're deep into your own off campus placement 2026 search right now, sending out applications with no cohort to compare notes with, the <a href="/mock-interview">mock interviews</a> and <a href="/resume-analysis">resume feedback</a> on <a href="/resources">jobalerts24.com</a> can help you get comfortable admitting gaps out loud instead of freezing when a design doesn't hold up, which is exactly what got me through that matching-system round. Reading through other interview experiences 2026 threads helped too, mostly for knowing I wasn't the only one whose first system design attempt missed an obvious edge case.</p>
<h2>Frequently Asked Questions About Rapido's Off-Campus SDE-1 Hiring Process</h2>
<h3>What does Rapido's off-campus interview process for SDE-1 look like?</h3>
<p>In my case it was an online assessment with two coding problems, followed by two technical rounds where the second included a system-design-lite question, and one culture round with an engineering manager focused on decision-making.</p>
<h3>Does Rapido hire SDE-1 engineers through campus placements?</h3>
<p>Not much, based on my experience and research beforehand. Most of Rapido's SDE-1 pipeline appears to run through off-campus applications and referrals rather than college placement drives.</p>
<h3>What kind of system design questions does Rapido ask at the SDE-1 level?</h3>
<p>Domain-specific ones tied to their actual product, in my case a simplified rider-driver matching system. The follow-up question about handling a driver cancellation is what actually tested the design, not the initial happy-path version.</p>
<h3>How should you prepare for an off-campus interview process without a placement cell involved?</h3>
<p>Keep applying to multiple companies in parallel rather than waiting on one response, and use the waiting periods to strengthen the specific gaps a company's domain is likely to test, which for Rapido meant real-time matching and failure handling rather than generic system design patterns.</p>
<h2>Conclusion</h2>
<p>Getting the Rapido SDE-1 offer off-campus wasn't about having some off-campus-specific shortcut. It was one cold application that actually converted out of many that didn't, a system design round where I missed an obvious edge case and said so instead of hiding it, and a culture round that rewarded an honest tradeoff over a polished one. If you're deep in your own off-campus search right now with no cohort to lean on, that loneliness is real, but it doesn't mean the process is any less winnable.</p>$post$,
  '/blog/rapido-sde1-interview.webp',
  ARRAY['Interview Prep', 'Off-Campus', 'System Design'],
  'Ashwini Kumar',
  'published',
  1581,
  '2026-09-09T09:00:00Z', '2026-09-09T09:00:00Z', '2026-09-09T09:00:00Z', '2026-09-09T09:00:00Z'
)
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';
