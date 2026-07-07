export { getFirebaseClientApp, getFirebaseClientServices } from "@/firebase/clientApp";
export { readFirebaseEmulatorConfig, readFirebaseWebConfig } from "@/firebase/config";
export type { FirebaseClientServices } from "@/firebase/clientApp";
export type { FirebaseEmulatorConfig, FirebaseEnv } from "@/firebase/config";
export {
  createFunctionsCallableIntentInvoker,
  createRoomMatchIntentClient,
  getRoomMatchIntentClient,
  roomMatchCallableNames,
} from "@/firebase/roomMatchIntents";
export type {
  CallableIntentInvoker,
  CreateRoomIntentInput,
  JoinRoomIntentInput,
  RoomIntentResult,
  RoomMatchCallableName,
  RoomMatchIntentClient,
  StartMatchIntentInput,
  StartMatchIntentResult,
  SubmitMoveIntentInput,
  SubmitMoveIntentResult,
} from "@/firebase/roomMatchIntents";
