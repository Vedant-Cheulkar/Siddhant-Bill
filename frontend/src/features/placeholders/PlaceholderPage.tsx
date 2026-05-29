interface Props {
  title: string;
}

export function PlaceholderPage({ title }: Props) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-muted text-sm">Coming soon</p>
      </div>
    </div>
  );
}
