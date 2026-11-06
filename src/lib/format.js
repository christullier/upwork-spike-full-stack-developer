export function renderTemplate(template, lead, studio) {
  const firstName = lead?.name?.split(" ")[0] ?? "there";
  return template
    .replaceAll("{{first_name}}", firstName)
    .replaceAll("{{studio}}", studio.name);
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function money(value) {
  return `$${Number(value).toLocaleString("en-US")}`;
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
