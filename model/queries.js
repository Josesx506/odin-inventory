const pool = require("./pool");

async function getCities() {
  const { rows } = await pool.query("SELECT DISTINCT city FROM inv_items ORDER BY city");
  return rows;
}

async function getStores() {
  const { rows } = await pool.query("SELECT DISTINCT store FROM inv_items ORDER BY store");
  return rows;
}

async function getCategoryLabels() {
    const { rows } = await pool.query(`SELECT id,category FROM inv_ctgr`);
    return rows;
}

async function getCategories() {
    const { rows } = await pool.query(`
        SELECT inv_ctgr.id AS id, category, inv_ctgr.url, COUNT(item) AS total 
        FROM inv_ctgr 
        JOIN inv_items ON inv_items.cat_id=inv_ctgr.id 
        GROUP BY category, inv_ctgr.id, inv_ctgr.url
        ORDER BY category`);
    return rows;
}

async function getCategoryItems(catID) {
    const { rows } = await pool.query(`
        SELECT inv_items.id,city,price,store,item,
               category,inv_items.url AS url 
        FROM inv_items 
        JOIN inv_ctgr ON inv_ctgr.id=inv_items.cat_id
        WHERE cat_id='${catID}'
        ORDER BY city,item`);
    return rows;
}

async function getCityItems(cityName) {
    const { rows } = await pool.query(`
        SELECT inv_items.id,city,price,store,item,
               category,inv_items.url AS url 
        FROM inv_items 
        JOIN inv_ctgr ON inv_ctgr.id=inv_items.cat_id
        WHERE city='${cityName}'
        ORDER BY city,item`);
    return rows;
}

async function getStoreItems(storeName) {
    const { rows } = await pool.query(`
        SELECT inv_items.id,city,price,store,item,
               category,inv_items.url AS url 
        FROM inv_items 
        JOIN inv_ctgr ON inv_ctgr.id=inv_items.cat_id
        WHERE store='${storeName}'
        ORDER BY city,item`);
    return rows;
}

async function getOneItem(itemId) {
    const { rows } = await pool.query(`
        SELECT * FROM inv_items WHERE id=${itemId}`);
    return rows;
}

async function updateItem(updtObj, itemId) {
    await pool.query(`
        UPDATE inv_items
        SET item = '${updtObj.name}',
            city = '${updtObj.city}',
            store = '${updtObj.store}',
            cat_id = ${parseInt(updtObj.category)},
            price = ${parseFloat(updtObj.price)},
            url = '${updtObj.url}'
        WHERE id=${itemId}
    `);
}

async function deleteItem(itemId) {
    // This function does not return anything. It's also at risk 
    // of sql injection. Properly escape input for real projects
    await pool.query(`DELETE FROM inv_items WHERE id=${itemId}`);
}

async function searchCategory(query) {
    const { rows } = await pool.query('SELECT id,category FROM inv_ctgr WHERE category ILIKE $1 LIMIT 10', [`%${query}%`]);
    return rows;
}

module.exports = {
    getCities,getStores,getCategoryLabels,
    getCategories,getCityItems,getStoreItems,
    getCategoryItems,getOneItem,updateItem,deleteItem,
    searchCategory
};
