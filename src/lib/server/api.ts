import type { NextApiRequest, NextApiResponse } from "next";

export const allowMethods = (
  req: NextApiRequest,
  res: NextApiResponse,
  methods: string[]
): boolean => {
  if (!methods.includes(req.method ?? "")) {
    res.setHeader("Allow", methods);
    res.status(405).json({ message: "Method not allowed" }); 
    return false;
  }
  return true;
};


export const getUserId = async (): Promise<number> => 6;


export const handleApiError = (
  res: NextApiResponse,
  err: unknown,
  status = 500,
  message = "Internal Server Error"
) => {
  console.error(message, err instanceof Error ? err.message : err);
  return res.status(status).json({ message }); 
};