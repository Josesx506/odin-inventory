const { Client } = require("pg");
const fs = require('node:fs');
const path = require('path');
require('dotenv').config();

const dirName = path.dirname(__filename)

const CREATETABLES = `
CREATE TABLE IF NOT EXISTS inv_ctgr (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category VARCHAR ( 255 ),
  url VARCHAR
);

CREATE TABLE IF NOT EXISTS inv_items (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  city VARCHAR ( 255 ),
  store VARCHAR ( 255 ),
  address VARCHAR ( 512 ),
  cat_id INTEGER REFERENCES inv_ctgr(id) ON DELETE CASCADE,
  item VARCHAR ( 255 ),
  qty INTEGER,
  price FLOAT,
  url VARCHAR
);
`;

// Read the files synchronously to enable insertion sequentially.
let insertCATEGORY;
let insertINVENTORY;

try {
  const data = fs.readFileSync(`${dirName}/dummy/categories.json`, 'utf8');
  const categoryItems = JSON.parse(data);
  const values = categoryItems.map(
      ({ category, url }) => 
        `('${category}', '${url}')`
  );
  
  insertCATEGORY = `
    INSERT INTO inv_ctgr (category, url) 
    VALUES ${values.join(", \n")};`;
  
} catch (err) {
  console.error(err);
}

try {
    const data = fs.readFileSync(`${dirName}/dummy/inventory.json`, 'utf8');
    const inventoryItems = JSON.parse(data);
    const values = inventoryItems.map(
        ({ City, StoreName, Address, CategoryId, Items, Quantity, Price, ImageUrl }) => 
          `('${City}', '${StoreName.replace("'","")}', '${Address}', '${CategoryId}', '${Items}', ${Quantity}, ${Price}, '${ImageUrl}')`
    );
    
    insertINVENTORY = `
      INSERT INTO inv_items (city, store, address, cat_id, item, qty, price, url) 
      VALUES ${values.join(", \n")};`;
    
  } catch (err) {
    console.error(err);
}


async function main() {
    console.log("seeding...");
    const client = new Client({
      connectionString: process.env.DBURI,
    });
    await client.connect();
    await client.query(CREATETABLES);
    // Check if the db has any values 
    const { rows } = await client.query("SELECT COUNT(*) FROM inv_items");
    if (parseInt(rows[0].count) === 0) {
      console.log("DB empty, populating db");
      await client.query(insertCATEGORY);
      await client.query(insertINVENTORY);
    } else {
      console.log("DB contains values, skipping seeding");
    }
    await client.end();
    console.log("done");
}
  
main();