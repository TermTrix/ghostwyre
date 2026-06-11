import { createSlice } from "@reduxjs/toolkit";

interface State {
  isAgentConnected: boolean;
  socket_id: string;
}

const initialState: State = {
  isAgentConnected: false,
  socket_id: "",
};

const sessionSlice = createSlice({
  name: "session",
  initialState: initialState,
  reducers: {
    setAgentConnected: (state, action: { type: string; payload: Partial<State> }) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setAgentConnected } = sessionSlice.actions;

export default sessionSlice.reducer