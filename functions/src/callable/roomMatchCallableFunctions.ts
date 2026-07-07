import { onCall } from "firebase-functions/v2/https";

import { createFirestoreRoomMatchCallableDeps } from "../integrations/roomMatchFirestore";
import {
  createRoomCallableHandler,
  joinRoomCallableHandler,
  startMatchCallableHandler,
  submitMoveCallableHandler,
} from "./roomMatchCallables";

const deps = createFirestoreRoomMatchCallableDeps();

export const createRoom = onCall(createRoomCallableHandler(deps));
export const joinRoom = onCall(joinRoomCallableHandler(deps));
export const startMatch = onCall(startMatchCallableHandler(deps));
export const submitMove = onCall(submitMoveCallableHandler(deps));
