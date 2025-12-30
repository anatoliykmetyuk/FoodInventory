## Pitch
A web application that allows users to manage the food in their fridge and estimate the cost of each meal they cook, as well as reflect on the statistics of their cooking.

## Format
Web application, charts, dark theme, responsive mobile-first, design similar to the one in the `spec/design-guide/` folder screenshots.

## Tech Stack
Vanilla React, Vite, deployed on Vercel, GitHub Actions to run tests, Playwright for testing.
OpenAI client side for receipt image recognition.
Data is persisted client-side in the browser's local storage.
Rechart for charts.

## Pages
Top-level pages below are accessible from the top navigation bar, or the breadcrumb navigation on mobile.

- Fridge - overview the food items in the fridge, their cost of purchase, estimated calories,, the percentage left. Note that the "listed price" is NOT reflected in the fridge.
- Cooking - an overview of the meals that the user has cooked, their cost, estimated calories, portions (cooked vs left). Active meals are the meals which still have one or more portions left. They are displayed at the top of the page as a separate section.
    - Meal - a page that shows the breakdown of an individual meal (items from the fridge used, percentage of those items used, cost of that item (percentage * total item cost), estimated calories). The user may also edit the items in the meal. This is also the page that the user is redirected to after cooking a meal via the Cooking page. Note that the "listed price" is NOT reflected in the meal.
- Shopping - overview shopping events - when, total cost - as well as the breakdown of each individual shopping event (a list of item names, listed price, final price, estimated calories).
    - Shopping Event - a page that shows the breakdown of an individual shopping event (a list of item names, listed price, final price, estimated calories). The user may also edit the items in the shopping event. This is also the page that the user is redirected to after loading the fridge via AI or manually, as well as after adding a shopping event via the Shopping page.
- Statistics - a page that shows various interactive charts about user's cooking and shopping habits.
- Settings - buttons to wipe the data and to export the data as a JSON file, set the OpenAI API key.

## User Stories
### Loading the Fridge via AI
1. From the Fridge page, the user may click a button "Scan Receipt". The same button is a vailable on the Shopping page.
2. If the user doesn't have an OpenAI API key saved in their account, they are prompted to enter it. The prompt also includes a direct link to the OpenAI API key setup page at OpenAI website.
3. The user is prompted to upload or take a photo of the receipt. This photo is then sent to the OpenAI server for visual recognition and processing - read the prompt from the `resources/img-recognition-prompt.txt` file.
4. The wait spinner is displayed until the receipt is processed.
5. When the OpenAI server replies, the user sees a table: Item, Listed Price, Final Price (after tax and discounts), Estimated Calories. The user also sees the total cost of the shopping event.
6. The user may edit the table, add or remove items, edit the prices, and edit the estimated calories. If the user edits the prices, the total cost of the shopping event is updated accordingly, reactively.
7. The user may click a button "Save" to save the items to the fridge.
8. The fridge is updated, the new Shopping Event is created with the purchased items, the total cost of the shopping event is calculated, and the user is redirected to the Fridge page.

### Loading the Fridge Manually
Via the Fridge page:
1. On the Fridge page, the user may click a button "Add Item".
2. The user is prompted to enter the name of the item, the final price (after tax and discounts), and the estimated calories.
3. The item is added to the fridge.
4. The fridge is updated and the user is redirected to the Fridge page.

Via the Shopping page:
1. The user may click a button "Add Shopping Event".
2. The user is directed to the Shopping Event page, in edit mode, empty, date is set to today's date.
3. The user may add items to the shopping event, edit the prices, and edit the estimated calories. If the user edits the prices, the total cost of the shopping event is updated accordingly, reactively.
4. The user may click a button "Save" to save the items to the fridge.
5. The fridge is updated, the new Shopping Event is created with the purchased items, the total cost of the shopping event is calculated, and the user is redirected to the Fridge page.

### Cooking a Meal
1. From the Cooking page, the user may click a button "Cook Meal".
2. The user is prompted whether to cook from scratch or reuse a prior meal. If the user chooses to reuse a prior meal, theu are prompted with the list of recent meals, sorted by date descending. The user may choose a meal from the list. They may also search by name, the meals will be filtered reactively. Only top 10 meals are displayed but the search is conducted over the entire list of meals.
3. A new Meal is created - empty if cooking from scratch, or a copy of the chosen meal if reusing a prior meal, the user is directed to the Meal page, in edit mode, empty, date is set to today's date. The user may enter the name of the meal.
4. The user may add items to the meal from the Fridge, and edit the percentage of each item used. The cost of that item is calculated reactively on percentage updates as percentage * total item cost. The calories of the item are calculated the same way. The total cost and calories of the meal are calculated reactively. The user may not set the percentage of an item to 0 or less or to more than is available in the fridge.
5. The user may click a button "Save" to save the meal. The user is directed to the Meal page in View mode. The Fridge is updated - the percentage of each item used is reduced by the percentage of the item used in the meal. If the percentage drops to 0, the item is removed from the fridge.

### Consuming a Meal Portion
- At the Cooking page, at the Active Meal's card, the user may click a button "Consume Portion". This will reduce the number of portions left by 1. If the number of portions left is 0, the meal is marked as inactive and moved from the Active Meals section to the Completed Meals section.
- At the Meal page, the user may click a button "Consume Portion". This will reduce the number of portions left by 1. If the number of portions left is 0, the meal is marked as inactive and moved from the Active Meals section to the Completed Meals section.

### Viewing Cooking Statistics
1. At the Statistics page, the user is presented with a chart - meal cost per day. It is an aggregate of all meals cooked on that day by cost.
2. The user may use the following controls to reactively update the chart:
    - Date range - the user may select a date range to filter the meals. The default is one month into the past until today.
    - Granularity - the user may aggregate the meals by day or week. The default is day.
    - Type - the user may select whether to show the Meals or Shopping Events. The default is Meals. The user may switch between the two types.
3. The chart is updated reactively upon changes to the controls.
4. The user may hover over a data point to see the details - all the items that went into the aggregate, their costs, as well as the total.
5. The user may click on the entries in the popup to navigate to the entry's respective page (Meal or Shopping Event).

## Deliverables
- Code
- Tests - unit and integration tests.
- Documentation

### Deliverable Documentation
Under `docs/` folder, produce documentation for the following:
- User Stories
- Deployment guide
- Data & Calculations Model

## Architectural Notes
- Items are referred and uniquely identified by their unique ID.
- Meals are referred and uniquely identified by their unique ID.
- Shopping Events are referred and uniquely identified by their unique ID.
- When calling the OpenAI API, make sure to request the response in JSON format.
- Make sure to handle errors and display them in a user-friendly way, including the error message, especially for OpenAI API calls.

## Verification and Testing
You will verify and test each step of the implementation using the following process:
- Write unit tests to test all the components that go into the feature in isolation.
- Write integration tests to test the feature as a whole.
- During testing, mock the OpenAI API - do not perform real calls, work on mock data.
- Test also OpenAI API failures and errors.
- Test also abnormal data handling supplied from the user.
- Use linters, build tools, and typescript to catch errors and warnings.

## Implementation Guide for AI Agent
You will break down the application into a series of small steps, each implementing a single feature or improvement. You will implement the application iteratively. Each iteration will be structure as follows:

- Implement the feature in code
- Verify the feature works using browser tool (simulare OpenAI API calls with mock data during development)
- Follow Verification and Testing guide above to write thorough unit tests for the feature as well as integration tests
- Run the tests, fix any issues with written and existing tests

During planning, it is important that you include the testing and verification in the end of each step of the implementation.

You will autonomously execute the steps above until the application is complete.
