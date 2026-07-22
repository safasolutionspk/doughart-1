import type { Request, Response } from "express";
import * as cakeService from "../services/cake.service";
import * as comboCakeService from "../services/comboCake.service";
import * as popularityService from "../services/popularity.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getValidatedParam, getValidatedQuery } from "../utils/validatedRequest";

export const listPublicCakes = asyncHandler(async (req: Request, res: Response) => {
  const cakes = await cakeService.listPublicCakes(
    getValidatedQuery(req),
    req.tenantContext,
  );
  sendSuccess(res, cakes, "Cakes retrieved");
});

export const listPublicPopularCakes = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{ limit: number }>(req);
    const cakes = await popularityService.listPublicPopularCakes(
      query.limit,
      req.tenantContext,
    );
    sendSuccess(res, cakes, "Popular cakes retrieved");
  },
);

export const listPublicComboOffers = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{ limit: number }>(req);
    const cakes = await comboCakeService.listPublicComboOfferCakes(
      query.limit,
      req.tenantContext,
    );
    sendSuccess(res, cakes, "Combo offers retrieved");
  },
);

export const getPublicCakeBySlug = asyncHandler(async (req: Request, res: Response) => {
  const cake = await cakeService.getPublicCakeBySlug(
    getValidatedParam(req, "slug"),
    req.tenantContext,
  );
  sendSuccess(res, cake, "Cake retrieved");
});

export const listCakes = asyncHandler(async (req: Request, res: Response) => {
  const result = await cakeService.listCakes(getValidatedQuery(req), req.tenantContext);
  sendSuccess(res, result.cakes, "Cakes retrieved", 200, {
    pagination: result.pagination,
  });
});

export const getCake = asyncHandler(async (req: Request, res: Response) => {
  const cake = await cakeService.getCakeById(
    getValidatedParam(req, "id"),
    req.tenantContext,
  );
  sendSuccess(res, cake, "Cake retrieved");
});

export const createCake = asyncHandler(async (req: Request, res: Response) => {
  const cake = await cakeService.createCake(req.body, req.tenantContext);
  sendSuccess(res, cake, "Cake created", 201);
});

export const updateCake = asyncHandler(async (req: Request, res: Response) => {
  const cake = await cakeService.updateCake(
    getValidatedParam(req, "id"),
    req.body,
    req.tenantContext,
  );
  sendSuccess(res, cake, "Cake updated");
});

export const deleteCake = asyncHandler(async (req: Request, res: Response) => {
  const result = await cakeService.deleteCake(
    getValidatedParam(req, "id"),
    req.tenantContext,
  );
  sendSuccess(res, result, "Cake deleted");
});

export const listComboOffers = asyncHandler(async (req: Request, res: Response) => {
  const result = await comboCakeService.listComboOfferCakes(
    getValidatedQuery(req),
    req.tenantContext,
  );
  sendSuccess(res, result.cakes, "Combo offers retrieved", 200, {
    pagination: result.pagination,
  });
});

export const getComboOffer = asyncHandler(async (req: Request, res: Response) => {
  const cake = await comboCakeService.getComboOfferCakeById(
    getValidatedParam(req, "id"),
    req.tenantContext,
  );
  sendSuccess(res, cake, "Combo offer retrieved");
});

export const createComboOffer = asyncHandler(async (req: Request, res: Response) => {
  const cake = await comboCakeService.createComboOfferCake(
    req.body,
    req.tenantContext,
  );
  sendSuccess(res, cake, "Combo offer created", 201);
});

export const updateComboOffer = asyncHandler(async (req: Request, res: Response) => {
  const cake = await comboCakeService.updateComboOfferCake(
    getValidatedParam(req, "id"),
    req.body,
    req.tenantContext,
  );
  sendSuccess(res, cake, "Combo offer updated");
});

export const deleteComboOffer = asyncHandler(async (req: Request, res: Response) => {
  const result = await comboCakeService.deleteComboOfferCake(
    getValidatedParam(req, "id"),
    req.tenantContext,
  );
  sendSuccess(res, result, "Combo offer deleted");
});
