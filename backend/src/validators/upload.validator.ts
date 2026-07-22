import { z } from "zod";

import { ALLOWED_EXTENSIONS_PATTERN } from "../utils/imageValidation";



const localFilenamePattern = new RegExp(

  `^[a-zA-Z0-9._-]+(\\.(${ALLOWED_EXTENSIONS_PATTERN}))?$`,

  "i",

);



/** Admin gallery delete — local basename or Cloudinary public_id (may include `/`). */

export const uploadDeleteParamSchema = z.object({

  filename: z

    .string()

    .min(1, "Image identifier is required")

    .max(400)

    .refine((raw) => {

      const name = decodeURIComponent(raw.trim());

      if (!name || name.includes("..")) {

        return false;

      }

      if (localFilenamePattern.test(name)) {

        return true;

      }

      if (/^\d+-[a-f0-9]+$/i.test(name)) {

        return true;

      }

      if (/^[a-zA-Z0-9._/-]+$/.test(name)) {

        return true;

      }

      return false;

    }, "Invalid image identifier"),

});



/** Legacy param schema for routes that only accept local filenames */

export const uploadFilenameParamSchema = uploadDeleteParamSchema;


