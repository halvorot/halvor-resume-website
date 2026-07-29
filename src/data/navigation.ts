export interface NavigationItem {
  name: string;
  path: string;
}

export const navigation = [
  { name: "Home", path: "/" },
  { name: "Capabilities", path: "/#capabilities" },
  { name: "Experience", path: "/#experience" },
  { name: "Side Projects", path: "/#personal-projects" },
] satisfies NavigationItem[];
