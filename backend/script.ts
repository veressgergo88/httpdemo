import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { z } from "zod"

const server = express();

server.use(cors());

const RequestSchema = z.object({
    v1: z.string(),
    v2: z.string()
})

server.get("/", (req: Request, res: Response) => {
  
  const result = RequestSchema.safeParse(req.query)
  
  if (!result.success) {
    return res.sendStatus(400)
  }

  res.send("result is: " + result.data.v1 + result.data.v2);
});

server.listen(3333);
