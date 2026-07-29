export interface NavigationItem {
  name: string;
  path: string;
}

export const navigation = [
  { name: "Skills", path: "/#capabilities" },
  { name: "Experience", path: "/#experience" },
  { name: "Projects", path: "/#personal-projects" },
] satisfies NavigationItem[];
