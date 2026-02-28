type PlaceholderCardProps = {
  heading: string;
  description: string;
};

export function PlaceholderCard({ heading, description }: PlaceholderCardProps) {
  return (
    <section className="rounded-[2rem] border border-zinc-300 bg-zinc-100 p-7 shadow-lg">
      <h2 className="text-4xl font-black text-zinc-800">{heading}</h2>
      <p className="mt-3 text-2xl text-zinc-600">{description}</p>
    </section>
  );
}
