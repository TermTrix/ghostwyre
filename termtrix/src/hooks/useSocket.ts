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
  isClientConnected: boolean;
}

interface GhostRsponse {
  id: string;
  content: string;
}

const SERVER_URL: string = "http://localhost:8000";

let _socket: Socket | null = null;

export const getSocket = (): Socket | null => _socket;

export const useSocketManager = (session: SocketRequest) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!session.sessionID || session.isClientConnected) return;

    if (!_socket) {
      _socket = io(SERVER_URL, {
        autoConnect: false,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        withCredentials:true
      });
    }

    const socket = _socket;
    console.log(socket, "[FROM HOOK]");

    socket.on("connect", () => {
      console.log("[SOCKET] Connected:", socket.id);
      dispatch(
        setAgentConnected({
          isAgentConnected: true,
          socket_id: socket.id ?? "",
        }),
      );
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Disconnected");
      dispatch(setAgentConnected({ isAgentConnected: false, socket_id: "" }));
    });

    socket.on("agent", (data: GhostRsponse) => {
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
      // handle the response here
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [session.sessionID, session.isClientConnected, dispatch]);

  return {
    _ID: session.sessionID,
  };
};
