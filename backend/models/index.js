// const User = require('./User');
// const Entry = require('./Entry');
// const Comment = require('./Comment');
// const Like = require('./Like');
// const Workout = require('./Workout');

// // Relations 
// User.hasMany(Workout);
// Workout.belongsTo(User, { foreignKey: 'userId' });


// User.hasMany(Entry);
// Entry.belongsTo(User);

// User.hasMany(Comment);
// Comment.belongsTo(User);

// Entry.hasMany(Comment);
// Comment.belongsTo(Entry);

// User.belongsToMany(Entry, { through: Like, foreignKey: "userId" });
// Entry.belongsToMany(User, { through: Like, foreignKey: "entryId" });

// module.exports = { User, Entry, Comment, Like, Workout };