export interface Capability {
  name: string;
  levelPercent: number;
}

export const capabilities = [
  { name: "KOTLIN", levelPercent: 100 },
  { name: "JAVA", levelPercent: 100 },
  { name: "GO", levelPercent: 80 },
  { name: "AWS", levelPercent: 75 },
  { name: "KAFKA", levelPercent: 80 },
  { name: "REACT", levelPercent: 66 },
  { name: "CI/CD", levelPercent: 66 },
  { name: "KUBERNETES", levelPercent: 80 },
] satisfies Capability[];
