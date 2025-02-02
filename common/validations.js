import * as Strings from "~/common/strings";
import * as Utilities from "~/common/utilities";

import JSZip from "jszip";

const USERNAME_REGEX = new RegExp("^[a-zA-Z0-9_]{0,}[a-zA-Z]+[0-9]*$");
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[\w-]+@[a-zA-Z0-9_]+?\.[a-zA-Z]{2,50}$/;

// TODO(jim): Regex should cover some of this.
const REJECT_LIST = [
  "..",
  "$",
  "#",
  "_",
  "_next",
  "next",
  "webpack",
  "system",
  "experience",
  "root",
  "www",
  "website",
  "index",
  "api",
  "public",
  "static",
  "admin",
  "administrator",
  "webmaster",
  "download",
  "downloads",
  "403",
  "404",
  "500",
  "maintenance",
  "guidelines",
  "updates",
  "login",
  "authenticate",
  "sign-in",
  "sign_in",
  "signin",
  "log-in",
  "log_in",
  "logout",
  "terms",
  "terms-of-service",
  "community",
  "privacy",
  "reset-password",
  "reset",
  "logout",
  "dashboard",
  "analytics",
  "data",
  "timeout",
  "please-dont-use-timeout",
];

export const userRoute = (text) => {
  if (!USERNAME_REGEX.test(text)) {
    return false;
  }

  if (REJECT_LIST.includes(text)) {
    return false;
  }

  return true;
};

export const slatename = (text) => {
  if (Strings.isEmpty(text)) {
    return false;
  }

  if (text.length > 48) {
    return false;
  }

  return true;
};

export const username = (text) => {
  if (Strings.isEmpty(text)) {
    return false;
  }

  if (text.length > 48 || text.length < 1) {
    return false;
  }

  if (!userRoute(text)) {
    return false;
  }

  return true;
};

export const password = (text) => {
  if (Strings.isEmpty(text)) {
    return false;
  }

  if (text.length < MIN_PASSWORD_LENGTH) {
    return false;
  }

  return true;
};

export const isFileTypeAllowed = (type = "") => {
  if (type.startsWith("text/")) {
    return true;
  }

  if (type.startsWith("model/")) {
    return true;
  }

  if (type.startsWith("font/")) {
    return true;
  }

  if (type.startsWith("application/")) {
    return true;
  }

  if (type.startsWith("audio/")) {
    return true;
  }

  if (type.startsWith("image/")) {
    return true;
  }

  if (type.startsWith("video/")) {
    return true;
  }

  return false;
};

export const isPreviewableImage = (type = "") => {
  if (type.startsWith("image/svg")) return false;

  return type.startsWith("image/");
};

export const isImageType = (type) => {
  if (type.startsWith("image/")) {
    return true;
  }
};

export const isAudioType = (type) => {
  if (type.startsWith("audio/")) {
    return true;
  }
};

export const isVideoType = (type) => {
  if (type.startsWith("video/")) {
    return true;
  }
};

export const isPdfType = (type) => {
  if (type.startsWith("application/pdf")) {
    return true;
  }
};

export const isEpubType = (type) => {
  if (type.startsWith("application/epub")) {
    return true;
  }
};

export const isFontFile = (fileName) => {
  return Utilities.endsWithAny([".ttf", ".otf", ".woff", ".woff2"], fileName.toLowerCase());
};

export const isMarkdown = (filename, type) => {
  return filename.toLowerCase().endsWith(".md") || type.startsWith("text/plain");
};

export const isUnityFile = async (file) => {
  try {
    const zip = new JSZip();

    const contents = await zip.loadAsync(file);
    const fileNames = Object.keys(contents.files);

    // NOTE(daniel): every Unity game file will have this file
    const isUnityLoaderFile = (fileName) =>
      [/unityloader.js/i, /(.*)\.loader.js/i].some((item) => item.test(fileName));

    return fileNames.some((file) => isUnityLoaderFile(file));
  } catch (e) {
    return false;
  }
};
