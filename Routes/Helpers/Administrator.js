module.exports = {
    areAnAdministrator: (request, response, next) => {
        if (request.isAuthenticated() && request.user.administrator === 1) {
            return next();
        } else {
            request.flash('errorMessage', 'You must be an administrator to access this content!');
            response.redirect('/');
        }
    }
}