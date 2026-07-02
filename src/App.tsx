import { Routes, Route } from "react-router-dom";
import { Shell } from "./components/Shell";
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import PitchPage from "./pages/PitchPage";
import BookingsPage from "./pages/BookingsPage";
import ChatPage from "./pages/ChatPage";
import SignInPage from "./pages/SignInPage";
import ProfilePage from "./pages/ProfilePage";
import OwnerLayout from "./components/owner/OwnerLayout";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import OwnerPitchesPage from "./pages/owner/OwnerPitchesPage";
import OwnerBookingsPage from "./pages/owner/OwnerBookingsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import TermsPage from "./pages/legal/TermsPage";
import SupportPage from "./pages/legal/SupportPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      {/* Legal pages render standalone, outside the app shell. */}
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/support" element={<SupportPage />} />

      {/* Everything else lives inside the sidebar shell. */}
      <Route element={<Shell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/pitch/:id" element={<PitchPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/ai" element={<ChatPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<OwnerDashboardPage />} />
          <Route path="bookings" element={<OwnerBookingsPage />} />
          <Route path="pitches" element={<OwnerPitchesPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
