import json
import random
import re

import pandas as pd

random.seed(442)

"""
Data was downloaded from https://www.kaggle.com/datasets/prashantk93/inventory-data-for-grocery?resource=download
"""

# Define the US cities to use
US_CITIES = ["Atlanta", "Baton Rouge", "Tucson", "Los Angeles", "Philadelphia"]

# Stock image URLs for different product categories
PRODUCT_IMAGES = {
    "Beef": "https://images.unsplash.com/photo-1551028150-64b9f398f678?w=250&h=250&fit=crop",
    "Poultry": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=250&h=250&fit=crop",
    "Vegetables": "https://images.unsplash.com/photo-1557844352-761f2565b576?w=250&h=250&fit=crop",
    "Fruits": "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=250&h=250&fit=crop",
    "Bakery": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=250&h=250&fit=crop",
    "Snacks": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=250&h=250&fit=crop",
    "Spices": "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=250&h=250&fit=crop",
    "Kitchen": "https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?fit=crop&cs=tinysrgb&w=250&h=250&dpr=1",
    "Dairy": "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?fit=crop&cs=tinysrgb&w=250&h=250&dpr=1",
    "Seafood": "https://images.pexels.com/photos/28701103/pexels-photo-28701103/free-photo-of-delicious-sushi-platter-with-fresh-seafood.jpeg?fit=crop&cs=tinysrgb&w=250&h=250&dpr=1",
    "Beverages": "https://images.pexels.com/photos/3028500/pexels-photo-3028500.jpeg?fit=crop&cs=tinysrgb&w=250&h=250&dpr=1",
    "Alcohol": "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?fit=crop&cs=tinysrgb&w=250&h=250&dpr=1",
    "Confectionery": "https://images.pexels.com/photos/19532206/pexels-photo-19532206/free-photo-of-flowers-on-and-around-stand.jpeg?fit=crop&cs=tinysrgb&w=250&h=250&dpr=1",
    "Default": "https://images.unsplash.com/photo-1553546895-531931aa1aa8?w=250&h=250&fit=crop",
}

def extract_product_group(product_name):
    """Extract the product group from the product name"""
    if not product_name:
        return "Unknown"
    
    # Split by common separators
    parts = re.split(r"\s+-\s+|\s+–\s+|\s*,\s*|\s+\(", product_name)
    group = parts[0].strip()
    if len(parts)>1:
        group += " "+parts[1].strip()
    
    # Handle special cases
    if any(term in group.lower() for term in ["appetiser","appetizer","assorted","bagel","chocolate", "cookie", "sugar","caramel",
                                              "cake","eggroll","muffin"]):
        return "Confectionery"
    elif any(term in group.lower() for term in ["bacardi","wine", "beer","brandy","vodka", "liqueur", "rum", "cognac","calypso",
                                                "chivas","whisky","goldschalger","island oasis","jack daniels","jameson","mix",
                                                "remy"]):
        return "Alcohol"
    elif any(term in group.lower() for term in ["arizona","juice", "soda", "water", "tea", "coffee","canada dry","cocoa","coke",
                                                "dr. pepper","gatorade","gingerale","lemonade"]):
        return "Beverages"
    elif any(term in group.lower() for term in ["allspice","aspic","basil","bay leaf","bouillion","chilli","cloves","cardamon",
                                                "cumin","curry","garlic","ginger","seasoning","hummus","leaves","lemon pepper",
                                                "lotus","sauce","oregano","parsley","relish","pimento","rosemary","sage",
                                                "paprika","thyme","peppercorn"]):
        return "Spices"
    elif any(term in group.lower() for term in ["apricots","banana","blackber","breadfruit","cherries","coconut","dragon fruit",
                                                "eggplant","fig","guava","fruit","mangoes","melon","orange","pineapple",
                                                "plantain","black cur"]):
        return "Fruits"
    elif any(term in group.lower() for term in ["asparagus","beets","bok","cabbage","carrots","chervil","chevril","corn","daikon",
                                                "radish","leeks","lentils","lettuce","mushroom","onion","pepper","potato","okra",
                                                "spinach","sprouts","squash","tomato"]):
        return "Vegetables"
    elif any(term in group.lower() for term in ["bread", "bagel", "pastry", "cake", "muffin", "croissant", "cookie", "tart",
                                                "flour","baguette","pie"]):
        return "Bakery"
    elif any(term in group.lower() for term in ["cheese", "milk", "yogurt", "cream", "dairy","eggwhite","ice cream"]):
        return "Dairy"
    elif any(term in group.lower() for term in ["chip","chips","crackers"]):
        return "Snacks"
    elif any(term in group.lower() for term in ["clam","cod","crab","halibut","lobster","fish","monkfish","salmon","sea bass",
                                                "shark","shrimp","squid"]):
        return "Seafood"
    elif any(term in group.lower() for term in ["beef", "veal", "venison", "oxtail","goat","ham","hog","lamb","pork","rabbit"]):
        return "Beef"
    elif any(term in group.lower() for term in ["chicken", "capon", "turkey", "fowl", "quail", "pheasant", "duck"]):
        return "Poultry"
    elif any(term in group.lower() for term in ["cup","plate","bowl","utensil","knife","spoon","fork","napkin", 
                                                "container","bag","tray"]):
        return "Kitchen"
    
    
    return group

