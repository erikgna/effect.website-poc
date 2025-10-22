import { Effect, Data } from "effect"

Effect.runPromise(Effect.log("Hello, World!"))

Effect.succeed(32);
Effect.fail(new Error("Failed to get temperature"));

class HttpError extends Data.TaggedError("HttpError")<{}> { }

Effect.fail(new HttpError());