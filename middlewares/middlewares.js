module.exports = {
    checkAdminLoggedIn: (req, res, next) => {
        if (req.session.adminLoggedIn) {
            next()
        } else {
            res.redirect("/admin")
        }
    },

    checkUserLoggedIn: (req, res, next) => {
        if (req.session.loggedIn) {
            next()
        } else {
            res.redirect("/login")
        }
    },

    sessionHandle: (req, res, next) => {
        if (req.ression.loggedIn) {
            res.redirect("/")
        } else {
            next()
        }
    },
}