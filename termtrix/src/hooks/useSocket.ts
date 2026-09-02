import { useDispatch } from "react-redux";
import {
  setAgentConnected,
  setGhostMessages,
} from "@/store/reducers/sessionSlice";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import type { AppDispatch } from "@/store";

interface SocketRequest {
  sessionID: string;
}

interface GhostRsponse {
  id: string;
  content: string;
}

const SERVER_URL: string = "http://localhost:8000";

let _socket: Socket | null = null;

export const getSocket = (): Socket | null => _socket;

const ensureSocket = (): Socket => {
  if (!_socket) {
    _socket = io(SERVER_URL, {
      autoConnect: false,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      withCredentials: true,
    });
  }
  return _socket;
};

export const useSocketManager = (session: SocketRequest) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!session.sessionID) return;

    const socket = ensureSocket();

    // Named handlers so the cleanup can remove exactly what it added. The
    // socket is a module singleton that outlives the component, so anonymous
    // listeners (or a cleanup that forgets one) stack up on every re-run and
    // every agent event gets dispatched once per stacked listener — that was
    // the duplicate-message bug.
    const onConnect = () => {
      console.log("[SOCKET] Connected:", socket.id);
      dispatch(
        setAgentConnected({
          isAgentConnected: true,
          socket_id: socket.id ?? "",
        }),
      );
    };

    const onDisconnect = () => {
      console.log("[SOCKET] Disconnected");
      dispatch(setAgentConnected({ isAgentConnected: false, socket_id: "" }));
    };

    const onAgent = (data: GhostRsponse) => {
      console.log("[AGENT]", data);
      dispatch(
        setGhostMessages({
          id: data.id,
          content: data.content,
          role: "assistant",
          timestamp: new Date(),
          isLoading: false,
        }),
      );
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("agent", onAgent);

    if (socket.connected) {
      // Already up from an earlier mount (StrictMode remount / route change):
      // no `connect` event will fire, so sync the store by hand.
      onConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("agent", onAgent);
    };
  }, [session.sessionID, dispatch]);

  return {
    _ID: session.sessionID,
  };
};
