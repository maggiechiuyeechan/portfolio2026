export const collaboratorAvatarBase = "/anthropicxmaggie/slides/leadership";

export const collaborators = {
  Akram: { avatar: "akram-khalid.png", name: "Akram Khalid", role: "Chat & Innovation", city: "San Diego" },
  Court: { avatar: "court-skabelund.png", name: "Court Skabelund", role: "Design System", city: "Salt Lake City" },
  Fan: { avatar: "fan-lin.png", name: "Fan Lin", role: "Mobile", city: "San Francisco" },
  Alexander: { avatar: "alexander-zinchenko.png", name: "Alexander Zinchenko", role: "Project Management", city: "Barcelona" },
  Akshay: { avatar: "akshay-rawat.png", name: "Akshay Rawat", role: "Custom Fields", city: "San Francisco" },
  Peiran: { avatar: "peiran-tan.png", name: "Peiran Tan", role: "Tasks", city: "Seattle" },
  Edwin: { avatar: "edwin-delgado.png", name: "Edwin Delgado (Manager)", role: "Automations & Docs", city: "San Francisco" },
  Steph: { avatar: "steph-ortiz.png", name: "Steph Ortiz", role: "Program Management", city: "San Diego" },
  Igor: { avatar: "igor-besterov.png", name: "Igor Besterov", role: "Agents", city: "Prague" },
  Aleksei: { avatar: "aleksei-larionov.png", name: "Aleksei Larionov", role: "AI Brain", city: "Paris" },
  Joel: { avatar: "joel-aguero.png", name: "Joel Aguero", role: "Vibe Up", city: "San Francisco" },
  Anthony: { avatar: "anthony-raad.png", name: "Anthony Raad (Manager)", role: "User Research", city: "San Francisco" },
  Daniel: { avatar: "daniel-ramirez.png", name: "Daniel Ramirez", role: "User Research", city: "San Francisco" },
} as const;

export type SlideCredit = {
  collaborator: keyof typeof collaborators;
  label?: string;
  displayName?: string;
};
