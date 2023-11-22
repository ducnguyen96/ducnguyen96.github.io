import clsx from "clsx";
import { Icon } from "@iconify/react";
import { useState } from "react";

type Project = {
  title: string;
  description: string;
  link: string;
  tags: string[];
  icon: string;
  color?: string;
};

const projects: Project[] = [
  {
    title: "Github",
    description: "Personal Github",
    link: "https://github.com/ducnguyen96",
    tags: [],
    icon: "mdi:github",
    color: "text-black",
  },
  {
    title: "Youtube",
    description: "Personal Youtube",
    link: "https://www.youtube.com/channel/UCCrvmlNIXLgZOMAMn9VKBeA",
    tags: [],
    icon: "mdi:youtube",
    color: "text-red-500",
  },
  {
    title: "Curriculum Vitae PDF",
    description: "My CV written in LaTeX",
    link: "/projects/cv-pdf",
    tags: ["HTML", "CSS"],
    icon: "pepicons-pop:cv",
    color: "text-primary",
  },
  {
    title: "Curriculum Vitae",
    description: "My CV written in HTML and CSS",
    link: "/projects/cv",
    tags: ["HTML", "CSS"],
    icon: "academicons:cv-square",
    color: "text-primary",
  },
  {
    title: "Documentation",
    description: "My personal documentation",
    link: "/docs/intro",
    tags: ["HTML", "CSS"],
    icon: "mingcute:doc-fill",
    color: "text-primary",
  },
];

export default function Home(): JSX.Element {
  const [inputText, setInputText] = useState<string>("");
  const [searchedProjects, setSearchedProjects] = useState<Project[]>(projects);
  const [focusIndex, setFocusIndex] = useState<number>(0);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    const searchedProjects = projects.filter((project) =>
      project.title.toLowerCase().includes(text.toLowerCase())
    );
    setSearchedProjects(searchedProjects);
    setFocusIndex(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Tab":
        e.preventDefault();
        setFocusIndex((focusIndex + 1) % searchedProjects.length);
        break;
      case "Enter":
        if (searchedProjects[focusIndex]) {
          window.open(searchedProjects[focusIndex].link, "_blank");
        }
      default:
        break;
    }
  };

  return (
    <main
      className="w-screen h-screen flex flex-col items-center bg-[url('/images/escape_velocity.jpg')] bg-cover"
      onKeyDown={onKeyDown}
    >
      <div className="avatar animate-pulse mt-20">
        <div className="w-32 rounded-full">
          <img src="logo.jpeg" alt="logo" />
        </div>
      </div>

      <input
        autoFocus
        type="text"
        placeholder="Type to search, press Tab to navigate, Enter to open"
        className="input w-full max-w-md mt-10"
        value={inputText}
        onChange={onInputChange}
      />

      <div className="container grid grid-flow-col auto-cols-max mt-10 gap-10">
        {searchedProjects.map((project, idx) => (
          <a
            href={project.link}
            className={clsx(
              "tooltip hover:scale-125 transition-transform duration-300 ease-in-out bg-gray-700 rounded-xl p-4",
              focusIndex === idx
                ? "scale-125 border-2 border-primary shadow-2xl"
                : ""
            )}
            data-tip={project.title}
            target="_blank"
          >
            <Icon
              className={clsx("text-6xl", project.color ?? "")}
              icon={project.icon}
            />
          </a>
        ))}
      </div>
    </main>
  );
}
