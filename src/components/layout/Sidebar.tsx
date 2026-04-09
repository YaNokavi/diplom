import Navigation from "./Navigations";
import UserProfile from "./UserProfile";

export default function Sidebar() {
  return (
    <aside>
      <UserProfile />
      <Navigation />
    </aside>
  );
}
