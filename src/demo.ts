import { Effect, Console } from "effect"

// Mock database
const mockDB: Record<number, { id: number; name: string; email: string }> = {
    1: { id: 1, name: "Alice", email: "alice@example.com" },
    2: { id: 2, name: "Bob", email: "bob@example.com" },
}

// Errors
class UserNotFound {
    readonly _tag = "UserNotFound"
    constructor(readonly id: number) { }
}

class InvalidEmail {
    readonly _tag = "InvalidEmail"
    constructor(readonly email: string) { }
}

// Fetch from "database"
const getUser = (id: number): Effect.Effect<typeof mockDB[1], UserNotFound> =>
    id in mockDB
        ? Effect.succeed(mockDB[id])
        : Effect.fail(new UserNotFound(id))

// Validate email
const validateEmail = (user: typeof mockDB[1]): Effect.Effect<typeof mockDB[1], InvalidEmail> =>
    user.email.includes("@")
        ? Effect.succeed(user)
        : Effect.fail(new InvalidEmail(user.email))

const program = Effect.gen(function* () {
    // Try valid user
    yield* Console.log("Fetching user 1...")
    const user1 = yield* Effect.either(getUser(1));
    if (user1._tag === 'Right') {
        const validated1 = yield* validateEmail(user1.right)
        yield* Console.log(`✅ Success: ${validated1.name}`)
    } else if (user1._tag === 'Left') {
        yield* Console.log(`❌ Error: User ${user1.left.id} not found`)
    }

    // Try invalid user
    yield* Console.log("\nFetching user 999...")
    const result = yield* Effect.either(getUser(999))

    if (result._tag === "Left") {
        yield* Console.log(`❌ Error: User ${result.left.id} not found`)
    }
})

Effect.runPromise(program)


// "Let me show you Effect in action. This is a code that fetches users from a mock database, validates them, and handles errors gracefully."

// "Notice three things:
// 1. **Every error is typed** - TypeScript knows exactly what can go wrong
// 2. **Errors are values** - we handle them with pattern matching, not try-catch
// 3. **Everything is composable** - we built complex logic from small, testable pieces"

// "See how each error was handled differently? NetworkError got a fallback, NotFoundError logged and continued. All type-safe. If we forgot to handle an error, TypeScript would refuse to compile."