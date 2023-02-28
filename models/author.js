const mongoose = require('mongoose');
const luxon = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function() {
  if (this.first_name && this.family_name) {
    return this.first_name + " " + this.family_name;
  }
  return "";
})

AuthorSchema.virtual("url").get(function() {
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual("date_of_birth_formatted").get(function() {
  return this.date_of_birth ?
    luxon.DateTime.fromJSDate(this.date_of_birth).toLocaleString() : "";
});

AuthorSchema.virtual("date_of_death_formatted").get(function() {
  return this.date_of_death ?
    luxon.DateTime.fromJSDate(this.date_of_death).toLocaleString() : "";
});

module.exports = mongoose.model("Author", AuthorSchema);