import { useRouter } from 'next/router';

export default function PetsitterSlug() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Petsitter Slug {id}</h1>
    </div>
  );
}
