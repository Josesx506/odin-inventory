const express = require('express');
const invController = require('../controller/invController');

const router = express.Router();

router.use((req,res,next)=>{
    res.locals.baseUrl = req.baseUrl;
    next();
})

router.get('/',invController.getHome);
router.get('/city',invController.getCityItems);
router.get('/store',invController.getStoreItems);
router.get('/categories',invController.getCategory);
router.get('/item/edit',invController.editItem);
router.post('/item/edit',invController.updateInventoryItem);
router.delete("/item/:id", invController.deleteItem);
router.get('/search',invController.searchCategory);

module.exports = router;
