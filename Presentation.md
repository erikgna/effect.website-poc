## Title

Today I'm showing you Effect - a TypeScript framework that fundamentally changes how we handle errors, async operations, and side effects.

## THE PROBLEM?

In traditional TypeScript:

- Hidden Failures: Async functions can fail in ways TypeScript doesn't track
- Error Handling Chaos: Try-catch blocks everywhere, or worse - forgotten error handling
- Dependency Hell: Passing dependencies through layers of functions
- Testing Nightmares: Mocking HTTP clients, databases, external services

Effect was built specifically to solve these problems with type safety.

## WHAT IS EFFECT

- Success: What you get when everything works
- Error: What can go wrong (typed!)
- Requirements: What dependencies you need

## Core Concepts

1. **The Effect Type**: Everything that can fail or has side effects is wrapped in an Effect type. It's like a Promise on steroids that tracks both success and failure types.
2. **Error Channels**: Unlike try-catch, errors are part of your type signature. TypeScript forces you to handle them - no more surprise runtime crashes.
3. **Service Layer**: Dependencies are injected through a type-safe layer system. No more prop drilling or messy dependency management."

## TRADE-OFFS

**BENEFITS:**

- Type safety catches errors at compile time, not production
- Testability is built-in - mock dependencies easily
- Scales incredibly well for complex applications
- Error handling is explicit and trackable

**CHALLENGES:**

- Can produce complex composite types that are harder to inspect.
- Introduce multiple architectural abstractions.
- Smaller community compared to mainstream libraries
- Debugging and stack traces operate through Effect’s execution model.

## COMPARISONS

"How does Effect stack up against similar tools?

1. vs RxJS: Effect handles errors in the type system, not at runtime
2. vs fp-ts: More batteries-included, better DX, actively developed
3. vs Zod: Zod validates data, Effect manages your entire application layer

## Presentation

### Hidden Failures

**Default**
- In normal TypeScript, an async function can throw, but nothing in the type system tells you that.
- The caller has no idea this function may explode at runtime.

**Effect**
- Now the function returns Effect<User, GetUserError>.
- Errors are explicit, typed, and impossible to ignore.

### Error Chaos

**Default**
- In plain TS, sync and async errors behave differently, making consistent error handling almost impossible.

**Effect**
- In Effect, both become unified:
- Everything is handled through a single, typed error channel.

### Dependency Hell

**Default**
- Normal TS forces you to pass shared dependencies everywhere:

**Effect**
- With Effect, dependencies are injected automatically using Layers:
- No more threading ctx through your whole call stack.

### Testing Nightmare

**Default**

- In plain TS, testing requires complex object mocks:
**Effect**
- But in Effect, you just swap the Layer:
- No mocks, no jest.fn — just a different implementation of the same service.
