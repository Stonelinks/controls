import { Application } from "express-ws";
import { getDb } from "../utils/db";

export const registerDbRoutes = async (app: Application) => {
  app.get("/db/get", async (req, res) => {
    const db = await getDb();
    res.send(JSON.stringify(db));
  });
};
