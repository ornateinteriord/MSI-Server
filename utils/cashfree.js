const { Cashfree } = require("cashfree-pg");
require("dotenv").config();

// Fix: Create an instance because methods are on the prototype
const cashfree = new Cashfree();

// Map Env Vars Correctly
cashfree.XClientId = process.env.CASHFREE_APP_ID;
cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
cashfree.XApiVersion = "2023-08-01"; // Set default API version

// Fix: Cashfree.Environment might be undefined in some versions/contexts
// Using string literals which are typically accepted
if (process.env.CASHFREE_ENVIRONMENT === "PRODUCTION") {
    cashfree.XEnvironment = Cashfree.Environment ? Cashfree.Environment.PRODUCTION : "PRODUCTION";
} else {
    cashfree.XEnvironment = Cashfree.Environment ? Cashfree.Environment.SANDBOX : "SANDBOX";
}

module.exports = cashfree;
