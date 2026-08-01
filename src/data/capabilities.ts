export interface SkillGroup {
  title: string;
  description: string;
  skills: string[];
}

export const skillGroups = [
  {
    title: "Backend",
    description: "Reliable services, event-driven systems, and business logic.",
    skills: ["Kotlin", "Java", "Go", "Ktor", "Spring Boot", "Kafka"],
  },
  {
    title: "Cloud & Platform",
    description: "Technologies I use and explore alongside my backend work.",
    skills: ["AWS", "Azure", "Kubernetes", "Serverless", "CI/CD"],
  },
  {
    title: "APIs & Integration",
    description:
      "API contracts and system integration, with frontend delivery when needed.",
    skills: ["OpenAPI", "REST", "React", "TypeScript"],
  },
  {
    title: "Engineering Practice",
    description: "Security, developer tooling, and quality assurance.",
    skills: ["Security", "AI", "Developer experience", "Test automation"],
  },
] satisfies SkillGroup[];
