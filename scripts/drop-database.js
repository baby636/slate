import configs from "~/knexfile";
import knex from "knex";

const envConfig = configs["development"];

console.log(`SETUP: database`, envConfig);

const db = knex(envConfig);

console.log(`RUNNING:  drop-database.js`);

Promise.all([
  db.schema.dropTable("users"),
  db.schema.dropTable("slates"),
  db.schema.dropTable("slate_files"),
  db.schema.dropTable("files"),
  db.schema.dropTable("activity"),
  db.schema.dropTable("subscriptions"),
  db.schema.dropTable("keys"),
  db.schema.dropTable("global"),
  db.schema.dropTable("stats"),
  db.schema.dropTable("deals"),
  db.schema.dropTable("orphans"),
  db.schema.dropTable("usage"),
]);

console.log(`FINISHED: drop-database.js`);
console.log(`          CTRL +C to return to terminal.`);
