const User = require('../model/User');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res.status(400).json({
      message: 'Username and pwd are required!.',
    });

  //check for duplidate usernames
  const duplidate = await User.findOne({ username: user }).exec();
  if (duplidate) {
    return res.sendStatus(409);
  }
  try {
    //encrypt the pwd
    const hashedPwd = await bcrypt.hash(pwd, 10);

    //create and store new user
    const result = await User.create({
      username: user,
      password: hashedPwd,
    });

    console.log(result);

    res.status(201).json({
      success: `New user ${user} created!`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  handleNewUser,
};
