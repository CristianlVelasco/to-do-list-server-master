const mongoose = require("mongoose");

/**
 * User schema definition.
 * 
 * Represents application users stored in MongoDB.
 * Includes authentication fields and automatic timestamps.
 */
const UserSchema = new mongoose.Schema(
    {
        /**
         * The unique username of the user.
         * @type {String}
         * @required
         */
        username: { type: String, required: true },
        /**
         * The password of the user.
         * Stored as plain text here, but should be hashed
         * before saving in a production environment.
         * @type {String}
         * @required
         */
        password: { type: String, required: true },
         /**
         * The password of the user.
         * Stored as plain text here, but should be hashed
         * before saving in a production environment.
         * @type {String}
         * @required
         */
         email: { type: String, required: true },
    },
    {
        /**
         * Adds `createdAt` and `updatedAt` timestamp fields automatically.
         */
        timestamps: true
    }
);

/**
 * Mongoose model for the User collection.
 * Provides an interface to interact with user documents.
 */
module.exports = mongoose.model("User", UserSchema);
