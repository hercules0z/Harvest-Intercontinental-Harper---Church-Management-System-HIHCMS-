export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
          <h1 className="text-3xl font-bold text-purple-900">Welcome to HICHMS</h1>
      <p className="mt-3 text-slate-600">
            Harvest Intercontinental Church Harper Management System
      </p>
      <ul className="mt-6 list-disc space-y-1 pl-6 text-sm text-slate-700">
        <li>Region defaults: Liberia</li>
        <li>Currencies: USD and LRD</li>
        <li>Tenancy model: single DB with church_id partitioning</li>
      </ul>
    </main>
  );
}
