# StudyMesh

A study workspace where a student **and** an AI agent work on the same board — tasks, slide decks, flashcards, quizzes, focus sessions, and progress tracking — through [WebMCP](https://github.com/webmachinelearning/webmcp).

Built for the WebMCP Challenge (Devpost).

**Stack**: Python (FastAPI) backend + plain HTML/CSS/JavaScript frontend. WebMCP tools are registered in the frontend JS (`document.modelContext` is a browser API — it has to run client-side), and every tool calls straight into the Python backend, same as the human UI.

# Features

- **Task board** — Kanban-style, drag-and-drop, editable by the student or the agent
- **Alarms** — set a study reminder for a specific time; fires a browser notification, an in-app popup, and a beep, whether set by the student or the agent
- **Flashcards** — flip-card review sets, generated per topic
- **Quiz zone** — topic quizzes with real curated content for common syllabus topics (Physics, Chemistry, Biology, History, CS, Math), scored instantly, with wrong answers quietly logged as weak areas
- **Focus timer** — Pomodoro-style sessions, startable by the student or the agent
- **Progress dashboard** — live donut and bar charts (task status, completion by subject), streak, XP, badges
- **Motivational quotes** — a short quote pops up after finishing a quiz, completing a focus session, or crossing a 2-hour daily study milestone

## Why this is a strong fit for WebMCP

Most "AI study apps" are a chatbot bolted onto the side of a normal app — the agent talks, the human still does all the clicking. StudyMesh instead exposes its **real actions** — add a task, build a quiz, start a focus session, reschedule a week — as WebMCP tools on `document.modelContext`. The agent doesn't describe what to do; it does it, on the same board the student sees, by calling the same FastAPI endpoints the student's own clicks call. There's exactly one source of truth (the Python backend) and two actors who can change it.

## How it creates a better user experience

- A student under exam pressure doesn't need to translate "I have 5 days left, replan my week" into ten manual drag-and-drop actions — the agent can do it directly, live, in front of them.
- Generating a slide deck, a flashcard set, or a quiz for a topic used to mean leaving the app to ask a chatbot, then copy-pasting the result back in. Here, the agent puts the content directly onto the board a student is already looking at.
- Because the state lives on the server and both actors read/write it the same way, the student can always take over mid-task — flip a card, drag a task, answer a quiz question — without breaking whatever the agent was doing.

## What's now possible that wasn't before

Before: a student and an AI assistant operated in two separate surfaces — a chat window and an app — and every handoff between them was manual copy-paste. After: the agent is a second, equally capable editor of the same board. "Reschedule my week," "quiz me on thermodynamics," and "how am I doing in Physics?" are all answered by direct action or read on the live board, not by a description of what the student should go do themselves.

## How WebMCP is implemented

`frontend/js/mcp.js` registers seven tools on `document.modelContext` when a WebMCP-capable host is present (e.g. WebMCP-enabled Chrome, or an agent's in-app browser):

- `add_study_task`
- `reschedule_tasks`
- `set_alarm`
- `generate_flashcards`
- `generate_quiz`
- `start_focus_session`
- `track_progress`

Each tool's `execute` function calls the same `api.js` functions the human-facing UI calls, which hit the FastAPI backend (`backend/main.py` → `backend/store.py`) — so an agent call and a mouse click produce identical, indistinguishable state changes on the server. The in-app "Ask agent" bar at the bottom of the screen exercises the same action layer locally, so the collaboration is demonstrable even without a live WebMCP host attached.

## Running locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Then open **http://127.0.0.1:8000** — FastAPI serves both the API and the static frontend from one origin (no CORS setup needed).

## Deploying

Any host that runs a Python/ASGI app works — Render, Railway, Fly.io, etc. Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Project structure

```
backend/
  main.py                FastAPI app — REST endpoints for tasks, alarms,
                          flashcards, quizzes, focus sessions, progress; also
                          serves the static frontend
  store.py                In-memory shared state (swap for SQLite if you need
                          persistence across restarts)
  content_generators.py   Local, deterministic slide/flashcard/quiz generation
                          (no LLM API key required)
  requirements.txt

frontend/
  index.html
  css/styles.css          Design tokens + component styles
  js/
    app.js                 Tab routing + render loop
    api.js                  Fetch wrapper around the backend
    state.js                Client-side cache of server state + pub-sub
    mcp.js                  WebMCP tool registration + shared agent-action layer
    components/             One render()/attach() pair per section
```

## License

MIT — see `LICENSE`.
