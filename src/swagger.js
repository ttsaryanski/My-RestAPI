import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "js-yaml";

const swaggerDocument = yaml.load(
    fs.readFileSync("./src/docs/openapi.yaml", "utf8")
);

export { swaggerUi, swaggerDocument };
