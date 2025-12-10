import { Effect } from "effect";

async function externalService(data: string): Promise<string> {
    return "success";
}

function validateDataOriginal(data: string): boolean {
    /* ... */
    return true;
}

async function processRequestOriginal(data: string) {
    validateDataOriginal(data); // ❌ no try/catch here
    try {
        const result = await externalService(data);
    } catch (err) {
        console.error(err);
    }
}

// ============================================================================================================================
// Effect Implementation
// ============================================================================================================================
class ValidationError {
    readonly _tag = "ValidationError";
    constructor(readonly message: string) { }
}

const validateDataEffect = (data: string) =>
    Effect.sync(() => {
        if (!data.startsWith("ok")) throw new ValidationError("Invalid data");
        return true;
    });

class ExternalServiceError {
    readonly _tag = "ExternalServiceError";
    constructor(readonly cause: unknown) { }
}

const callExternalServiceEffect = (data: string) =>
    Effect.tryPromise({
        try: () => externalService(data),
        catch: (err) => new ExternalServiceError(err)
    });

const processRequestEffect = (data: string) =>
    Effect.gen(function* () {
        yield* validateDataEffect(data);          // sync error, typed
        const result = yield* callExternalServiceEffect(data); // async error, typed
        return result;
    });
