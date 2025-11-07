## Slide 1: Title + Hook (30 seconds)

### Visual: Effect logo on dark background

"Today I'm showing you Effect - a TypeScript framework that fundamentally changes how we handle errors, async operations, and side effects. If you've ever struggled with try-catch hell or runtime errors that TypeScript couldn't catch, this will change your development experience."

## Slide 2: WHAT IS EFFECT? (45 seconds)

### Visual: Simple diagram showing traditional TypeScript vs Effect approach

"Effect is a TypeScript library for building robust, type-safe applications. Think of it as a functional programming toolkit that makes your code predictable and your errors manageable. It's not just error handling - it's a complete system for managing effects like API calls, database operations, and any side effects in your application."

- Full type safety from end to end
- Explicit error handling - no hidden exceptions
- Built-in dependency injection
- Composable and testable by design

## Slide 3: HOW IT WORKS - Architecture (60 seconds)

### Visual: Architecture diagram showing Effect's core concepts

"Effect works through three core concepts:

1. **The Effect Type**: Everything that can fail or has side effects is wrapped in an Effect type. It's like a Promise on steroids that tracks both success and failure types.
2. **Error Channels**: Unlike try-catch, errors are part of your type signature. TypeScript forces you to handle them - no more surprise runtime crashes.
3. **Service Layer**: Dependencies are injected through a type-safe layer system. No more prop drilling or messy dependency management."

```typescript
async function getUser(id: string) {
  return await fetch(`/api/users/${id}`);
}

// Effect
const getUser = (id: string) =>
  Effect.gen(function* () {
    const response = yield* HttpClient.get(`/api/users/${id}`);
    return yield* response.json;
  });
```

```typescript
import { Effect, Layer, Context } from "effect"

// typed errors
type NotFoundError = { _tag: "NotFoundError"; id: string }
type DbError = { _tag: "DbError"; reason: string }

// typed DI
type User = { id: string; name: string; email: string }

interface UserRepo {
  getUser: (id: string) => Effect.Effect<User, NotFoundError | DbError>
}

// Create a typed "tag" for the service so we can inject/consume it safely
const UserRepo = Context.Tag<UserRepo>("UserRepo")

// In‑memory impl
const userRepoLive = Layer.succeed(UserRepo, {
  getUser: (id: string) => {
    // EFFECT TYPE: return an Effect that can succeed OR fail — no throws.
    if (id === "1") {
      return Effect.succeed({ id, name: "Ada Lovelace", email: "ada@example.com" })
    }
    if (id === "oops") {
      return Effect.fail({ _tag: "DbError", reason: "Connection lost" })
    }
    return Effect.fail({ _tag: "NotFoundError", id })
  }
})

// Program: depends on UserRepo
const program = Effect.gen(function* (_) {
  const repo = yield* _(UserRepo)                  // get the service from context (no prop drilling)
  const user = yield* _(repo.getUser("2"))         // typed failure: NotFoundError | DbError
  // Any side-effect goes here
  return `Hello, ${user.name}!`
})

// Handling typed errors explicitly
const handled = program.pipe(
  Effect.match({
    onSuccess: (msg) => `OK: ${msg}`,
    onFailure: (e) => {
      switch (e._tag) {
        case "NotFoundError":
          return `User ${e.id} not found`
        case "DbError":
          return `Database error: ${e.reason}`
      }
    }
  }),
  // Provide the service implementation via a Layer (type-safe DI)
  Effect.provide(userRepoLive)
)

Effect.runPromise(handled).then(console.log).catch(console.error)
```

## Slide 4: TRADE-OFFS (45 seconds)

### Visual: Two columns - PROS vs CONS

"Let's be honest about trade-offs:

**PROS:**

1. Type safety catches errors at compile time, not production
2. No more 'undefined is not a function' at 3 AM
3. Testability is built-in - mock dependencies easily
4. Scales incredibly well for complex applications
5. Amazing developer experience once you learn it

**CONS:**

1. Steep learning curve - functional programming concepts required
2. Smaller ecosystem compared to traditional libraries
3. More verbose initially - more boilerplate upfront
4. Team needs training - can't just jump in
5. Overkill for simple CRUD apps"

## Slide 5: LIVE DEMO (90 seconds)

### Visual: Live code or recorded demo

"Let me show you real code. I built a simple API call with proper error handling..."

## Slide 6: COMPARISONS (45 seconds)

### Visual: Comparison table

"How does Effect compare?

1. vs fp-ts: Effect is more batteries-included, better developer experience, active development
2. vs Zod: Zod does validation, Effect does the entire application layer
3. vs Traditional async/await: Effect adds type-safe error handling and dependency injection
4. vs Railway-Oriented Programming: Effect is ROP with superpowers and TypeScript integration"

"Think of Effect as: fp-ts + Zod + dependency injection + error handling all working together seamlessly."
