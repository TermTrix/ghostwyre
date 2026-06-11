"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "..";

type AppStore = ReturnType<typeof makeStore>;

let globalStore: AppStore | null = null;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    globalStore = storeRef.current;
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

export { globalStore };
