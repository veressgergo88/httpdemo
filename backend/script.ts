import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import fs from "fs/promises";
import { z } from "zod";
import { Client } from 'pg'
const client = new Client("postgres://veress.gergo88:S68naWfBXvpT@ep-bitter-snow-42313997.us-west-2.aws.neon.tech/neondb?options=project%3Dep-bitter-snow-42313997&sslmode=require")

const server = express();

server.use(cors());
server.use(express.json())

type User = {
  id: number;
  name: string;
  age: number;
};

const parse = (data: string): User[] =>
data
.split("\n")
.filter((row) => !!row)
.map((row) => ({
  id: +row.split(",")[0],
  name: row.split(",")[1],
  age: +row.split(",")[2],
}));

const stringify = (data: User[]): string => data
    .map(user => `${user.id},${user.name},${user.age}`)
    .join("\n")

const QueryParamSchema = z.object({
  name: z.string(),
});

// REST API - GET (method) /api/users (path) => array
// REST API - GET - (/api/users?name=John, /api/users?age=30&name=John) => array
server.get("/api/users", async (req: Request, res: Response) => {
  const result = QueryParamSchema.safeParse(req.query)
  if (result.success === false) {
    return res.sendStatus(400)
  }
  const name = result.data.name
  const answer = await client.query(`SELECT * FROM profile WHERE name='${name}';`, [])
  res.json(answer.rows)
})


// REST API - GET /api/users/15 (id -ra szokás!!!) path variable => 1 object
server.get("/api/users/:id", async (req: Request, res: Response) => {
  const id = +req.params.id
  
  const userData = await fs.readFile("./database/users.txt", "utf-8");
  const users = parse(userData);
  let filteredUser = users.filter(user => user.id === id)
  
  if (!filteredUser)
    return res.sendStatus(404)

  res.json(filteredUser);
});

// REST API - POST
const CreationSchema = z.object({
  name: z.string(),
  age: z.number()
});

let id = 0

server.post("/api/users", async (req: Request, res: Response) => {
  const result = CreationSchema.safeParse(req.body)
  if (!result.success)
    return res.sendStatus(400).json(result.error.issues)

  const userData = await fs.readFile("./database/users.txt", "utf-8")
  const users = parse(userData)
  users.push({id: users.length?users[users.length-1].id + 1:0, name: result.data.name, age: result.data.age, })

  await fs.writeFile("./database/users.txt", stringify(users), "utf-8")  

  res.sendStatus(200)
})

// REST API - DELETE id
server.delete("/api/users/:id", async (req: Request, res: Response) => {

  const id = +req.params.id

  const userData = await fs.readFile("./database/users.txt", "utf-8")
  const users = parse(userData)
  let filteredUser = users.filter(user => user.id !== id)

  await fs.writeFile("./database/users.txt",stringify(filteredUser), "utf-8")

  res.sendStatus(200)
})

// REST API - UPGRADE/PATCH
const PatchSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).optional(),
  age: z.number().optional()
});

server.patch("/api/users/:id", async (req, res) => {
  const id = +req.params.id
  
  const result = PatchSchema.safeParse(req.body)
  if(!result.success) 
    return res.sendStatus(400).json(result.error.issues);

  const userData = await fs.readFile("./database/users.txt", "utf-8")
  const users = parse(userData)
  let filteredUser = users.map((user) => user.id === id ? {name: result.data.name || user.name, age: result.data.age === undefined ? user.age : result.data.age, id} : user)

  await fs.writeFile("./database/users.txt", stringify(filteredUser), "utf-8")
  
  res.sendStatus(200)
})

client.connect().then(() => server.listen(3333))


