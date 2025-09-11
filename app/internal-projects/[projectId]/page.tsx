import { redirect } from 'next/navigation';

export default function ProjectDetailRedirect({ params }: { params: { projectId: string } }) {
  redirect(`/internal-projects/${params.projectId}/unified`);
}

