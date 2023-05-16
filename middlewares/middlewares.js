const user_helpers = require('../helpers/user_helpers')

module.exports = {
    checkAdminLoggedIn: (req, res, next) => {
        if (req.session.adminLoggedIn) {
            next()
        } else {
            res.redirect("/admin")
        }
    },

    checkUserLoggedIn: async(req, res, next) => {
        if (req.session.loggedIn) {
            // const user = req.session.user;
            let user = await user_helpers.getUser(req.session.user._id)
            if(user.status){
                req.session.user = user;
                // console.log(" pooooy...  user in middleware", user )
                next()
            } else{
                req.session.destroy()
                res.redirect("/login")
            }
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