import "./style.css";
import http from "axios";
import { z } from "zod";

const ResponseSchema = z.string()
type ResponseSchema = z.infer<typeof ResponseSchema>;

const load = async (v1: string, v2:string): Promise<ResponseSchema | null> => {
  const response = await http.get("http://localhost:3333",{ params: { "v1": v1, "v2":v2}})
  const data = response.data;

  const result = ResponseSchema.safeParse(data);

  if (!result.success) {
    console.log(result.error);
    return null;
  }

  return result.data;
};

const init = async () => {
  const value1 = (document.getElementById("elso") as HTMLInputElement).value
  const value2 = (document.getElementById("masodik") as HTMLInputElement).value
  const str = await load(value1, value2);
  if (str)
    document.getElementById("app")!.innerHTML = str
};

document.getElementById("load-button")!.addEventListener("click", init);

document
  .getElementById("app")!
  .insertAdjacentHTML("afterend", "<p class='bg-pink-400'>demo</p>");
