import { getAssetOptions, getSchemaItems } from "./data";
import { SchemaManager } from "./schema-manager";

export const dynamic = "force-dynamic";

export default async function SchemaPage() {
  const [items, assetOptions] = await Promise.all([
    getSchemaItems(),
    getAssetOptions(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Schema Tracker
        </h1>
        <p className="text-sm text-muted-foreground">
          A checklist of structured-data types and where each one stands.
        </p>
      </div>

      <SchemaManager items={items} assetOptions={assetOptions} />
    </main>
  );
}
