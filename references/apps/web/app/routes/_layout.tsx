import { Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <div className="h-full w-full">
      <Outlet />
    </div>
  );
}
