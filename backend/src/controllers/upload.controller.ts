import type { Request, Response } from "express";

import * as uploadService from "../services/upload.service";

import { ApiError } from "../utils/ApiError";

import { sendSuccess } from "../utils/ApiResponse";

import { asyncHandler } from "../utils/asyncHandler";

import {

  assertValidImageFile,

  removeFileQuietly,

} from "../utils/imageValidation";



async function handleValidatedUpload(req: Request) {

  if (!req.file) {

    throw ApiError.badRequest("Image file is required");

  }



  try {

    await assertValidImageFile(

      req.file.path,

      req.file.mimetype,

      req.file.originalname,

    );

  } catch (error) {

    await removeFileQuietly(req.file.path);

    throw error;

  }



  return uploadService.processUploadedFile(req.file);

}



export const uploadPaymentProofPublic = asyncHandler(

  async (req: Request, res: Response) => {

    const data = await handleValidatedUpload(req);

    sendSuccess(res, data, "Payment proof uploaded", 201);

  },

);



export const uploadImage = asyncHandler(async (req: Request, res: Response) => {

  const data = await handleValidatedUpload(req);

  sendSuccess(res, data, "Image uploaded", 201);

});



export const listGallery = asyncHandler(async (_req: Request, res: Response) => {

  const images = await uploadService.listGalleryImages();

  sendSuccess(res, images, "Gallery images retrieved");

});



export const deleteImage = asyncHandler(async (req: Request, res: Response) => {

  const result = await uploadService.deleteGalleryImage(

    String(req.params.filename),

  );

  sendSuccess(res, result, "Image deleted");

});


