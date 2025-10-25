import { Console, Effect, Either, Option, pipe } from "effect"

// Example 1: pipe
const increment = (x: number) => x + 1
const double = (x: number) => x * 2
const subtractTen = (x: number) => x - 10
const result = pipe(5, increment, double, subtractTen)
console.log(result)

// Example 2: map
const addServiceCharge = (amount: number) => amount + 1
const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
const finalAmount = pipe(fetchTransactionAmount, Effect.map(addServiceCharge))
Effect.runPromise(finalAmount).then(console.log)

// Example 3: as
const program = pipe(Effect.succeed(5), Effect.as("new value"))
Effect.runPromise(program).then(console.log)

// Example 4: flatMap
const applyDiscount = (
    total: number,
    discountRate: number
): Effect.Effect<number, Error> =>
    discountRate === 0
        ? Effect.fail(new Error("Discount rate cannot be zero"))
        : Effect.succeed(total - (total * discountRate) / 100)

const discountedAmount = pipe(
    fetchTransactionAmount,
    Effect.flatMap((amount) => applyDiscount(amount, 5))
)
Effect.runPromise(discountedAmount).then(console.log)

// Example 5: andThen
const result2 = pipe(
    fetchTransactionAmount,
    Effect.andThen((amount) => amount * 2),
    Effect.andThen((amount) => applyDiscount(amount, 5))
)
Effect.runPromise(result2).then(console.log)

// Example 6: Either
const parseInteger = (input: string): Either.Either<number, string> =>
    isNaN(parseInt(input))
        ? Either.left("Invalid integer")
        : Either.right(parseInt(input))
const fetchStringValue = Effect.tryPromise(() => Promise.resolve("42"))
pipe(fetchStringValue, Effect.andThen((str) => parseInteger(str)))

// Example 7: Option
const fetchNumberValue = Effect.tryPromise(() => Promise.resolve(42))
pipe(fetchNumberValue, Effect.andThen((x) => (x > 0 ? Option.some(x) : Option.none())))

// Example 8: tap
const tapAmount = pipe(
    fetchTransactionAmount,
    Effect.tap((amount) => Console.log(`Apply a discount to: ${amount}`)),
    Effect.flatMap((amount) => applyDiscount(amount, 5))
)
Effect.runPromise(tapAmount).then(console.log)

// Example 9: all
const webConfig = Effect.promise(() => Promise.resolve({ dbConnection: "localhost", port: 8080 }))
const checkDatabaseConnectivity = Effect.promise(() => Promise.resolve("Connected to Database"))
const startupChecks = Effect.all([webConfig, checkDatabaseConnectivity])
Effect.runPromise(startupChecks).then(([config, dbStatus]) => {
    console.log(`Configuration: ${JSON.stringify(config)}\nDB Status: ${dbStatus}`)
})