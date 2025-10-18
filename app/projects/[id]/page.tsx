export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Project Details</h1>
      <p className="text-muted-foreground">Project ID: {params.id}</p>
    </div>
  );
}
