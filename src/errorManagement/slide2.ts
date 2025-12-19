//@ts-nocheck

// Unstructured async + hidden side effects
async function createOrder(userId: string): Promise<string> {
    try {
        // Starts immediately, cannot be canceled or supervised
        const user = await fetch(`/api/users/${userId}`).then(r => r.json())

        // Global dependency, hard to replace or test
        const payment = await chargeCard(user.cardId)

        // Side effect mixed with business logic
        await db.orders.insert({ userId, paymentId: payment.id })

        return payment.id
    } catch (e) {
        // Errors are untyped and unpredictable
        console.error(e)
        throw e
    }
}

const createOrder = (userId: string): Effect<
    string,                              // Success
    UserNotFound | PaymentError | DbError,// Typed failure channels
    UserRepo | Payment | Orders           // Declared dependencies
> =>
    Effect.gen(function* () {
        // Suspended, cancelable, supervised execution
        const user = yield* UserRepo.get(userId)

        // Dependency provided via Layer (swappable in tests)
        const payment = yield* Payment.charge(user.cardId)

        // Side effects are explicit and sequenced
        yield* Orders.insert({ userId, paymentId: payment.id })

        return payment.id
    })