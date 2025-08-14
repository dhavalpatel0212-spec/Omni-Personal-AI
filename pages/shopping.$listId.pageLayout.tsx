import { UserRoute } from "../components/ProtectedRoute";
import { AppLayout } from "../components/AppLayout";

// Protect the shopping list detail page, only allowing authenticated users.
export default [UserRoute, AppLayout];