def extract_item_name(product_name, product_group):
    """Extract the item name from the product name and group"""
    if not product_name:
        return "Regular"
    
    if product_group.lower() in product_name.lower() and " - " in product_name:
        product_name = product_name.split(" - ")[1]
    elif product_group.lower() not in product_name.lower() and " - " in product_name:
        product_name = product_name.replace(" - "," ")
    if ", " in product_name:
        product_name = product_name.replace(",","")
    
    return product_name

def get_image_url(product_group):
    """Get appropriate image URL for the product group"""
    # Check for exact matches
    if product_group in PRODUCT_IMAGES:
        return PRODUCT_IMAGES[product_group]
    
    # Check for partial matches
    for category, terms in {
        "Beef": ["beef", "veal", "venison", "oxtail","pork", "ham", "bacon", "sausage", "salami","lamb", "goat", "muskox"],
        "Poultry": ["chicken", "capon", "turkey", "fowl", "quail", "pheasant"],
        "Seafood": ["fish", "cod", "tuna", "salmon", "halibut", "monkfish", "trout", "sole", "bass",
                    "seafood", "lobster", "shrimp", "crab", "clam", "scallop", "octopus", "squid"],
        "Vegetables": ["vegetable", "zucchini", "pepper", "lettuce", "carrot", "onion", "garlic", "potato", "spinach", 
                       "tomato", "eggplant"],
        "Fruits": ["fruit", "orange", "apple", "banana", "mango", "berry", "lemon", "pineapple", "pear"],
        "Dairy": ["cheese", "milk", "yogurt", "cream", "dairy"],
        "Bakery": ["bread", "bagel", "pastry", "cake", "muffin", "croissant", "cookie", "tart"],
        "Beverages": ["juice", "water", "soda", "coffee", "tea", "drink", "lemonade", "pop"],
        "Alcohol": ["wine", "beer", "liquor", "vodka", "rum", "cognac", "whisky", "tequila"],
        "Confectionery": ["chocolate", "sugar", "sweet", "candy", "cookie", "confection"],
        "Spices": ["spice", "pepper", "salt", "herb", "seasoning", "curry", "paprika", "basil","sauce", "condiment", 
                   "ketchup", "mustard", "mayonnaise", "relish", "vinegar", "oil"],
        "Pasta": ["pasta", "noodle", "spaghetti", "macaroni"],
        "Soup": ["soup", "broth", "stew"],
        "Snacks": ["chip", "cracker", "snack", "popcorn", "pretzel"],
        "Kitchen": ["cup", "plate", "bowl", "utensil", "knife", "spoon", "fork", "napkin", "container", "bag", "tray"]
    }.items():
        if any(term.lower() in product_group.lower() for term in terms):
            return PRODUCT_IMAGES[category]
    
    # Return default image if no match found
    return PRODUCT_IMAGES["Default"]

def clean_inventory_data(input_file, output_file):
    """Clean the inventory data according to requirements"""
    # Read the Excel file
    df = pd.read_excel(input_file)
    
    # Process each row
    for index, row in df.iterrows():
        # 1. Replace city with random US city
        df.at[index, "City"] = random.choice(US_CITIES)
        
        # 2. Extract product group and item name
        product_name = row["ProductName"]
        product_group = extract_product_group(product_name)
        item_name = extract_item_name(product_name, product_group)
        
        if not item_name:
            item_name = "Regular"
        
        df.at[index, "Categories"] = product_group
        df.at[index, "Items"] = item_name
        
        # 3. Add stock image URL
        df.at[index, "ImageUrl"] = "https://images.pexels.com/photos/4198043/pexels-photo-4198043.jpeg?fit=crop&cs=tinysrgb&w=120&h=120&dpr=1"
    
    df = df[df.Categories.isin(PRODUCT_IMAGES.keys())]
    df["Price"] = df[["Cost","RetailPrice"]].min(axis=1)/100
    df["Price"] = df["Price"].round(2)
    df = df.rename(columns={"Area":"Address","QuantityAvailable":"Quantity"})
    df = df.drop(columns=["InventoryId","ProductName","QuantitySold","Cost","RetailPrice"])

    categories = list(PRODUCT_IMAGES.keys())
    category_mapping = {category: index + 1 for index, category in enumerate(categories)}
    df["CategoryId"] = df["Categories"].apply(lambda val: category_mapping[val])

    df = df[["City","StoreName","Address","CategoryId","Items","Quantity","Price","ImageUrl"]]
    df = df.sort_values(["City","StoreName","CategoryId","Items","Price"])
    
    # print(df)
    # Save to new json file for JS
    df.to_json(output_file, index=False, orient="records")
    print(f"Cleaned data saved to {output_file}")

# Usage
# Create the inventory data
clean_inventory_data("InventoryData.xlsx", "inventory.json")

# Create the category data
json_list = [{"category": key, "url": value} for key, value in PRODUCT_IMAGES.items()]
with open("categories.json", "w") as fp:
    json.dump(json_list, fp, indent=2)