import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useAuth } from "./hooks/useAuth";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EnterpriseDashboardPage } from "./pages/enterprise/EnterpriseDashboardPage";
import { HomeownerDashboardPage } from "./pages/homeowner/HomeownerDashboardPage";
import { HomeownerJobDetailPage } from "./pages/homeowner/HomeownerJobDetailPage";
import { PostJobPage } from "./pages/homeowner/PostJobPage";
import { WorkerDashboardPage } from "./pages/worker/WorkerDashboardPage";
import { WorkerJobDetailPage } from "./pages/worker/WorkerJobDetailPage";

// Root route with Layout wrapper
const rootRoute = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Loading Pluber…" />
      </div>
    );
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

const homeownerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/homeowner/dashboard",
  component: HomeownerDashboardPage,
});

const homeownerPostJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/homeowner/post-job",
  component: PostJobPage,
});

const homeownerJobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/homeowner/jobs/$jobId",
  component: HomeownerJobDetailPage,
});

const workerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker/dashboard",
  component: WorkerDashboardPage,
});

const workerJobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/worker/jobs/$jobId",
  component: WorkerJobDetailPage,
});

const enterpriseDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/enterprise/dashboard",
  component: EnterpriseDashboardPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$userId",
  component: ProfilePage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  onboardingRoute,
  homeownerDashboardRoute,
  homeownerPostJobRoute,
  homeownerJobDetailRoute,
  workerDashboardRoute,
  workerJobDetailRoute,
  enterpriseDashboardRoute,
  profileRoute,
  notificationsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
