### Inventory App
I created a grocery store inventory application using node `express` and `ejs` view templates. The app lets you 
perform basic ***`CRUD`*** operations but I omitted adding new items to the db to save storage. Users can change 
item names or edit image urls to make the app more appealing and make item cards relatable. Items can also be 
assigned to different stores or cities. <br>
Launch the app with `npm run start`. It requires a `DBURI` environment variable and access to postgres.

### Dataset (personal notes)
Inventory data was gotten from a kaggle dataset, and I preprocessed it in python to create 12 simplified categories. 
The data rows were converted into a json with pandas and bulk inserted into postgres using the npm `pg` library. The 
insertion script is in `model/populatedb.js`<br>
I only created 2 tables because I'm using only one railway db instance for all my remaining Odin projects and I'm 
trying to minimize the required storage per project. Two main tables are `inv_ctgr` and `inv_items` for the categories 
and items. 

### Learnings
- [x] Reimplemented learnings on MVC architecture and form validation using `express-validator`.
- [x] Implemented search bar that updates list results using data obtained directly from the db (with help from claude and chat gpt).
- [x] Improved mobile nav bar design and grid + card css implementation
- [x] Implemented admin password to mimic authentication for delete operations


### Technical Debt
Wrote the sql directly without escaping input so the app is prone to xss attacks.