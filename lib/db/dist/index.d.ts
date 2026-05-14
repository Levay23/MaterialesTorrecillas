import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";
export declare const db: import("drizzle-orm/pglite").PgliteDatabase<typeof schema> & {
    $client: PGlite;
};
export * from "./schema";
//# sourceMappingURL=index.d.ts.map