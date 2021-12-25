require('../Models/Post');
require('../Models/Categorie');
const nodeExpress = require('express');
const nodeMongoose = require('mongoose');
const {areAnAdministrator} = require('./Helpers/Administrator');


const nodeRouter = nodeExpress.Router();
const Post = nodeMongoose.model('posts');
const Category = nodeMongoose.model('categories');

nodeRouter.get('/', areAnAdministrator, (request, response) => {
    response.render('Index');
});

nodeRouter.get('/categories', areAnAdministrator, (request, response) => {
    Category.find().sort({date: 'desc'}).lean().then((categories) => {
        console.log('Categories listed successfully!');
        response.render('Admin/Category', {categories: categories});
    }).catch((error) => {
        console.log(`Failed to list categories: ${error}`);
        request.flash('errorMessage', 'Failed to list categories!');
        response.redirect('/admin/categories');
    });
});

nodeRouter.get('/categories/add', areAnAdministrator, (request, response) => {
    response.render('Admin/Add_Category');
});

nodeRouter.post('/categories/new', areAnAdministrator, (request, response) => {
    let errorsFound = [];

    if (!request.body.name || typeof request.body.name === undefined || typeof request.body.name === null) {
        errorsFound.push({error: 'This name is invalid!'});
    } else if (request.body.name.length < 2) {
        errorsFound.push({error: 'This name is too short!'});
    }
    
    if (!request.body.slug || typeof request.body.slug === undefined || typeof request.body.slug === null) {
        errorsFound.push({error: 'This slug is invalid!'});
    }

    const numberOfErrors = errorsFound.length;

    if (numberOfErrors > 0) {
        response.render('Admin/Add_Category', {errorsFound: errorsFound});
    } else {
        const newCategory = {
            name: request.body.name,
            slug: request.body.slug.replace(/ /g, '-').toLowerCase()
        }
    
        new Category(newCategory).save().then(() => {
            console.log('Category saved successfully!')
            request.flash('successMessage', 'Category saved successfully!');
            response.redirect('/admin/categories');
        }).catch((error) => {
            console.log(`Failed to save category: ${error}`);
            request.flash('errorMessage', 'Failed to save category!');
            response.redirect('/admin/categories');
        });
    }
});

nodeRouter.get('/categories/edit/:id', areAnAdministrator, (request, response) => {
    Category.findOne({_id: request.params.id}).lean().then((category) => {
        response.render('Admin/Edit_Category', {category: category});
    }).catch((error) => {
        console.log(`Failed to find the category: ${error}`);
        request.flash('errorMessage', 'Failed to find the category!')
        response.redirect('/admin/categories');
    });
});

nodeRouter.post('/categories/edit', areAnAdministrator, (request, response) => {
    let errorsFound = [];

    if (!request.body.name || typeof request.body.name === undefined || typeof request.body.name === null) {
        errorsFound.push({error: 'This name is invalid!'});
    } else if (request.body.name.length < 2) {
        errorsFound.push({error: 'This name is too short!'});
    }
    
    if (!request.body.slug || typeof request.body.slug === undefined || typeof request.body.slug === null) {
        errorsFound.push({error: 'This slug is invalid!'});
    }

    const numberOfErrors = errorsFound.length;

    if (numberOfErrors > 0) {
        response.render('Admin/Edit_Category', {errorsFound: errorsFound});
    } else {
        Category.findOne({_id: request.body.id}).then((editedCategory) => {
            editedCategory.name = request.body.name
            editedCategory.slug = request.body.slug.replace(/ /g, '-').toLowerCase();
            
            editedCategory.save().then(() => {
                console.log('Category successfully edited!');
                request.flash('successMessage', 'Category successfully edited!');
                response.redirect('/admin/categories');
            }).catch((error) => {
                console.log(`Failed to edit the category: ${error}`);
                request.flash('errorMessage', 'Failed to edit the category!');
                response.redirect('/admin/categories');
            });
        }).catch((error) => {
            console.log(`Failed to edit the category: ${error}`);
            request.flash('errorMessage', 'Failed to edit the category!');
            response.redirect('/admin/categories');
        });
    }
});

nodeRouter.post('/categories/delete', areAnAdministrator, (request, response) => {
    Category.deleteOne({_id: request.body.id}).then(() => {
        console.log('Category successfully deleted!');
        request.flash('successMessage', 'Category successfully deleted!');
        response.redirect('/admin/categories');
    }).catch((error) => {
        console.log(`Failed to delete the category: ${error}`);
        request.flash('Failed to delete the category!');
        response.redirect('/admin/categories');
    });
});

nodeRouter.get('/posts', areAnAdministrator, (request, response) => {
    Post.find().populate('category').lean().then((posts) => {
        response.render('Admin/Post', {posts: posts});
    }).catch((error) => {
        console.log(error);
    });
});

