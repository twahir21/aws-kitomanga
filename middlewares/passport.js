// middlewares/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { database } = require('../models/database'); // Adjust path as needed

// Define the local strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        console.log('Checking user:', username); // For debugging

        // Fetch the user from the database, making the username comparison case-insensitive
        const result = await database.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);

        if (result.rows.length === 0) {
            console.log('User not found!');
            return done(null, false, { message: 'Incorrect username.' });
        }

        const user = result.rows[0];

        // Compare the hashed password
        const passwordMatch = await bcrypt.compare(password, user.pswd);

        if (passwordMatch) {
            console.log('Mission success, user is authenticated');
            // Ensure role is present
            if (!user.role) {
                console.error('User role is undefined for user:', user.username);
                return done(null, false, { message: 'User role not defined.' });
            }
            return done(null, user);
        } else {
            console.log('Password mismatch!');
            return done(null, false, { message: 'Incorrect password.' });
        }
    } catch (err) {
        console.log('Server error', err);
        return done(err);
    }
}));

// Serialize user to store in session
passport.serializeUser((user, done) => {
    console.log(`Serializing user ID: ${user.id}`);
    done(null, user.id); // Store only the user ID in session
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        console.log(`Deserializing user ID: ${id}`);
        const result = await database.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = result.rows[0];
        if (!user) {
            console.log('User not found during deserialization.');
            return done(new Error('User not found'), null);
        }
        console.log(`User deserialized: ${user.username} with role ${user.role}`);
        done(null, user);
    } catch (err) {
        console.error('Error during deserialization:', err);
        done(err, null);
    }
});

module.exports = { passport };
