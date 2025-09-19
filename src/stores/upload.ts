/*
 * SPDX-FileCopyrightmessage: Linca, syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { BrowserImageResizerConfigWithConvertedOutput } from "@misskey-dev/browser-image-resizer";
import { readAndCompressImage } from "@misskey-dev/browser-image-resizer";
import isAnimated from "is-file-animated";
import type * as Misskey from "misskey-js";

let isWebpSupportedCache: boolean | undefined;
export function isWebpSupported() {
  if (isWebpSupportedCache === undefined) {
    const canvas = window.document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    isWebpSupportedCache = canvas
      .toDataURL("image/webp")
      .startsWith("data:image/webp");
  }
  return isWebpSupportedCache;
}

const compressTypeMap: Record<
  string,
  Partial<BrowserImageResizerConfigWithConvertedOutput>
> = {
  "image/jpeg": { quality: 0.85, mimeType: "image/webp" },
  "image/png": { quality: 0.85, mimeType: "image/webp" },
  "image/webp": { quality: 0.85, mimeType: "image/webp" },
  "image/svg+xml": { quality: 1, mimeType: "image/webp" },
} as const;

const compressTypeMapFallback: Record<
  string,
  Partial<BrowserImageResizerConfigWithConvertedOutput>
> = {
  "image/jpeg": { quality: 0.85, mimeType: "image/jpeg" },
  "image/png": { quality: 0.85, mimeType: "image/png" },
  "image/webp": { quality: 0.85, mimeType: "image/jpeg" },
  "image/svg+xml": { quality: 1, mimeType: "image/png" },
} as const;

export async function getCompressionConfig(
  file: File,
): Promise<Partial<BrowserImageResizerConfigWithConvertedOutput> | undefined> {
  const imgConfig = (
    isWebpSupported() ? compressTypeMap : compressTypeMapFallback
  )[file.type];
  if (!imgConfig || (await isAnimated(file))) {
    return;
  }

  return {
    maxWidth: 2048,
    maxHeight: 2048,
    debug: true,
    ...imgConfig,
  };
}

const mimeTypeMap: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
} as const;

function mimeTypeToFileExtension(mimeType?: string): string | undefined {
  return mimeType ? mimeTypeMap[mimeType] : undefined;
}

import { defineStore } from "pinia";

type Uploading = {
  id: string;
  name: string;
  progressMax: number | undefined;
  progressValue: number | undefined;
  img: string;
};

export const useUploader = defineStore("uploader", () => {
  const uploadings = ref<Uploading[]>([]);
  const account = useAccount();
  const { t } = useI18n();
  const popupMessages = usePopupMessage();

  function add(u: Uploading) {
    uploadings.value.push(u);
  }

  function remove(id: string) {
    uploadings.value = uploadings.value.filter((x) => x.id !== id);
  }

  function setProgress(id: string, value: number, max: number) {
    uploadings.value = uploadings.value.map((x) => {
      if (x.id === id) {
        return {
          ...x,
          progressValue: value,
          progressMax: max,
        };
      }
      return x;
    });
  }

  function uploadFile(
    file: File,
    folder?: string | Misskey.entities.DriveFolder | null,
    name?: string,
    keepOriginal = false,
  ): Promise<Misskey.entities.DriveFile> {

    if (account.me == null) throw new Error("Not logged in");
    if (account.meta == null) throw new Error("Meta is not loaded");

    const _folder = typeof folder === "string" ? folder : folder?.id;

    if (
      file.size > account.meta.maxFileSize ||
      file.size > account.me.policies.maxFileSizeMb * 1024 * 1024
    ) {
      popupMessages.push({
        type: "error",
        title: t("failedToUpload"),
        message: t("cannotUploadBecauseExceedsFileSizeLimit"),
      });
      throw new Error("File size exceeds the limit");
    }

    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();

      const reader = new FileReader();
      reader.onload = async (): Promise<void> => {
        const filename = name ?? file.name ?? "untitled";
        const extension =
          filename.split(".").length > 1 ? "." + filename.split(".").pop() : "";

        const config = !keepOriginal
          ? await getCompressionConfig(file)
          : undefined;
        let resizedImage: Blob | undefined;

        let uploadingName = id + extension;

        if (config) {
          try {
            const resized = await readAndCompressImage(file, config);
            if (resized.size < file.size || file.type === "image/webp") {
              // The compression may not always reduce the file size
              // (and WebP is not browser safe yet)
              resizedImage = resized;
            }

            if (import.meta.env.DEV) {
              const saved = ((1 - resized.size / file.size) * 100).toFixed(2);
              console.log(
                `Image compression: before ${file.size} bytes, after ${resized.size} bytes, saved ${saved}%`,
              );
            }

            uploadingName =
              file.type !== config.mimeType
                ? `${uploadingName}.${mimeTypeToFileExtension(config.mimeType)}`
                : uploadingName;
          } catch (err) {
            console.error("Failed to resize image", err);
          }
        }

        add({
          id,
          name: uploadingName,
          progressMax: undefined,
          progressValue: undefined,
          img: window.URL.createObjectURL(file),
        });

        const formData = new FormData();
        formData.append("i", account.token);
        formData.append("force", "true");
        formData.append("file", resizedImage ?? file);
        formData.append("name", uploadingName);
        if (_folder) formData.append("folderId", _folder);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", new URL("/api/drive/files/create", account.api.origin), true);
        xhr.addEventListener("load", function (ev) {
          if (
            xhr.status !== 200 ||
            ev.target == null ||
            this.response == null
          ) {
            // TODO: 消すのではなくて(ネットワーク的なエラーなら)再送できるようにしたい
            remove(id);

            if (xhr.status === 413) {
              popupMessages.push({
                type: "error",
                title: t("failedToUpload"),
                message: t("cannotUploadBecauseExceedsFileSizeLimit"),
              });
            } else if (this.response) {
              const res = JSON.parse(this.response);
              if (res.error?.id === "bec5bd69-fba3-43c9-b4fb-2894b66ad5d2") {
                popupMessages.push({
                  type: "error",
                  title: t("failedToUpload"),
                  message: t("cannotUploadBecauseInappropriate"),
                });
              } else if (
                res.error?.id === "d08dbc37-a6a9-463a-8c47-96c32ab5f064"
              ) {
                popupMessages.push({
                  type: "error",
                  title: t("failedToUpload"),
                  message: t("cannotUploadBecauseNoFreeSpace"),
                });
              } else {
                popupMessages.push({
                  type: "error",
                  title: t("failedToUpload"),
                  message: `${res.error?.message}\n${res.error?.code}\n${res.error?.id}`,
                });
              }
            } else {
              popupMessages.push({
                type: "error",
                title: "Failed to upload",
                message: `${JSON.stringify(this.response)}, ${JSON.stringify(xhr.response)}`,
              });
            }

            reject();
            return;
          }

          const driveFile = JSON.parse(this.response);

          resolve(driveFile);

          remove(id);
        })

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgress(id, ev.loaded, ev.total);
          }
        };

        xhr.send(formData);
      };
      reader.readAsArrayBuffer(file);
    });
  }


  return {
    uploadings,
    add,
    remove,
    setProgress,
    uploadFile,
  }
});
