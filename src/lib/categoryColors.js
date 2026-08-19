const PALETTE = {
  "cuidado capilar": {
    hex: "#7C3AED",
    dot: "bg-violet-500",
    chip: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
    chipActive: "bg-violet-600 text-white",
  },
  colorimetria: {
    hex: "#F43F5E",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    chipActive: "bg-rose-600 text-white",
  },
  herramientas: {
    hex: "#0EA5E9",
    dot: "bg-sky-500",
    chip: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
    chipActive: "bg-sky-600 text-white",
  },
  barberia: {
    hex: "#F59E0B",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    chipActive: "bg-amber-600 text-white",
  },
};

const FALLBACK = {
  hex: "#64748B",
  dot: "bg-slate-400",
  chip: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  chipActive: "bg-slate-600 text-white",
};

function normalize(name = "") {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function categoryColor(name) {
  return PALETTE[normalize(name)] ?? FALLBACK;
}
