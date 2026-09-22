// Odomknutie aplikácie zámkou obrazovky (odtlačok prsta / Face ID) cez WebAuthn.
// Ide o lokálny zámok zariadenia: prihlásenie do cloudu zostáva na Supabase session,
// biometria len chráni prístup k aplikácii na tomto zariadení.

const KEY_PREFIX = "george-biometric:";
const UNLOCK_PREFIX = "george-biometric-unlocked:";

function toB64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str);
}

function fromB64(value: string) {
  const str = atob(value);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

function randomChallenge() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes;
}

export async function isBiometricSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential || !navigator.credentials) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function isBiometricEnabled(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(KEY_PREFIX + userId);
}

export function isUnlocked(userId: string): boolean {
  if (typeof window === "undefined") return true;
  return window.sessionStorage.getItem(UNLOCK_PREFIX + userId) === "1";
}

export function markUnlocked(userId: string) {
  window.sessionStorage.setItem(UNLOCK_PREFIX + userId, "1");
}

export function clearUnlocked(userId?: string) {
  if (typeof window === "undefined") return;
  if (userId) {
    window.sessionStorage.removeItem(UNLOCK_PREFIX + userId);
    return;
  }
  Object.keys(window.sessionStorage)
    .filter((k) => k.startsWith(UNLOCK_PREFIX))
    .forEach((k) => window.sessionStorage.removeItem(k));
}

export async function enableBiometric(userId: string, label: string): Promise<void> {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge(),
      rp: { name: "George · Slovenská sporiteľňa", id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(userId),
        name: label || "George",
        displayName: label || "George",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Zariadenie nepotvrdilo biometriu.");
  window.localStorage.setItem(KEY_PREFIX + userId, toB64(credential.rawId));
  markUnlocked(userId);
}

export function disableBiometric(userId: string) {
  window.localStorage.removeItem(KEY_PREFIX + userId);
  clearUnlocked(userId);
}

export async function verifyBiometric(userId: string): Promise<boolean> {
  const stored = window.localStorage.getItem(KEY_PREFIX + userId);
  if (!stored) return false;
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge(),
      rpId: window.location.hostname,
      allowCredentials: [{ id: fromB64(stored), type: "public-key" }],
      userVerification: "required",
      timeout: 60_000,
    },
  });
  if (!assertion) return false;
  markUnlocked(userId);
  return true;
}
