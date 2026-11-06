# Job Support Hub

A free, static website that helps people build a resume, write a cover letter,
find work, and prepare for an interview — plus training material for ministers
and leaders supporting someone who is out of work.

**No accounts. No database. No personal data ever leaves the visitor's device.**
Everything a visitor types is kept in their own browser's local storage. The
site has no server code, so there is nothing to maintain and nothing to breach.

## How it works

The site does not call any AI service itself — which is what keeps it free to
run and free of API keys. Instead it asks the visitor plain questions, builds a
well-formed prompt from the answers, and hands it off: the visitor copies it and
pastes it into Claude, ChatGPT or Gemini in another tab.

## Files

| File | What it is |
|---|---|
| `index.html` | Home page |
| `intro.html` | "New here? Start with this" — the overview video |
| `resume.html` | The whole visitor flow: resume wizard, job links, cover letter, interview prep |
| `leaders.html` | Minister and leader training, two videos |
| `help.html` | Help pages, switched by `?t=handoff\|interview\|resume\|cover\|links` |
| `404.html` | Not-found page |
| `nav.js` | The "Where you are" menu panel and favicon, shared by every page |
| `favicon.svg` | Site icon |
| `video/` | Videos and poster images |

## Editing it

Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework.
Edit a file, commit, push — the live site updates.

To preview locally:

    python3 -m http.server 8000

then open http://localhost:8000 — serve it rather than opening the files
directly, because the "Copy my information" button needs a secure context and
`file://` is not one (`localhost` is).

## Adding a video

Drop the file into `video/` and reference it from the page. `intro.html`
expects `video/intro.mp4` and shows a "coming soon" placeholder until that
file exists, so adding the video is the only step.

## Help pages

`help.html` is one file serving every help topic. To add one, add an entry to
the `TOPICS` object near the bottom and link to `help.html?t=yourtopic`.
Inside the wizard, `helpRow('topic','Label')` renders the link row.
