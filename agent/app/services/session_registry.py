"""Maps a live Socket.IO connection (sid) to its persistent conversation.

The `thread_id` is what gives the LangGraph agent memory across turns: as long
as every message from the same conversation reuses the same thread_id, the
checkpointer reloads the prior state (including message history) automatically.

We key the thread_id on the client's `session_id` (the id handed out by
`GET /connect`), so a browser refresh / socket reconnect resumes the same
conversation instead of starting a blank one.
"""

_sessions: dict[str, dict] = {}


def register(sid: str, user: dict, session_id: str) -> dict:
    entry = {
        "thread_id": session_id,   # stable per conversation → memory
        "session_id": session_id,
        "user": user,
    }
    _sessions[sid] = entry
    return entry


def get(sid: str) -> dict | None:
    return _sessions.get(sid)


def drop(sid: str) -> None:
    _sessions.pop(sid, None)
