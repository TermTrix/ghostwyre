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
      state.messages.push(action.payload);
    },
  },
});

export const { setAgentConnected, setGhostMessages } = sessionSlice.actions;

export default sessionSlice.reducer;