import { KEYS, getJson, setJson } from "./storage";

export function ensureDefaultAdmin() {
  const accounts = getJson(KEYS.accounts, []);
  if (!accounts.some((acc) => acc.email === "admin")) {
    accounts.push({
      fullname: "Administrator",
      email: "admin",
      phone: "",
      password: "thanh2005",
      status: "active",
      role: "admin",
    });
    setJson(KEYS.accounts, accounts);
  }
}
