import { Effect, Random, Console, Option } from "effect"

// Example 1: if
Effect.if(Random.nextBoolean, {
    onTrue: () => Console.log("Head"),
    onFalse: () => Console.log("Tail")
})

// Example 2: when
const validateWeightOption = (weight: number): Effect.Effect<Option.Option<number>> => Effect.succeed(weight).pipe(Effect.when(() => weight >= 0))
Effect.runPromise(validateWeightOption(100)).then(console.log)

// Example 3: whenEffect
const randomIntOption = Random.nextInt.pipe(Effect.whenEffect(Random.nextBoolean))
console.log(Effect.runSync(randomIntOption))

// Example 4: unless - similiar to ! operator

// Example 5: zip
const task1 = Effect.succeed(1).pipe(Effect.delay("200 millis"), Effect.tap(Effect.log("task1 done")))
const task2 = Effect.succeed("hello").pipe(Effect.delay("100 millis"), Effect.tap(Effect.log("task2 done")))
const program = Effect.zip(task1, task2) // Effect.zip(task1, task2, { concurrent: true })
Effect.runPromise(program).then(console.log)

// Example 6: zipWith
const task3 = Effect.zipWith(task1, task2, (number, string) => number + string.length)
Effect.runPromise(task3).then(console.log)

// Example 7: loop
Effect.loop(
    1, // Initial state
    {
        while: (state) => state <= 5,
        step: (state) => state + 1,
        body: (state) => Effect.succeed(state),
        // discard: true
    }
)
// Example 8: iterate
Effect.iterate(
    // Initial result
    1,
    {
        while: (result) => result <= 5,
        body: (result) => Effect.succeed(result + 1)
    }
)

// Example 9: forEach
Effect.forEach([1, 2, 3, 4, 5], (n, index) => Console.log(`Currently at index ${index}`).pipe(Effect.as(n * 2)))