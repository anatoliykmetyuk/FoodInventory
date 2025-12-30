- [x] Fridge: should be able to CRUD items. This operation does NOT affect existing meals.
- [x] Calories on the cooking page and elsewhere: should be formatted to 2 decimal places.
- [x] Fridge: item layout should be a list, even on desktop.
- [x] Cooking: should be able to delete meals. When deleting a meal, restore used percentages of ingredients to the fridge - but only if the item is still available in the fridge, otherwise do nothing. Items are uniquely identified by their ID (and NOT by name, check and enforce this).
- [x] Meal: once created, should be immutable. That is, percentage used cannot be changed after creation, ingredients cannot be deleted.
- [x] Statistics: chart should reflect the currency of the user's account in the vertical axis.
- [x] Statistics: when hovering over a data point, the popup moves around for some reason. Fix this, should stay in place.
- [x] Statistics: should be possible to click on the entries in the popup to navigate to the entry's respective page (Meal or Shopping Event).
- [x] Data Management in Settings: add a disclaimer that the data will be lost if the user clears their browser history, so they better back it up to their machine.
- [x] Settings: add a button to import data from a JSON file.

- [x] It should be possible to delete a Meal from that Meal's page.
- [x] Statistics: the tooltip is STILL not staying in place. Fix this!
- [x] Shopping Events: when creating, should be possible to edit the date!

- [x] Meal page when creating a new meal: percentage used ticker should have a step of 1%.
- [x] It should be possible to Delete Shopping Events both from the Shopping Events page and from the Shopping Event's page.
- [x] If the user tries to save an empty Shopping Event, do not save it, show a toaster saying it was not saved because it is empty.
- [x] Statistics: you could not fix the floating tooltip problem. Change to tooltip to not display the related items, only the total numbers.
- [x] Statistics: when the user clicks a data point, related items are displayed at the bottom of the page, clickable to navigate to the respective Meal or Shopping Event page.

- [x] Fridge when editing a percentage of an item: ticker should have a step of 1%.
- [x] Shopping Events: delete button should be only visible on hover, as a red button saying "Delete", bottom right of the card.
- [x] Shopping Event page: add delete button there.
- [x] Shopping event Save button: the event is STILL saved even if it is empty, even though the toaster is displayed! Fix this!

- [x] Statistics: calculate cumulative totals. Make each day or week's data point a Bar and the cumulative total a Line.

- [x] Scan Receipt on Mobile: the result has too small width. Set a reasonable minimal width so it's possible to read the items, and make it scrollable if necessary.
- [x] Statistics: on mobile, controls should be stacked vertically, not horizontally like a flex layout.
- [x] Shopping Events: when creating a new event, "Cancel" button somehow STILL creates an event. Fix this!