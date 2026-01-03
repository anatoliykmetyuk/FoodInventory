# User Stories

This document describes the user stories for the Food Inventory application.

## Loading the Fridge via AI

1. From the Fridge page, the user may click a button "Scan Receipt". The same button is available on the Shopping page.
2. If the user doesn't have an OpenAI API key saved in their account, they are prompted to enter it. The prompt also includes a direct link to the OpenAI API key setup page at OpenAI website.
3. The user is prompted to upload or take a photo of the receipt. This photo is then sent to the OpenAI server for visual recognition and processing - read the prompt from the `resources/img-recognition-prompt.txt` file.
4. The wait spinner is displayed until the receipt is processed.
5. When the OpenAI server replies, the user sees a table: Item, Listed Price, Final Price (after tax and discounts). The user also sees the total cost of the shopping event.
6. The user may edit the table, add or remove items, and edit the prices. If the user edits the prices, the total cost of the shopping event is updated accordingly, reactively.
7. The user may click a button "Save" to save the items to the fridge.
8. The fridge is updated, the new Shopping Event is created with the purchased items, the total cost of the shopping event is calculated, and the user is redirected to the Fridge page.

## Loading the Fridge Manually

### Via the Fridge page:
1. On the Fridge page, the user may click a button "Add Item".
2. The user is prompted to enter the name of the item and the final price (after tax and discounts).
3. The item is added to the fridge.
4. The fridge is updated and the user is redirected to the Fridge page.

### Via the Shopping page:
1. The user may click a button "Add Shopping Event".
2. The user is directed to the Shopping Event page, in edit mode, empty, date is set to today's date.
3. The user may add items to the shopping event and edit the prices. If the user edits the prices, the total cost of the shopping event is updated accordingly, reactively.
4. The user may click a button "Save" to save the items to the fridge.
5. The fridge is updated, the new Shopping Event is created with the purchased items, the total cost of the shopping event is calculated, and the user is redirected to the Fridge page.

## Cooking a Meal

1. From the Cooking page, the user may click a button "Cook Meal".
2. The user is prompted whether to cook from scratch or reuse a prior meal. If the user chooses to reuse a prior meal, they are prompted with the list of recent meals, sorted by date descending. The user may choose a meal from the list. They may also search by name, the meals will be filtered reactively. Only top 10 meals are displayed but the search is conducted over the entire list of meals.
3. A new Meal is created - empty if cooking from scratch, or a copy of the chosen meal if reusing a prior meal, the user is directed to the Meal page, in edit mode, empty, date is set to today's date. The user may enter the name of the meal.
4. The user may add items to the meal from the Fridge, and edit the percentage of each item used. The cost of that item is calculated reactively on percentage updates as percentage * total item cost. The total cost of the meal is calculated reactively. The user may not set the percentage of an item to 0 or less or to more than is available in the fridge.
5. The user may click a button "Save" to save the meal. The user is directed to the Meal page in View mode. The Fridge is updated - the percentage of each item used is reduced by the percentage of the item used in the meal. If the percentage drops to 0, the item is removed from the fridge.

## Consuming a Meal Portion

- At the Cooking page, at the Active Meal's card, the user may click a button "Consume Portion". This will reduce the number of portions left by 1. If the number of portions left is 0, the meal is marked as inactive and moved from the Active Meals section to the Completed Meals section.
- At the Meal page, the user may click a button "Consume Portion". This will reduce the number of portions left by 1. If the number of portions left is 0, the meal is marked as inactive and moved from the Active Meals section to the Completed Meals section.

## Viewing Cooking Statistics

1. At the Statistics page, the user is presented with a chart - meal cost per day. It is an aggregate of all meals cooked on that day by cost.
2. The user may use the following controls to reactively update the chart:
    - Date range - the user may select a date range to filter the meals. The default is one month into the past until today.
    - Granularity - the user may aggregate the meals by day or week. The default is day.
    - Type - the user may select whether to show the Meals or Shopping Events. The default is Meals. The user may switch between the two types.
3. The chart is updated reactively upon changes to the controls.
4. The user may hover over a data point to see the details - all the items that went into the aggregate, their costs, as well as the total.
5. The user may click on the entries in the popup to navigate to the entry's respective page (Meal or Shopping Event).

