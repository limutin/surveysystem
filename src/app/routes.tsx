import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Login, Signup, Home, Survey, Activity, Leaderboard, Profile } from "./pages";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard, AdminSurveys, AdminUsers, AdminAnalytics } from "./pages/admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "survey/:id", Component: Survey },
      { path: "activity", Component: Activity },
      { path: "leaderboard", Component: Leaderboard },
      { path: "profile", Component: Profile },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "surveys", Component: AdminSurveys },
      { path: "users", Component: AdminUsers },
      { path: "analytics", Component: AdminAnalytics },
    ],
  },
]);