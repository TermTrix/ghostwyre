import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Message } from "@/components/ghost/types";

interface State {
  isAgentConnected: boolean;
  socket_id: string;
  messages: Message[];
}

const initialState: State = {
  isAgentConnected: false,
  socket_id: "",
  messages: [],
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setAgentConnected: (state, action: { type: string; payload: Partial<State> }) => {
      Object.assign(state, action.payload);
    },
    setGhostMessages: (state, action: PayloadAction<Message>) => {
      // Second line of defence against duplicates: the same event delivered
      // twice (socket re-emit, remount, replayed pub/sub) carries the same id,
      // and a duplicate id would also collide as a React key in the list.
      if (state.messages.some((m) => m.id === action.payload.id)) return;
      state.messages.push(action.payload);
    },
    clearGhostMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setAgentConnected, setGhostMessages, clearGhostMessages } =
  sessionSlice.actions;

export default sessionSlice.reducer;