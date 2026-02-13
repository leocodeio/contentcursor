export const NavLinks = [
  { name: "Home", to: "/feature/home", accesibleRoles: [] },
  {
    name: "Dashboard",
    to: "/feature/dashboard",
    accesibleRoles: ["creator", "editor"],
  },
  {
    name: "Editors",
    to: "/feature/editors",
    accesibleRoles: ["creator"],
  },
  {
    name: "Creators",
    to: "/feature/creators",
    accesibleRoles: ["editor"],
  },
  {
    name: "Accounts",
    to: "/feature/accounts",
    accesibleRoles: ["creator"],
  },
  {
    name: "Contribute",
    to: "/feature/contribute",
    accesibleRoles: ["editor"],
  },
];

export type NavLinkType = {
  name: string;
  to: string;
  accesibleRoles: Array<string>;
};
