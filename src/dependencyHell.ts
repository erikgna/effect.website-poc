import { Context, Effect, Layer } from "effect";

class Logger extends Context.Tag("Logger")<Logger, { log: (msg: string) => void }>() { }
class Database extends Context.Tag("Database")<Database, { query: (sql: string) => Promise<any> }>() { }

type Context = { logger: Logger; db: Database };

function stepOneOriginal(ctx: Context, data: string) { ... }
function stepTwoOriginal(ctx: Context, data: string) { ... }
async function finalProcessOriginal(ctx: Context, data: string) { ... }

// ============================================================================================================================
// Effect Implementation
// ============================================================================================================================

const stepOneEffect = (data: string) =>
    Effect.gen(function* () {
        const logger = yield* Logger;
        logger.log("Step 1 complete");
        return data.toUpperCase();
    });

const stepTwoEffect = (data: string) =>
    Effect.gen(function* () {
        return yield* stepOneEffect(data);
    });

const finalProcessEffect = (data: string) =>
    stepTwoEffect(data);

const LoggerLive = Layer.succeed(Logger, { log: console.log });
const DBLive = Layer.succeed(Database, {
    query: async (sql) => { /* ... */ }
});

const program = finalProcessEffect("hello").pipe(
    Effect.provide(LoggerLive),
    Effect.provide(DBLive)
);
