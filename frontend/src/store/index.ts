import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventsSlice';
import queueReducer from './slices/queueSlice';
import merchandiseReducer from './slices/merchandiseSlice';
import uiReducer from './slices/uiSlice';
import videoReducer from './slices/videoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    queue: queueReducer,
    merchandise: merchandiseReducer,
    ui: uiReducer,
    video: videoReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['video/setVideoRoom', 'video/setParticipants'],
        ignoredPaths: ['video.room', 'video.participants'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;