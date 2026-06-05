// Self-contained reCAPTCHA keys for the /from-repo demo (your keys).
// recaptchaKey        → v3 (invisible, score-based)
// recaptchaKeyForV2   → v2 ("I'm not a robot" checkbox)
// recaptchaKeyForV2Hard → "key-v2-real-hard" — separate, real (hard) v2 key.
export const recaptchaKey = "6LdFZA4tAAAAAFH26HtSIjG7SkvFE5PebD-F9m8Z";
export const recaptchaKeyForV2 = "6Ldv2QwtAAAAACPW15qWL0-ypdxX5aTuUMu7JkZW";

// "key-v2-real-hard". Its secret isn't used here (v2 is a client-side gate).
export const recaptchaKeyForV2Hard = "6LezXA4tAAAAAIXgyeyg-TVC9x3f-GnFlZ1jeuxz";
export const recaptchaSecretForV2Hard =
  "6LezXA4tAAAAAL_9A6O5QLvjcWQfwmG6KMBI7snx";
