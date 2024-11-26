// middlewares/auth.js

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
}

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'You do not have permission to view that resource');
    res.status(403).send('Access Denied: Admins Only');
}

module.exports = {
    ensureAuthenticated,
    ensureAdmin
};
