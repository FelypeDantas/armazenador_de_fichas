import { NextResponse } from "next/server";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
};

const ALLOWED_ORIGIN =
  "https://felypedantas.github.io";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin":
    ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type",
};

export function corsResponse() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

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
    headers: CORS_HEADERS,
  });
}
