const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const async = require("async");

exports.bookinstance_list = (req, res, next) => {
  BookInstance.find({})
    .populate("book")
    .exec(function(err, list_bookinstances) {
      if (err) return next(err);

      res.render("bookinstance_list", { title: "Book instances", bookinstance_list: list_bookinstances })
    })
};

exports.bookinstance_detail = (req, res, next) => {
  const { id } = req.params;
  BookInstance.findById(id)
    .populate("book")
    .exec(function(err, bookinstance) {
      if (err) return next(err);

      res.render("bookinstance_detail", {
        title: `Copy ${bookinstance.book.title}`,
        bookinstance,
      });
    });
};

exports.bookinstance_create_get = (req, res) => {
  Book.find({}, "title").exec((err, books) => {
    if (err) return next(err);

    res.render("bookinstance_form", {
      title: "Create Book Instance",
      book_list: books,
    });
  });
};

exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid Date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.status
    });

    if (!errors.isEmpty()) {
      Book.find({}, "title").exec((err, books) => {
        if (err) return next(err);

        res.render("bookinstance_form", {
          title: "Create Book Instance",
          book_list: books,
          selected_book: bookinstance.book._id, 
          errors: errors.array(),
          bookinstance,
        });
      });
      return;
    }

    bookinstance.save(err => {
      if (err) return next(err);

      res.redirect(bookinstance.url);
    });
  },
];

exports.bookinstance_delete_get = (req, res) => {
  BookInstance.findById(req.params.id, (err, bookinstance) => {
    if (err) return next(err);

    res.render("bookinstance_delete", {
      title: "Delete BookInstance",
      bookinstance,
    })
  })
};

exports.bookinstance_delete_post = (req, res, next) => {
  BookInstance.findByIdAndRemove(req.body.bookinstanceid, (err) => {
    if (err) return next(err);

    res.redirect('/catalog/bookinstances');
  })
};

exports.bookinstance_update_get = (req, res, next) => {
  async.parallel({
    bookinstance(cb) {
      BookInstance.findById(req.params.id).populate("book").exec(cb);
    },  
    book_list(cb) {
      Book.find({}).exec(cb);
    },
  }, (err, results) => {
    if (err) return next(err);

    res.render("bookinstance_form", {
      title: "Update BookInstance",
      bookinstance: results.bookinstance,
      book_list: results.book_list,
      selected_book: results.bookinstance.book._id.toString(),
    })
  })
};

exports.bookinstance_update_post = [
  body("book", "Book must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("imprint", "Imprint must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status")
    .escape(),
  body("due_back")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Book.find({}, "title").exec((err, book_list) => {
        if (err) return next(err);

        res.render("bookinstance_form", {
          title: "Update BookInstance (again)",
          book_list,
          bookinstance,
          selected_book: bookinstance.book.toString(),
          errors: errors.array(),
        });
      });

      return;
    } else {
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, (err, thebookinstance) => {
        if (err) return next(err);
  
        res.redirect(thebookinstance.url);
      })
    }
  }
];

// exports.bookinstance_update_post = [
//   // Validate and sanitize fields.
//   body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
//   body("imprint", "Imprint must be specified")
//     .trim()
//     .isLength({ min: 1 })
//     .escape(),
//   body("status").escape(),
//   body("due_back", "Invalid date")
//     .optional({ checkFalsy: true })
//     .isISO8601()
//     .toDate(),

//   // Process request after validation and sanitization.
//   (req, res, next) => {
//     // Extract the validation errors from a request.
//     const errors = validationResult(req);

//     // Create a BookInstance object with escaped/trimmed data and current id.
//     var bookinstance = new BookInstance({
//       book: req.body.book,
//       imprint: req.body.imprint,
//       status: req.body.status,
//       due_back: req.body.due_back,
//       _id: req.params.id,
//     });

//     if (!errors.isEmpty()) {
//       // There are errors so render the form again, passing sanitized values and errors.
//       Book.find({}, "title").exec(function (err, books) {
//         if (err) {
//           return next(err);
//         }
//         // Successful, so render.
//         res.render("bookinstance_form", {
//           title: "Update BookInstance",
//           book_list: books,
//           selected_book: bookinstance.book._id,
//           errors: errors.array(),
//           bookinstance: bookinstance,
//         });
//       });
//       return;
//     } else {
//       // Data from form is valid.
//       BookInstance.findByIdAndUpdate(
//         req.params.id,
//         bookinstance,
//         {},
//         function (err, thebookinstance) {
//           if (err) {
//             return next(err);
//           }
//           // Successful - redirect to detail page.
//           res.redirect(thebookinstance.url);
//         }
//       );
//     }
//   },
// ];