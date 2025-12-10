import { Effect } from "effect";

interface User {
    id: number;
    name: string;
}

async function getUserOriginal(id: number): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
}

// ============================================================================================================================
// Effect Implementation
// ============================================================================================================================

class GetUserError {
    readonly _tag = "GetUserError";
    constructor(readonly error: { cause: unknown }) { }
}

const getUserEffect = (id: number) =>
    Effect.tryPromise({
        try: () => fetch(`/api/users/${id}`).then(async (res) => {
            if (!res.ok) throw new Error("Failed to fetch user");
            return res.json() as Promise<User>;
        }),
        catch: (e) => new GetUserError({ cause: e })
    });

const program = getUserEffect(1).pipe(
    Effect.catchTag("GetUserError", (err) =>
        Effect.succeed({ id: -1, name: "fallback" })
    )
);
