import { Effect, Layer, Context } from "effect";

const db = new PostgresDatabase();

function getOrdersOriginal(db: Database, userId: number) {
    return db.query(`SELECT * FROM orders WHERE user_id = ${userId}`);
}

const mockDb = {
    query: jest.fn().mockResolvedValue([{ id: 1, item: 'A' }]),
};
getOrdersOriginal(mockDb as Database, 123);

// ============================================================================================================================
// Effect Implementation
// ============================================================================================================================

class DB extends Context.Tag("DB")<DB, { query: (sql: string) => Promise<any> }>() { }

const getOrdersEffect = (userId: number) =>
    Effect.gen(function* () {
        const db = yield* DB;
        return yield* Effect.promise(() => db.query(`SELECT * FROM orders WHERE user_id = ${userId}`));
    });


const DBLive = Layer.succeed(DB, {
    query: async (sql) => realDb.query(sql)
});

const DBTest = Layer.succeed(DB, {
    query: async () => [{ id: 1, item: "A" }]
});

const testProgram = getOrdersEffect(123).pipe(
    Effect.provide(DBTest)
);
