"""
Single shared state, held in-memory on the server.

Both the human-facing frontend and the WebMCP tools (also called from the
frontend, via document.modelContext) go through the same FastAPI endpoints,
which call these same functions — so there's one source of truth no matter
who (human or agent) is acting on the board.

In-memory means state resets on server restart. Swap `_state` for a real
DB (SQLite is enough) if you need persistence across restarts.
"""

import time
import uuid
from datetime import datetime, timedelta
from content_generators import make_flashcards, make_quiz

SUBJECT_SEED = [
    {"id": "t1", "title": "Revise Thermodynamics ch.4", "subject": "Physics", "priority": "high", "status": "todo", "due": "Tomorrow"},
    {"id": "t2", "title": "Solve DSA sheet — Trees", "subject": "CS", "priority": "med", "status": "doing", "due": "Fri"},
    {"id": "t3", "title": "Read Mughal Empire notes", "subject": "History", "priority": "low", "status": "done", "due": "Done"},
]

_state = {
    "tasks": [dict(t) for t in SUBJECT_SEED],
    "alarms": [],
    "flashcard_sets": [],
    "quizzes": [],
    "focus": {"active": False, "start_time": None, "duration_seconds": 0, "subject": None},
    "xp": 120,
    "streak": 3,
    "badges": ["First Task Done"],
    "agent_log": [],
    "weak_areas": [],
    "total_focus_seconds": 0,
}


def _uid(prefix: str) -> str:
    return f"{prefix}_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"


def _log(text: str):
    entry = {"id": _uid("log"), "text": text, "ts": int(time.time() * 1000)}
    _state["agent_log"].insert(0, entry)
    _state["agent_log"] = _state["agent_log"][:12]


def get_state() -> dict:
    _sync_focus()
    return _state


def _sync_focus():
    """Derive remaining_seconds from wall-clock time and auto-complete when done."""
    focus = _state["focus"]
    if not focus["active"] or focus["start_time"] is None:
        focus["remaining_seconds"] = 0
        return
    elapsed = time.time() - focus["start_time"]
    remaining = max(0, focus["duration_seconds"] - elapsed)
    focus["remaining_seconds"] = int(remaining)
    if remaining <= 0 and focus["active"]:
        focus["active"] = False
        _state["xp"] += 25
        _state["total_focus_seconds"] += focus["duration_seconds"]
        _log("Focus session complete — +25 XP")


# ---------- Tasks ----------

def add_task(title: str, subject: str = "General", priority: str = "med", due: str = "This week", by_agent: bool = False) -> dict:
    task = {"id": _uid("t"), "title": title, "subject": subject or "General", "priority": priority or "med", "status": "todo", "due": due or "This week"}
    _state["tasks"].insert(0, task)
    if by_agent:
        _log(f'Added task "{title}"')
    _maybe_award_task_badge()
    return task


def move_task(task_id: str, status: str) -> bool:
    for t in _state["tasks"]:
        if t["id"] == task_id:
            t["status"] = status
            if status == "done":
                _state["xp"] += 15
            _maybe_award_task_badge()
            return True
    return False


def reschedule_tasks(task_ids: list[str] | None, due_label: str, priority: str | None = None) -> int:
    ids = set(task_ids) if task_ids else {t["id"] for t in _state["tasks"] if t["status"] != "done"}
    count = 0
    for t in _state["tasks"]:
        if t["id"] in ids:
            t["due"] = due_label
            if priority:
                t["priority"] = priority
            count += 1
    _log(f"Rescheduled {count} task(s) — {due_label}")
    return count


def _maybe_award_task_badge():
    done = len([t for t in _state["tasks"] if t["status"] == "done"])
    if done >= 3 and "Task Streak" not in _state["badges"]:
        _state["badges"].append("Task Streak")
        _log("New badge unlocked — Task Streak")


# ---------- Alarms ----------

