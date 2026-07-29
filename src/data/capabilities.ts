export interface SkillGroup {
  title: string;
  description: string;
  skills: string[];
}

export const skillGroups = [
  {
    title: "Backend",
    description: "Backend services and event-driven systems.",
    skills: ["Kotlin", "Java", "Go", "Spring Boot", "Kafka"],
  },
  {
    title: "Cloud & Platform",
    description: "Cloud infrastructure and delivery pipelines.",
    skills: ["AWS", "Azure", "Kubernetes", "Serverless", "CI/CD"],
  },
  {
    title: "Frontend & APIs",
    description: "Web interfaces and clearly defined APIs.",
    skills: ["React", "TypeScript", "OpenAPI"],
  },
  {
    title: "Engineering Practice",
    description:
      "Security, developer experience and tooling, and high-quality software.",
    skills: ["Security", "AI", "Developer experience", "Test automation"],
  },
] satisfies SkillGroup[];
