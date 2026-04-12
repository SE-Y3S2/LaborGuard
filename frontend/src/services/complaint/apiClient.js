/**
 * @deprecated Import from `@/api/apiClient` instead (`authClient`, `complaintClient`).
 * Re-exports preserve backward compatibility; both clients use Zustand tokens + refresh.
 */
export { authClient as authApi, complaintClient as complaintApi } from '../../api/apiClient';
