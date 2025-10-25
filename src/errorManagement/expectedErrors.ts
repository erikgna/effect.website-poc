import { Effect, Random, Data, Either, Cause, Option } from "effect"

class HttpError extends Data.TaggedError("HttpError")<{}> { }
class ValidationError extends Data.TaggedError("ValidationError")<{}> { }

// Example 1: can fail twice
const program = Effect.gen(function* () {
    const n1 = yield* Random.next
    const n2 = yield* Random.next
    if (n1 < 0.5) return yield* Effect.fail(new HttpError())
    if (n2 < 0.5) return yield* Effect.fail(new ValidationError())
    return "some result"
})

// Example 2: either
Effect.gen(function* () {
    const failureOrSuccess = yield* Effect.either(program)
    return Either.match(failureOrSuccess, {
        onLeft: (error) => `Recovering from ${error._tag}`,
        onRight: (value) => value
    })
})

// Example 3: option
const maybe1 = Effect.option(Effect.succeed(1))
Effect.runPromiseExit(maybe1).then(console.log)

const maybe2 = Effect.option(Effect.fail("Uh oh!"))
Effect.runPromiseExit(maybe2).then(console.log)

// Example 4: catchAll (doest not catch defects)
program.pipe(Effect.catchAll((error) => Effect.succeed(`Recovering from ${error._tag}`)))

// Example 5: catchAllCause
const programCatchAllCause = Effect.fail("Something went wrong!")

const recoveredCatchAllCause = programCatchAllCause.pipe(
    Effect.catchAllCause((cause) =>
        Cause.isFailType(cause) ? Effect.succeed("Recovered from a regular error") : Effect.succeed("Recovered from a defect")
    )
)
Effect.runPromise(recoveredCatchAllCause).then(console.log)

// Example 6: either
Effect.gen(function* () {
    const failureOrSuccess = yield* Effect.either(program)
    if (Either.isLeft(failureOrSuccess)) {
        const error = failureOrSuccess.left
        if (error._tag === "HttpError") return "Recovering from HttpError"
        else return "Recovering from ValidationError"
    } else {
        return failureOrSuccess.right
    }
})

// Example 7: catchSome
program.pipe(
    Effect.catchSome((error) => {
        if (error._tag === "HttpError") return Option.some(Effect.succeed("Recovering from HttpError"))
        else return Option.none()
    })
)

// Example 8: catchIf
program.pipe(
    Effect.catchIf(
        (error) => error._tag === "HttpError",
        () => Effect.succeed("Recovering from HttpError")
    )
)

// Example 9: catchTag
program.pipe(
    Effect.catchTag("HttpError", (_HttpError) =>
        Effect.succeed("Recovering from HttpError")
    )
)

// Example 10: catchTags
program.pipe(
    Effect.catchTags({
        HttpError: (_HttpError) =>
            Effect.succeed(`Recovering from HttpError`),
        ValidationError: (_ValidationError) =>
            Effect.succeed(`Recovering from ValidationError`)
    })
)

// Example 11: traced function with span name
const myfunc = Effect.fn("myspan")(function* <N extends number>(n: N) {
    yield* Effect.annotateCurrentSpan("n", n)
    console.log(`got: ${n}`)
    yield* Effect.fail(new Error("Boom!"))
})

Effect.runFork(myfunc(100).pipe(Effect.catchAllCause(Effect.logError)))