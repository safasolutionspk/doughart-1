import type { Request, Response } from "express";
import * as categoryService from "../services/category.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getValidatedParam, getValidatedQuery } from "../utils/validatedRequest";

export const listPublicCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.listPublicCategories(req.tenantContext);
  sendSuccess(res, categories, "Categories retrieved");
});

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.listCategories(
    getValidatedQuery(req),
    req.tenantContext,
  );
  sendSuccess(res, result.categories, "Categories retrieved", 200, {
    pagination: result.pagination,
  });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(
    getValidatedParam(req, "id"),
    req.tenantContext,
  );
  sendSuccess(res, category, "Category retrieved");
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body, req.tenantContext);
  sendSuccess(res, category, "Category created", 201);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(
    getValidatedParam(req, "id"),
    req.body,
    req.tenantContext,
  );
  sendSuccess(res, category, "Category updated");
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.deleteCategory(
    getValidatedParam(req, "id"),
    req.tenantContext,
  );
  sendSuccess(res, result, "Category deleted");
});
