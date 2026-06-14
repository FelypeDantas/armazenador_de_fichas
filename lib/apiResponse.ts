import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
};

export function success<T>(
  data: T,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function fail(
  error: string,
  status = 400,
  details?: unknown
) {
  const body: ApiResponse = {
    success: false,
    error,
  };

  if (details !== undefined) {
    body.details = details;
  }

  return NextResponse.json(body, {
    status,
  });
}