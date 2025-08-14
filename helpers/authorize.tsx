import { getServerUserSession } from "./getServerUserSession";
import { NotAuthenticatedError } from "./getSetServerSession";
import { User } from "./User";

/**
 * Custom error for authorization failures (e.g., insufficient permissions).
 * This should be caught and translated to a 403 Forbidden response.
 */
export class NotAuthorizedError extends Error {
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "NotAuthorizedError";
  }
}

type AuthorizeOptions = {
  /**
   * The user must have one of these roles to be authorized.
   * If not provided, any authenticated user role is allowed.
   */
  allowedRoles?: ("admin" | "user")[];
  /**
   * A function to check if the user owns the resource they are trying to access.
   * It receives the authenticated user object and should return a boolean.
   * If it returns false, a NotAuthorizedError will be thrown.
   * This is crucial for endpoints that modify or access user-specific data.
   * @param user The authenticated user.
   * @returns A boolean or a promise resolving to a boolean indicating ownership.
   */
  checkOwnership?: (user: User) => Promise<boolean> | boolean;
};

/**
 * Centralized authorization checker for endpoints.
 * Verifies user session, roles, and resource ownership.
 *
 * @param request The incoming Request object.
 * @param options Authorization options including allowed roles and ownership check.
 * @returns A promise that resolves with the authenticated user if authorization succeeds.
 * @throws {NotAuthenticatedError} if the user is not logged in (results in 401).
 * @throws {NotAuthorizedError} if the user does not have the required permissions (results in 403).
 * @throws {Error} for other unexpected errors.
 *
 * @example
 * // Endpoint handler
 * export async function handle(request: Request) {
 *   try {
 *     const { user } = await authorize(request, {
 *       allowedRoles: ['admin'],
 *       checkOwnership: async (user) => {
 *         const { resourceId } = await request.json();
 *         // logic to check if user owns resource with resourceId
 *         return true;
 *       }
 *     });
 *     // User is authorized, proceed with endpoint logic...
 *   } catch (error) {
 *     if (error instanceof NotAuthenticatedError) {
 *       return new Response(JSON.stringify({ message: error.message }), { status: 401 });
 *     }
 *     if (error instanceof NotAuthorizedError) {
 *       return new Response(JSON.stringify({ message: error.message }), { status: 403 });
 *     }
 *     console.error("Authorization error:", error);
 *     return new Response(JSON.stringify({ message: "An internal error occurred." }), { status: 500 });
 *   }
 * }
 */
export async function authorize(
  request: Request,
  options: AuthorizeOptions = {}
): Promise<{ user: User }> {
  const { allowedRoles, checkOwnership } = options;

  // 1. Verify user session
  // getServerUserSession throws NotAuthenticatedError if session is invalid
  const { user } = await getServerUserSession(request);

  // 2. Centralize role-based access control (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      console.warn(
        `Authorization failed for user ${user.id}: role '${user.role}' is not in allowed roles [${allowedRoles.join(", ")}]`
      );
      throw new NotAuthorizedError("You do not have sufficient permissions to access this resource.");
    }
  }

  // 3. Ensure user ownership of resources
  if (checkOwnership) {
    const isOwner = await checkOwnership(user);
    if (!isOwner) {
      console.warn(
        `Authorization failed for user ${user.id}: ownership check failed.`
      );
      throw new NotAuthorizedError("You are not authorized to access this resource.");
    }
  }

  return { user };
}