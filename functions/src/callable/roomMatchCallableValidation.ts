import { HttpsError, type FunctionsErrorCode } from "firebase-functions/v2/https";

import { gameIds, type GameId } from "@contracts/gameCatalog";

import type { ServerCommandActor } from "../domain/roomMatchCommands";
import type { RoomMatchCallableRequest } from "./roomMatchCallableTypes";

export async function runCallableOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toHttpsError(error);
  }
}

export function requireActor<T>(request: RoomMatchCallableRequest<T>): ServerCommandActor {
  if (request.auth === undefined) {
    throw new HttpsError("unauthenticated", "sign-in-required");
  }

  const token = request.auth.token;
  const displayName =
    readTokenString(token.name) ?? readTokenString(token.email) ?? request.auth.uid;

  return {
    avatarUrl: readTokenString(token.picture),
    displayName,
    uid: request.auth.uid,
  };
}

export function requireObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HttpsError("invalid-argument", "object-payload-required");
  }

  return value as Record<string, unknown>;
}

export function requireGameId(value: unknown): GameId {
  if (typeof value !== "string" || !gameIds.includes(value as GameId)) {
    throw new HttpsError("invalid-argument", "valid-gameId-required");
  }

  return value as GameId;
}

export function requireString(value: unknown, fieldName: string): string {
  const parsed = readOptionalString(value);

  if (parsed === null) {
    throw new HttpsError("invalid-argument", `${fieldName}-required`);
  }

  return parsed;
}

export function readOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function readOptionalPositiveInteger(value: unknown, fieldName: string): number | null {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new HttpsError("invalid-argument", `${fieldName}-must-be-positive-integer`);
  }

  return value;
}

export function throwInvalidArgument(message: string): never {
  throw new HttpsError("invalid-argument", message);
}

function readTokenString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function toHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) {
    return error;
  }

  if (!(error instanceof Error)) {
    return new HttpsError("internal", "unknown-callable-error");
  }

  return new HttpsError(mapDomainErrorCode(error.message), error.message);
}

function mapDomainErrorCode(message: string): FunctionsErrorCode {
  if (message.endsWith("not-found")) {
    return "not-found";
  }

  if (message === "host-only" || message === "actor-not-player") {
    return "permission-denied";
  }

  if (message === "invalid-move-payload") {
    return "invalid-argument";
  }

  if (message.startsWith("invalid-move:")) {
    return "failed-precondition";
  }

  if (message === "game-not-supported") {
    return "unimplemented";
  }

  if (
    message === "game-not-enabled" ||
    message === "already-in-room" ||
    message === "room-expired" ||
    message === "room-not-open" ||
    message === "room-full" ||
    message === "room-not-full" ||
    message === "room-already-started" ||
    message === "match-not-active" ||
    message === "match-state-missing"
  ) {
    return "failed-precondition";
  }

  return "internal";
}
