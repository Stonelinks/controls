import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as expressWs from "express-ws";
import * as url from "url";
import { SERVER_PORT, VIEWER_FOLDER } from "./common/constants";
import { registerConfigRoutes } from "./routes/config";
import { registerDbRoutes } from "./routes/db";
import { registerRobovacRoutes } from "./routes/robovac";
import { initConfig } from "./utils/config";
import { initDb } from "./utils/db";
import { connectToEcoVacs } from "./utils/robovac";

const app = (express() as unknown) as expressWs.Application;

expressWs(app, null, {
  wsOptions: {
    perMessageDeflate: false,
  },
});

app.use(express.static(VIEWER_FOLDER));

app.use(cors());

app.use(
  bodyParser.json({
    limit: "1gb", // heaven help us if we ever get more than a gig of JSON
  }),
);

app.get("/ping", (req, res) => {
  res.send(JSON.stringify({ pong: "pong" }));
});

(async () => {
  try {
    await initConfig();
    await initDb();
    await connectToEcoVacs();
    await registerRobovacRoutes(app);
    await registerConfigRoutes(app);
    await registerDbRoutes(app);
  } catch (e) {
    console.error(e);
  } finally {
    // register catchall route
    app.get("*", (req, res) => {
      console.log(
        `missed URL: ${url.format({
          protocol: req.protocol,
          host: req.get("host"),
          pathname: req.originalUrl,
        })}`,
      );
      res.sendFile(`${VIEWER_FOLDER}/index.html`);
    });

    // start the server
    app.listen(SERVER_PORT, () => {
      console.log(`server listening on ${SERVER_PORT}`);
    });
  }
})();
