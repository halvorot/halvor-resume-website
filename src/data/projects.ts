import type { ImageMetadata } from "astro";
import certPortalLogo from "../assets/images/cert-portal-logo.svg";
import homelabIcon from "../assets/images/homelab-icon.svg";
import voiceboardLogo from "../assets/images/voiceboard-logo.svg";
import wineLotteryLogo from "../assets/images/wine-lottery-icon.svg";
import wishlyLogo from "../assets/images/wishly-logo.png";
import hLogo from "../icons/h-logo.svg";

export interface Project {
  title: string;
  description: string;
  repoUrl: string;
  liveUrl?: string;
  image: ImageMetadata;
  imageAlt: string;
  featured?: boolean;
  status?: "decommissioned";
  customLogoBackgroundColor?: string;
  technologies?: string[];
}

export const projects = [
  {
    title: "Homelab Docker",
    description:
      "My docker-based self-hosted home infrastructure for learning, experimenting, and running both self-hosted services and other personal projects.",
    repoUrl: "https://github.com/halvorot/homelab-docker",
    liveUrl: "https://homelab.halvorteigen.no",
    image: homelabIcon,
    imageAlt: "Homelab logo",
    featured: true,
    technologies: ["Docker"],
  },
  {
    title: "This website",
    description:
      "My resume and portfolio site, built to present my experience with a fast, focused Astro frontend.",
    repoUrl: "https://github.com/halvorot/halvorot.github.io",
    liveUrl: "https://halvorteigen.no",
    image: hLogo,
    imageAlt: "Halvor Teigen logo",
    technologies: ["Astro"],
  },
  {
    title: "CertPortal",
    description:
      "A portal for browsing and tracking certifications, while also reading and leaving reviews.",
    repoUrl: "https://github.com/halvorot/cert-portal",
    image: certPortalLogo,
    imageAlt: "Cert Portal logo",
  },
  {
    title: "VoiceBoard",
    description:
      "An experiment in turning spoken input into whiteboard-style output for faster idea capture using AI.",
    repoUrl: "https://github.com/halvorot/speech-to-whiteboard",
    liveUrl: "https://voiceboard.halvorteigen.no",
    image: voiceboardLogo,
    imageAlt: "VoiceBoard logo",
    technologies: ["AI"],
  },
  {
    title: "Wishly",
    description:
      "A wishlist app concept for collecting, organizing, and sharing gift ideas in one place.",
    repoUrl: "https://github.com/halvorot/wishly-wishlist-app/tree/main",
    image: wishlyLogo,
    imageAlt: "Wishly logo",
    customLogoBackgroundColor: "#141414",
  },
  {
    title: "Wine Lottery Website",
    description:
      "A website for hosting wine lotteries with a simple, public-facing presentation layer.",
    repoUrl: "https://github.com/halvorot/wine-lottery-website",
    liveUrl: "https://vinlotteri.halvorteigen.no",
    image: wineLotteryLogo,
    imageAlt: "Wine Lottery logo",
  },
  {
    title: "Homelab k8s",
    description:
      "My earlier Kubernetes-based homelab setup, kept as a reference after being decommissioned.",
    repoUrl: "https://github.com/halvorot/homelab-k8s",
    image: homelabIcon,
    imageAlt: "Homelab logo",
    status: "decommissioned",
    technologies: ["Kubernetes"],
  },
] satisfies Project[];
