/*eslint max-len: ["error", { "code": 200 }]*/
var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

router.post("/",
    (req, res) => changePassword(req, res));

async function changePassword(req, res) {
    let id = req.body.id;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    let where = `id = "${id}"`;

    let person = await db.fetchAllWhere("person", where);

    if (!person.length > 0) {
         return res.json({ err: "Personen hittades inte." });
    }

    let personData = person[0];
    let hash = personData.password;

    bcrypt.compare(oldPassword, hash, function(err, match) {
        if (err) {
            return res.json({
                err: err
            });
        }

        if (match) {
            bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
                if (err) {
                    return res.json({
                        err: err
                    });
                }

                res.json(
                    await db.update("person", { password: hash }, where)
                );
            });
        } else {
            res.json({ err: "Gammal lösnord ogiltid!" });
        }
    });
};

module.exports = router;
