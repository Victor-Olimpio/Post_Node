module.exports = {
    areLogged: (request, response, next) => {
        if (request.isAuthenticated()) {
            return next();
        } else {
            request.flash('errorMessage', 'You must be logged in to  access this content!');
            response.redirect('/');
        }
    }
}