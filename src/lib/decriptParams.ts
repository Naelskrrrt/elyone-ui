import { AES, enc, mode, pad } from "crypto-js";

/**
 * Déchiffre une donnée chiffrée avec AES-256-CBC.
 *
 * @param {string} encryptedData - La donnée chiffrée en base64.
 * @param {string} key - La clé de chiffrement (doit être une chaîne de 32 caractères).
 * @param {string} ivBase64 - L'IV (vecteur d'initialisation) en base64.
 * @returns {string} - La donnée déchiffrée en texte clair.
 */
const decryptAES256CBC = (
    encryptedData: string,
    key: string,
    ivBase64: string
): string | null => {
    try {
        // Décoder l'IV depuis base64
        const iv = enc.Base64.parse(ivBase64);

        // Déchiffrer les données
        const decrypted = AES.decrypt(encryptedData, enc.Utf8.parse(key), {
            iv: iv,
            mode: mode.CBC, // Utilisation du mode CBC
            padding: pad.Pkcs7, // Utilisation du padding PKCS7
        });

        // Retourner la donnée déchiffrée en texte clair
        return decrypted.toString(enc.Utf8);
    } catch (error) {
        console.error("Erreur lors du déchiffrement :", error);
        return null;
    }
};

export default decryptAES256CBC;
