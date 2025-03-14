const db = require("../model/queries");
const { body, validationResult } = require("express-validator");

const validateItem = [
  body("name")
    .trim()
    .matches(/^[a-zA-Z0-9\s]+$/).withMessage(`Item name must contain only letters and numbers`)
    .isLength({ min: 1, max: 200 }).withMessage(`Item name must be between 1 and 200 characters.`)
    .escape(),
  body("price")
    .trim()
    .isFloat({ min: 0 }).withMessage(`Price must be a positive float`),
  body("category")
    .trim()
    .isInt().withMessage(`Category ID must be a number`),
  body("city")
    .trim()
    .matches(/^[a-zA-Z\s]+$/).withMessage(`City name must contain only letters`)
    .isLength({ min: 1, max: 200 }).withMessage(`City name must be between 1 and 200 characters.`)
    .escape(),
  body("store")
    .trim()
    .matches(/^[a-zA-Z\s.-]+$/).withMessage(`Store name must contain only letters`)
    .isLength({ min: 1, max: 200 }).withMessage(`Store name must be between 1 and 200 characters.`)
    .escape(),
  body("url")
    .trim()
    .isURL({ require_protocol:true }),
];

const CURR_FMTR = new Intl.NumberFormat(undefined, {
    currency: "USD", style: "currency"
})

async function getHome(req, res) {
    const cities = await db.getCities();
    const stores = await db.getStores();
    res.render('index', { 
            title: "odin inventory",
            cities: cities.map(obj => obj.city),
            stores: stores.map(obj => obj.store),
    });
}

async function getCategory(req, res) {
    if (req.query.id) {
        const catQuery = req.query.id;
        const items = await db.getCategoryItems(catQuery);
        res.render("items", {
            title: "inventory items",
            items: items,
            fmtr: CURR_FMTR,
        });
    } else {
        const categories = await db.getCategories();
        res.render('category', { 
                title: "categories",
                categories: categories,
        });
    }
}

async function getCityItems(req, res) {
    const cityQuery = req.query.name;
    const items = await db.getCityItems(cityQuery);
    res.render('items', { 
            title: "city",
            items: items,
            fmtr: CURR_FMTR,
    });
}

async function getStoreItems(req, res) {
    const storeQuery = req.query.name;
    const items = await db.getStoreItems(storeQuery);
    res.render('items', { 
            title: "city",
            items: items,
            fmtr: CURR_FMTR,
    });
}

async function editItem(req, res) {
    if (req.query.id) {
        const itemId = req.query.id;
        const item = await db.getOneItem(itemId);
        const cities = await db.getCities();
        const stores = await db.getStores();
        const categories = await db.getCategoryLabels();
        res.render('form', { 
            title: "edit inventory",
            item: item[0],
            cities: cities.map(obj => obj.city),
            stores: stores.map(obj => obj.store),
            categories: categories,
            itemId: item[0].id
        });
    } else {
        return res.status(400).json({ message: "Bad Request" });
    }
}

const updateInventoryItem = [ validateItem,
    async (req, res) => {
        if (!req.query.id && !req.body) {
            return res.status(400).json({ message: "Bad Request" });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const item = req.body;
            item.item = item.name;
            item.cat_id = parseInt(item.category);
            const cities = await db.getCities();
            const stores = await db.getStores();
            const categories = await db.getCategoryLabels();
            return res.status(400).render("form", {
                title: "edit inventory",
                item: item,
                cities: cities.map(obj => obj.city),
                stores: stores.map(obj => obj.store),
                categories: categories,
                errors: errors.array(),
                itemId: req.query.id
            });
        }

        const itemId = req.query.id;
        const updtEntries = req.body;
        // Update the db with the entries
        await db.updateItem(updtEntries,itemId);
        res.redirect("/");
    }
]

async function deleteItem(req, res) {
    if (req.params.id && req.query.pswd) {
        const itemId = req.params.id;
        if (req.query.pswd === "odin") {
            await db.deleteItem(itemId);
            res.json({ message: "Item deleted successfully!" });
        } else {
            return res.status(403).json({ message: "Incorrect password!\nCheck Footer" });
        }
    } else {
        return res.status(400).json({ message: "Bad Request" });
    }
}

async function searchCategory(req, res) {
    const query = req.query.q.trim();
    if (!query) return res.json([]);
    
    const results = await db.searchCategory(query);

    res.json(results.map(item => ({
        id: item.id,
        name: item.category.replace(new RegExp(`(${query})`, 'gi'), '<span class="highlight">$1</span>'),
        category: item.category || ''
    })));
}

module.exports = {
    getHome,getCategory,getCityItems,
    getStoreItems,editItem,deleteItem,
    updateInventoryItem,searchCategory
}