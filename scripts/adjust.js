import configs from "~/knexfile";
import knex from "knex";

const envConfig = configs["development"];

console.log(`SETUP: database`, envConfig);

const db = knex(envConfig);

console.log(`RUNNING:  adjust.js`);

const createUsageTable = db.schema.createTable("usage", function (table) {
  table.uuid("id").primary().unique().notNullable().defaultTo(db.raw("uuid_generate_v4()"));
  table.uuid("userId").references("id").inTable("users");
  table.timestamp("createdAt").notNullable().defaultTo(db.raw("now()"));
});

Promise.all([createUsageTable]);

console.log(`FINISHED: adjust.js`);
console.log(`          CTRL +C to return to terminal.`);
