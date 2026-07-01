export function SetupNotice({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="grid h-full place-items-center p-8">
      <div className="card max-w-md p-7 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-electric/15 text-2xl">⚙️</div>
        <h3 className="text-lg font-bold">{title}</h3>
        <ol className="mt-3 space-y-2 text-start text-sm text-muted">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-bold text-electric-bright">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
