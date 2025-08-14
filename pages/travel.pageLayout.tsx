import { UserRoute } from "../components/ProtectedRoute";
import { AppLayout } from "../components/AppLayout";

// Protect the travel page, only allowing authenticated users.
export default [UserRoute, AppLayout];