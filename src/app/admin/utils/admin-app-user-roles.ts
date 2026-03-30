/**
 * Only dev + tech (app users) may appear in admin user list and course completions.
 * API maps DB roles to short form on /api/admin/users; completions return DB values.
 */
/** API list returns short `dev`/`tech`; accept DB-shaped values too (defense in depth). */
export function isAdminListableMappedRole(role: string | null | undefined): boolean {
    const r = (role ?? '').toLowerCase().trim();
    return r === 'dev' || r === 'tech' || r === 'dev-user' || r === 'tech-user';
}

export function isAdminListableDbRole(role: string | null | undefined): boolean {
    const r = (role ?? '').toLowerCase().trim();
    return r === 'dev-user' || r === 'tech-user';
}
