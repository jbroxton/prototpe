export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Completed':
      return 'bg-green-900 text-green-200';
    case 'In Review':
      return 'bg-blue-900 text-blue-200';
    case 'In Progress':
      return 'bg-yellow-900 text-yellow-200';
    default:
      return 'bg-neutral-700 text-neutral-300';
  }
}

export default getStatusBadgeClass;

