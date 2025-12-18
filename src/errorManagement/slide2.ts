//@ts-nocheck

// testing will require mocking
async function createOrder(userId: string): Promise<string> { // hidden failures errors are not tracked
    try {
        const user = await fetch(`/api/users/${userId}`).then(r => r.json());
        // hard coded global function
        const payment = await chargeCard(user.cardId); // may throw
        // impossible to swap implementation cleanly
        await db.orders.insert({ userId, paymentId: payment.id }); // side effect
        return payment.id;
    } catch (e) {
        // What errors are possible? Network? 404? DB? Payment?
        console.error(e);
        throw e; // or… forget this?
    }
}

const createOrder = (userId: string): Effect<
    string,                     // Success
    UserNotFound | PaymentError | DbError, // every error is in the typed
    UserRepo | Payment | Orders  // dependencies are in the typed and injected automatically its easy to swap services with test layers
> =>
    Effect.gen(function* () {
        const user = yield* UserRepo.get(userId)
        // if the user is not found, the effect will fail with a UserNotFound error
        const payment = yield* Payment.charge(user.cardId)
        // if the payment fails, the effect will fail with a PaymentError error
        yield* Orders.insert({ userId, paymentId: payment.id })
        // if the order is not inserted, the effect will fail with a DbError error
        return payment.id
    })