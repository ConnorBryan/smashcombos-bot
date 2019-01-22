module.exports = {
  getUsername: user => user.user_metadata.username || user.id
};
