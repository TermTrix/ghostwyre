import { configureStore } from "@reduxjs/toolkit";
import sessionSlice from "./reducers/sessionSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      session: sessionSlice,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