nodeRouter.get('/posts/add', areAnAdministrator, (request, response) => {
    Category.find().lean().then((categories) => {
        response.render('Admin/Add_Post', {categories: categories});
    }).catch((error) => {
        console.log(`Failed to load categories: ${error}`);
        request.flash('errorMessage', 'Failed to load categories!');
        response.redirect('/admin/posts');
    });
});

nodeRouter.post('/posts/new', areAnAdministrator, (request, response) => {
    let errorsFound = [];

    if (!request.body.title || typeof request.body.title === undefined || typeof request.body.title === null) {
        errorsFound.push({error: 'This title is invalid!'});
    }
    
    if (!request.body.slug || typeof request.body.slug === undefined || typeof request.body.slug === null) {
        errorsFound.push({error: 'This slug is invalid!'});
    }

    if (!request.body.description || typeof request.body.description === undefined || typeof request.body.description === null) {
        errorsFound.push({error: 'This description is invalid!'});
    }

    if (!request.body.content || typeof request.body.content === undefined || typeof request.body.content === null) {
        errorsFound.push({error: 'This content is invalid!'});
    }

    if (request.body.category === 0) {
        errorsFound.push({error: 'Invalid category! Register a category!'});
    }

    const numberOfErrors = errorsFound.length;

    if (numberOfErrors > 0) {
        Category.find().lean().then((categories) => {
            response.render('Admin/Add_Post', {errorsFound: errorsFound, categories: categories});
        })
    } else {
        const newPost = {
            title:          request.body.title,
            slug:           request.body.slug,
            description:    request.body.description,
            content:        request.body.content,
            category:       request.body.category
        }

        new Post(newPost).save().then(() => {
            console.log('Successful created post!');
            request.flash('successMessage', 'Successful created post!');
            response.redirect('/admin/posts');
        }).catch((error) => {
            console.log(`Failed to create the post: ${error}`);
            request.flash('errorMessage', 'Failed to create the post!');
            response.redirect('/admin/posts');
        });
    }
});

nodeRouter.get('/posts/edit/:id', areAnAdministrator, (request, response) => {
    Post.findOne({_id: request.params.id}).lean().then((post) => {
        Category.find().lean().then((categories) => {
            response.render('Admin/Edit_Post', {categories: categories, post: post});
        }).catch((error) => {
            console.log(`Error listing categories: ${error}`);
            request.flash('errorMessage', 'Error listing categories!');
            response.redirect('/admin/posts')
        });
    }).catch((error) => {
        console.log(`Failed to load edit form: ${error}`);
        request.flash('errorMessage', 'Failed to load edit form!');
        response.redirect('/admin/posts');
    });
});

nodeRouter.post('/posts/edit', areAnAdministrator, (request, response) => {
    let errorsFound = [];

    if (!request.body.title || typeof request.body.title === undefined || typeof request.body.title === null) {
        errorsFound.push({error: 'This title is invalid!'});
    }
    
    if (!request.body.slug || typeof request.body.slug === undefined || typeof request.body.slug === null) {
        errorsFound.push({error: 'This slug is invalid!'});
    }

    if (!request.body.description || typeof request.body.description === undefined || typeof request.body.description === null) {
        errorsFound.push({error: 'This description is invalid!'});
    }

    if (!request.body.content || typeof request.body.content === undefined || typeof request.body.content === null) {
        errorsFound.push({error: 'This content is invalid!'});
    }

    if (request.body.category === 0) {
        errorsFound.push({error: 'Invalid category! Register a category!'});
    }

    const numberOfErrors = errorsFound.length;

    if (numberOfErrors > 0) {
        Category.find().lean().then((categories) => {
            response.render('Admin/Edit_Post', {errorsFound: errorsFound, categories: categories});
        });
    } else {
        Post.findOne({_id: request.body.id}).then((editPost) => {
            editPost.title =        request.body.title
            editPost.slug =         request.body.slug.replace(/ /g, '-').toLowerCase();
            editPost.description =  request.body.description
            editPost.content =      request.body.content
            editPost.category =     request.body.category

            editPost.save().then(() => {
                console.log('Post edited successfully!');
                request.flash('successMessage', 'Post edited successfully!');
                response.redirect('/admin/posts');
            }).catch((error) => {
                console.log(`Failed to edit the post: ${error}`);
                request.flash('errorMessage', 'Failed to edit the post!');
                response.redirect('/admin/posts');
            });
        }).catch((error) => {
            console.log(`Failed to edit the post: ${error}`);
            request.flash('errorMessage', 'Failed to edit the post!');
            response.redirect('/admin/posts');
        });
    }
});

nodeRouter.post('/posts/delete', areAnAdministrator, (request, response) => {
    Post.deleteOne({_id: request.body.id}).then(() => {
        console.log('Successfully deleted post!')
        request.flash('successMessage', 'Successfully deleted post!');
        response.redirect('/admin/posts');
    }).catch((error) => {
        console.log(`Failed to delete the post: ${error}`);
        request.flash('errorMessage', 'Failed to delete the post');
        response.redirect('/admin/posts');
    });
})

module.exports = nodeRouter;