const assert = require("assert");
const { syncFulfillmentStatus, isValidAssignmentStatus } = require("../utils/orderStatusSync");

function run() {
	assert.strictEqual(syncFulfillmentStatus("Pending", "InProgress"), "Confirmed");
	assert.strictEqual(syncFulfillmentStatus("Confirmed", "InProgress"), "Confirmed");
	assert.strictEqual(syncFulfillmentStatus("Shipped", "Completed"), "Delivered");
	assert.strictEqual(syncFulfillmentStatus("Pending", "Completed"), "Confirmed");
	assert.strictEqual(syncFulfillmentStatus("Pending", "Cancelled"), "Cancelled");
	assert.strictEqual(syncFulfillmentStatus("Pending", "Rejected"), "Pending");
	assert.strictEqual(isValidAssignmentStatus("Assigned"), true);
	assert.strictEqual(isValidAssignmentStatus("Invalid"), false);
	console.log("orderStatusSync tests passed");
}

run();
