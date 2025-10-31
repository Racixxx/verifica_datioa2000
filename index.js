import express from "express";

const app = express();
app.use(express.json());

// Domini email comuni accettati
const COMMON_DOMAINS = new Set([
  "gmail.com", "gmail.it", "hotmail.com", "hotmail.it",
  "outlook.com", "outlook.it", "yahoo.com", "yahoo.it",
  "libero.it", "icloud.com", "live.it", "live.com"
]);

// ✅ Verifica email
function isEmailValid(email) {
  if (typeof email !== "string") return false;
  email = email.trim().toLowerCase();

  // Deve contenere una sola @
  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (local.length < 3 || local.length > 64) return false;

  // No spazi
  if (/\s/.test(email)) return false;

  // Formato corretto
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) return false;

  // Dominio deve avere un punto e minimo 3 caratteri
  if (!domain.includes(".") || domain.length < 3) return false;

  // Rifiuta domini palesemente fake
  const badWords = ["test", "fake", "asd", "prova", "qqq", "xxx"];
  for (const bad of badWords) if (domain.includes(bad)) return false;

  // Se dominio comune → ok
  if (COMMON_DOMAINS.has(domain)) return true;

  // Se dominio aziendale plausibile → accetta
  return domain.split(".").length >= 2 && domain.length >= 5;
}

// ✅ Verifica telefono
function isPhoneValid(phone) {
  if (typeof phone !== "string" && typeof phone !== "number") return false;
  let p = String(phone).trim();

  // Rimuove simboli inutili
  p = p.replace(/[()\s\-.]/g, "");

  // Rimuove prefissi + e +39
  if (p.startsWith("+39")) p = p.slice(3);
  if (p.startsWith("+")) p = p.slice(1);

  // Deve contenere solo numeri
  if (!/^\d+$/.test(p)) return false;

  // Lunghezza accettabile
  if (p.length < 8 || p.length > 15) return false;

  // Rifiuta numeri tipo 111111111
  if (/^(\d)\1+$/.test(p)) return false;

  return true;
}

// ✅ Endpoint principale
app.post("/verifica", (req, res) => {
  try {
    const { email, telefono } = req.body || {};

    if (!email || !telefono) {
      return res.status(200).send("DATI INVALIDI");
    }

    const emailOk = isEmailValid(email);
    const telOk = isPhoneValid(telefono);

    const result = (emailOk && telOk) ? "DATI VERIFICATI" : "DATI INVALIDI";
    res.status(200).send(result);
  } catch (err) {
    console.error("Errore:", err);
    res.status(500).send("DATI INVALIDI");
  }
});

// 🚀 Avvia server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook attivo su porta ${PORT}`));