def _parse_alarm_time(time_str: str) -> float:
    """Accepts 'HH:MM' (24hr, e.g. '18:30'). Schedules for today, or
    tomorrow if that time has already passed today."""
    time_str = (time_str or "").strip()
    now = datetime.now()
    try:
        hour, minute = [int(p) for p in time_str.split(":")]
    except (ValueError, AttributeError):
        # Fallback: 30 minutes from now if we can't parse the input
        return (now + timedelta(minutes=30)).timestamp()

    target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if target <= now:
        target += timedelta(days=1)
    return target.timestamp()


def add_alarm(time_str: str, subject: str = "Study", note: str = "", by_agent: bool = False) -> dict:
    trigger_time = _parse_alarm_time(time_str)
    display_time = datetime.fromtimestamp(trigger_time).strftime("%H:%M")
    alarm = {
        "id": _uid("al"),
        "time": display_time,
        "subject": subject or "Study",
        "note": note or "",
        "trigger_time": trigger_time,
        "fired": False,
    }
    _state["alarms"].append(alarm)
    _state["alarms"].sort(key=lambda a: a["trigger_time"])
    if by_agent:
        _log(f'Set an alarm for {display_time} — {subject or "Study"}')
    return alarm


def fire_alarm(alarm_id: str) -> dict | None:
    for a in _state["alarms"]:
        if a["id"] == alarm_id and not a["fired"]:
            a["fired"] = True
            _log(f'Alarm rang — {a["subject"]} ({a["time"]})')
            return a
    return None


def cancel_alarm(alarm_id: str) -> bool:
    before = len(_state["alarms"])
    _state["alarms"] = [a for a in _state["alarms"] if a["id"] != alarm_id]
    return len(_state["alarms"]) < before


# ---------- Flashcards / Quizzes ----------

def add_flashcards(topic: str, by_agent: bool = False) -> dict:
    cards = make_flashcards(topic)
    deck = {"id": _uid("fc"), "topic": topic, "cards": cards}
    _state["flashcard_sets"].insert(0, deck)
    if by_agent:
        _log(f'Generated {len(cards)} flashcards on "{topic}"')
    return deck


def add_quiz(topic: str, by_agent: bool = False) -> dict:
    questions = make_quiz(topic)
    quiz = {"id": _uid("qz"), "topic": topic, "questions": questions}
    _state["quizzes"].insert(0, quiz)
    if by_agent:
        _log(f'Built a {len(questions)}-question quiz on "{topic}"')
    return quiz


def record_quiz_answer(quiz_id: str, question_index: int, selected_index: int) -> dict | None:
    quiz = next((q for q in _state["quizzes"] if q["id"] == quiz_id), None)
    if not quiz or question_index >= len(quiz["questions"]):
        return None
    question = quiz["questions"][question_index]
    correct = selected_index == question["correct_index"]
    _state["xp"] += 10 if correct else 2
    if correct:
        _state["weak_areas"] = [w for w in _state["weak_areas"] if w != quiz["topic"]]
    elif quiz["topic"] not in _state["weak_areas"]:
        _state["weak_areas"].append(quiz["topic"])
    return {"correct": correct, "correct_index": question["correct_index"]}


# ---------- Focus sessions ----------

def start_focus(minutes: int, subject: str = "Study", by_agent: bool = False) -> dict:
    _state["focus"] = {
        "active": True,
        "start_time": time.time(),
        "duration_seconds": minutes * 60,
        "subject": subject or "Study",
    }
    if by_agent:
        _log(f"Started a {minutes}-min focus session — {subject or 'Study'}")
    return _state["focus"]


def stop_focus():
    _state["focus"] = {"active": False, "start_time": None, "duration_seconds": 0, "subject": None}


# ---------- Progress summary (used by the track_progress WebMCP tool) ----------

def progress_summary() -> dict:
    done = len([t for t in _state["tasks"] if t["status"] == "done"])
    total = len(_state["tasks"])
    return {
        "done": done,
        "total": total,
        "xp": _state["xp"],
        "streak": _state["streak"],
        "weak_areas": list(_state["weak_areas"]),
    }
