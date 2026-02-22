const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists in our db
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                return done(null, user);
            } else {
                // Generate a random 8-digit phone number strictly to pass validation for OAuth users
                const dummyPhone = '+947' + Math.floor(10000000 + Math.random() * 90000000).toString();

                // If not, create a new user
                const newUser = {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    phone: dummyPhone,
                    password: 'google_oauth_placeholder_' + Date.now(), // Generate a placeholder password
                    isEmailVerified: true, // Google emails are already verified
                    role: 'worker' // Default role
                };

                user = await User.create(newUser);
                return done(null, user);
            }
        } catch (err) {
            console.error('Google OAuth Error:', err);
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
