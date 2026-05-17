type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-black/10 bg-[#f8fff4] p-6 text-center">
      <h2 className="text-lg font-black text-stone-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
    </section>
  );
}
