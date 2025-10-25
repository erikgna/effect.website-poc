import { Effect, Console, Schedule, Fiber } from "effect"

// Example 1: only sync and non error
const syncProgram = Effect.sync(() => {
    console.log("Hello, World!")
    return 1
})

const result = Effect.runSync(syncProgram)
console.log(result)

// Example 2: runSyncExit for success and failure
console.log(Effect.runSyncExit(Effect.succeed(1)))
console.log(Effect.runSyncExit(Effect.fail("my error")))

// Example 3: runPromise for async operations (rejects with error)
Effect.runPromise(Effect.succeed(1)).then(console.log)

// Example 4: runPromiseExit for async operations (rejects with Failure)
Effect.runPromiseExit(Effect.succeed(1)).then(console.log)

// Example 5: repeat for repeated operations and fork  for background operations
const forkProgram = Effect.repeat(
    Console.log("running..."),
    Schedule.spaced("200 millis")
)

const fiber = Effect.runFork(forkProgram)

setTimeout(() => {
    Effect.runFork(Fiber.interrupt(fiber))
}, 500)