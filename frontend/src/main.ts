import "./style.css";
import http from "axios";
import { z } from "zod";

const CharacterResponseSchema = z.object({
  info: z.object({
    next: z.string(),
  }),
  results: z
    .object({
      name: z.string(),
    })
    .array(),
});
type CharacterResponse = z.infer<typeof CharacterResponseSchema>;

const load = async (): Promise<CharacterResponse | null> => {
  const response = await http.get("https://rickandmortyapi.com/api/character");
  const data = response.data;

  const result = CharacterResponseSchema.safeParse(data);

  if (!result.success) {
    console.log(result.error);
    return null;
  }

  return result.data;
};

const init = async () => {
  const characters = await load();
  if (characters)
    document.getElementById("app")!.innerHTML = characters.results[0].name;
};

document.getElementById("load-button")!.addEventListener("click", init);

document
  .getElementById("app")!
  .insertAdjacentHTML("afterend", "<p class='bg-pink-400'>demo</p>");
