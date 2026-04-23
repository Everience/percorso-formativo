/**
 * Default roadmap URL for non-admin app users after login / guard redirects.
 * `service-manager` is aligned with `dev`: home is `/dev`; they can still open `/tech` via the roadmap switcher.
 */
export function employeeRoadmapHome(role: string | null | undefined): '/dev' | '/tech' {
  const r = (role ?? '').toLowerCase().trim();
  if (r === 'tech') {
    return '/tech';
  }
  return '/dev';
}
