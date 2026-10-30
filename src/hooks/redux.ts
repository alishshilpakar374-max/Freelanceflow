import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/lib/store";

// Use these everywhere instead of plain useDispatch / useSelector.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
