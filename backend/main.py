"""
StudyMesh backend.

Serves a small REST API backing every board action (tasks, slideshows,
flashcards, quizzes, focus sessions, progress) plus the static frontend.
The frontend registers WebMCP tools on document.modelContext whose
`execute` functions call these same endpoints — so an agent acting through
WebMCP and a student clicking a button hit identical code paths.

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload
"""

from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

import store

app = FastAPI(title="StudyMesh API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"


# ---------- Request models ----------

class AddTaskBody(BaseModel):
    title: str
    subject: Optional[str] = "General"
    priority: Optional[str] = "med"
    due: Optional[str] = "This week"
    by_agent: Optional[bool] = False


class MoveTaskBody(BaseModel):
    status: str


class RescheduleBody(BaseModel):
    task_ids: Optional[list[str]] = None
    due_label: str
    priority: Optional[str] = None


class AlarmBody(BaseModel):
    time: str
    subject: Optional[str] = "Study"
    note: Optional[str] = ""
    by_agent: Optional[bool] = False


class TopicBody(BaseModel):
    topic: str
    by_agent: Optional[bool] = False


class QuizAnswerBody(BaseModel):
    question_index: int
    selected_index: int


class FocusStartBody(BaseModel):
    minutes: Optional[int] = 25
    subject: Optional[str] = "Study"
    by_agent: Optional[bool] = False


# ---------- State ----------

@app.get("/api/state")
def get_state():
    return store.get_state()


# ---------- Tasks ----------

@app.post("/api/tasks")
def add_task(body: AddTaskBody):
    return store.add_task(body.title, body.subject, body.priority, body.due, body.by_agent)


@app.post("/api/tasks/{task_id}/move")
def move_task(task_id: str, body: MoveTaskBody):
    ok = store.move_task(task_id, body.status)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}


@app.post("/api/tasks/reschedule")
def reschedule_tasks(body: RescheduleBody):
    count = store.reschedule_tasks(body.task_ids, body.due_label, body.priority)
    return {"ok": True, "count": count}


# ---------- Alarms ----------

@app.post("/api/alarms")
def add_alarm(body: AlarmBody):
    return store.add_alarm(body.time, body.subject, body.note, body.by_agent)


@app.post("/api/alarms/{alarm_id}/fire")
def fire_alarm(alarm_id: str):
    result = store.fire_alarm(alarm_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Alarm not found or already fired")
    return result


@app.post("/api/alarms/{alarm_id}/cancel")
def cancel_alarm(alarm_id: str):
    ok = store.cancel_alarm(alarm_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return {"ok": True}


# ---------- Flashcards / Quizzes ----------

@app.post("/api/flashcards")
def add_flashcards(body: TopicBody):
    return store.add_flashcards(body.topic, body.by_agent)


@app.post("/api/quiz")
def add_quiz(body: TopicBody):
    return store.add_quiz(body.topic, body.by_agent)


@app.post("/api/quiz/{quiz_id}/answer")
def answer_quiz(quiz_id: str, body: QuizAnswerBody):
    result = store.record_quiz_answer(quiz_id, body.question_index, body.selected_index)
    if result is None:
        raise HTTPException(status_code=404, detail="Quiz or question not found")
    return result


# ---------- Focus sessions ----------

@app.post("/api/focus/start")
def start_focus(body: FocusStartBody):
    return store.start_focus(body.minutes or 25, body.subject or "Study", body.by_agent)


@app.post("/api/focus/stop")
def stop_focus():
    store.stop_focus()
    return {"ok": True}


# ---------- Progress (used by the track_progress WebMCP tool) ----------

@app.get("/api/progress")
def progress():
    return store.progress_summary()


# ---------- Static frontend ----------
# Serves the plain HTML/JS/CSS frontend (where WebMCP tools are registered)
# from the same origin, so no CORS setup is needed in production.

app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/")
def index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))
