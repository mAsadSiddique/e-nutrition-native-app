
import {
    combineReducers,
    configureStore,
} from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { auth } from "./auth/reducer";
import { categories } from "./categories/reducer";
import { wishlist } from "./wishlist/reducer";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
    key: "root",
    storage: AsyncStorage,
    whitelist: ["auth", "savedBlogs", "categories", "wishlist"],
};

const rootReducer = combineReducers({
    auth,
    categories,
    wishlist,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

let store: ReturnType<typeof makeStore>;

function makeStore(preloadedState = undefined) {
    return configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                thunk: true,
                serializableCheck: {
                    ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/FLUSH', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
                },
            }),
        preloadedState,
    });
}

export const initializeStore = (preloadedState = undefined) => {
    let _store = store ?? makeStore(preloadedState);

    // After navigating to a page with an initial Redux state, merge that state
    // with the current state in the store, and create a new store
    if (preloadedState && store) {
        _store = makeStore({
            ...store.getState(),
            ...(preloadedState as object as any), // eslint-disable-line @typescript-eslint/no-explicit-any
        });
        // Reset the current store
    }

    // For SSG and SSR always create a new store
    if (typeof window === "undefined") return _store;

    // Create the store once in the client
    if (!store) {
        store = _store;
    }

    return _store;
};

store = initializeStore();

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch();

export default store;

export const persistor = persistStore(store);

export function useStore(initialState = undefined) {
    return useMemo(() => initializeStore(initialState), [initialState]);
}
