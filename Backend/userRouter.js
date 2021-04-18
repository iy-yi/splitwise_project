const express = require('express');
// password encryption
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRound = 10;
const multer = require('multer');
const { User } = require('./db_models');
const { secret } = require('./Utils/config');
const { auth } = require('./Utils/passport');
const { checkAuth } = require('./Utils/passport');

const userRouter = express.Router();

auth();

userRouter.post('/signup', (req, res) => {
  req.body.avatar = '/default.jpg';
  req.body.currency = 'USD';
  req.body.language = 'English';
  req.body.timezone = 'US/Pacific';
  // console.log(req.body);

  User.findOne({ email: req.body.email }, (error, existUser) => {
    if (error) {
      res.status(500).end(error);
    }
    if (existUser) {
      console.log(existUser);
      res.status(400).send({ error: 'USER_EXISTS' });
    } else {
      (async () => {
        try {
          const salt = await bcrypt.genSalt(saltRound);
          req.body.password = await bcrypt.hash(req.body.password, salt);
          const newUser = new User(req.body);
          newUser.save()
            .then((savedUser) => {
              // console.log(savedUser);
              res.cookie('id', savedUser._id.toString(), { maxAge: 86400000, httpOnly: false, path: '/' });
              res.cookie('user', savedUser.email, { maxAge: 86400000, httpOnly: false, path: '/' });
              // res.cookie('name', savedUser.name, { maxAge: 86400000, httpOnly: false, path: '/' });
              // res.cookie('currency', savedUser.currency, { maxAge: 86400000, httpOnly: false, path: '/' });
              // res.cookie('timezone', savedUser.timezone, { maxAge: 86400000, httpOnly: false, path: '/' });

              const payload = { _id: savedUser._id, name: savedUser.name };
              const token = jwt.sign(payload, secret, { expiresIn: 86400000 }); // 100800 30 min
              const data = { savedUser, token: `JWT ${token}` };
              res.status(200).end(JSON.stringify(data));
            });
        } catch (err) {
          res.status(500).end(JSON.stringify(err));
        }
      })();
    }
  });
});

userRouter.post('/login', (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res.status(401).send({ error: 'WRONG_EMAIL' });
      } else {
        bcrypt.compare(req.body.password, user.password, (err, match) => {
          // console.log(match);
          if (match) {
            res.cookie('id', user._id.toString(), { maxAge: 86400000, httpOnly: false, path: '/' });
            res.cookie('user', user.email, { maxAge: 86400000, httpOnly: false, path: '/' });

            const payload = { _id: user._id, name: user.name };
            const token = jwt.sign(payload, secret, { expiresIn: 86400000 }); // 100800 30 min
            const data = { user, token: `JWT ${token}` };
            // console.log(user);
            // res.status(200).end(`JWT${token}`);
            res.status(200).end(JSON.stringify(data));
            // res.status(200).send(data);
          } else if (!match) {
            res.status(401).send({ error: 'WRONG_PASSWORD' });
          }
          if (err) {
            throw new Error('BRCYPT_ERROR');
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

// userRouter.get('/profile/:id', (req, res) => {
//   const { id } = req.params;
//   User.findById(id)
//     .then((user) => {
//       console.log(id);
//       console.log(user);
//       if (user) {
//         res.status(200).send(user);
//       } else {
//         res.status(400).end();
//       }
//     })
//     .catch((e) => {
//       console.log(e);
//       res.status(400).end();
//     });
// });

// upload avatar image
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, '../Frontend/public/images'); // save impages to frontend
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage }).single('file');

userRouter.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).send(req.file.filename);
  });
});

userRouter.post('/update', checkAuth, (req, res) => {
  // console.log(req.body);
  User.findOneAndUpdate({ _id: req.body.id }, req.body, { returnOriginal: false })
    .then((user) => {
      console.log('saved');
      // console.log(user);
      res.cookie('currency', req.body.currency, { maxAge: 86400000, httpOnly: false, path: '/' });
      res.cookie('timezone', req.body.timezone, { maxAge: 86400000, httpOnly: false, path: '/' });
      res.status(200).end(JSON.stringify(user));
    })
    .catch((e) => {
      res.status(400).end(JSON.stringify(e));
    });
});

module.exports = userRouter;
