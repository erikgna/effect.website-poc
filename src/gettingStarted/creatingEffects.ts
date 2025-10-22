import { Effect, Data, Fiber } from "effect"
import * as NodeFS from "node:fs"

// Example 1: Custom errors
class HttpError extends Data.TaggedError("HttpError")<{}> { }
Effect.fail(new HttpError());

// Example 2: Basic arithmetic
const divide = (a: number, b: number): Effect.Effect<number, Error> =>
    b === 0
        ? Effect.fail(new Error("Cannot divide by zero"))
        : Effect.succeed(a / b)

// Example 3: Fetching a user from a database
interface User {
    readonly id: number
    readonly name: string
}

// A mocked function to simulate fetching a user from a database
const getUser = (userId: number): Effect.Effect<User, Error> => {
    // Normally, you would access a database or API here, but we'll mock it
    const userDatabase: Record<number, User> = {
        1: { id: 1, name: "John Doe" },
        2: { id: 2, name: "Jane Smith" }
    }

    // Check if the user exists in our "database" and return appropriately
    const user = userDatabase[userId]
    if (user) {
        return Effect.succeed(user)
    } else {
        return Effect.fail(new Error("User not found"))
    }
}

// When executed, this will successfully return the user with id 1
const exampleUserEffect = getUser(1)

// Example 4: sync (should be successful)
const log = (message: string) =>
    Effect.sync(() => {
        console.log(message) // side effect
    })

const syncProgram = log("Hello, World!")

// Example 5: try (can fail)
const parse = (input: string) =>
    // This might throw an error if input is not valid JSON
    Effect.try({
        try: () => JSON.parse(input),
        catch: (unknown) => new Error(`something went wrong ${unknown}`)
    })

const tryProgram = parse("")

// Example 6: promise (should be successful)
const delay = (message: string) =>
    Effect.promise<string>(
        () =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve(message)
                }, 2000)
            })
    )

const delayProgram = delay("Async operation completed successfully!")

// Example 7: tryPromise (can fail)
const getTodo = (id: number) =>
    // Will catch any errors and propagate them as UnknownException
    Effect.tryPromise({
        try: () => fetch(`https://jsonplaceholder.typicode.com/todos/${id}`),
        catch: (unknown) => new Error(`something went wrong ${unknown}`)
    })

const tryPromiseProgram = getTodo(1)

// Example 8: async for callbacks-based operations
const readFile = (filename: string) =>
    Effect.async<Buffer, Error>((resume) => {
        NodeFS.readFile(filename, (error, data) => {
            if (error) {
                // Resume with a failed Effect if an error occurs
                resume(Effect.fail(error))
            } else {
                // Resume with a succeeded Effect if successful
                resume(Effect.succeed(data))
            }
        })
    })

const asyncProgram = readFile("example.txt")

// Example 9: async for cleanup
const writeFileWithCleanup = (filename: string, data: string) =>
    Effect.async<void, Error>((resume) => {
        const writeStream = NodeFS.createWriteStream(filename)

        // Start writing data to the file
        writeStream.write(data)

        // When the stream is finished, resume with success
        writeStream.on("finish", () => resume(Effect.void))

        // In case of an error during writing, resume with failure
        writeStream.on("error", (err) => resume(Effect.fail(err)))

        // Handle interruption by returning a cleanup effect
        return Effect.sync(() => {
            console.log(`Cleaning up ${filename}`)
            NodeFS.unlinkSync(filename)
        })
    })

const program = Effect.gen(function* () {
    const fiber = yield* Effect.fork(
        writeFileWithCleanup("example.txt", "Some long data...")
    )
    // Simulate interrupting the fiber after 1 second
    yield* Effect.sleep("1 second")
    yield* Fiber.interrupt(fiber) // This will trigger the cleanup
})

// Run the program
Effect.runPromise(program)

// Example 10: lazy
let i = 0

const bad = Effect.succeed(i++)

const good = Effect.suspend(() => Effect.succeed(i++))

console.log(Effect.runSync(bad)) // Output: 0
console.log(Effect.runSync(bad)) // Output: 0

console.log(Effect.runSync(good)) // Output: 1
console.log(Effect.runSync(good)) // Output: 2