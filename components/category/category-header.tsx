interface CategoryHeaderProps {
  title: string
  description: string
}

export default function CategoryHeader({ title, description }: CategoryHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">{description}</p>
    </div>
  )
}
