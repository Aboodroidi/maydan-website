export function SetupNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid h-full place-items-center p-8">
      <div className="card max-w-md p-7 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-electric/15 text-2xl">
          ⚙️
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-3 text-sm text-muted">{body}</p>
      </div>
    </div>
  );
}
