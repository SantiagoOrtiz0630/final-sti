const express = require('express');

//firebase
var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyDVOFF5kzklQI9scNRUMHxa1Rue1Wu4Its",
    authDomain: "finalsti-8d933.firebaseapp.com",
    databaseURL: "https://finalsti-8d933.firebaseio.com",
    projectId: "finalsti-8d933",
    storageBucket: "finalsti-8d933.appspot.com",
    messagingSenderId: "112296393653"
};
firebase.initializeApp(config);

//firebase


//var
const path = require('path');
const hbs = require('express-handlebars');

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));
//var

//render app
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layout/'
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//render app


//var user
let db = firebase.database();
let auth = firebase.auth();
//var user

//
actualProfile = {
    name: "",
    cc: "",
    img: "",
    Regueton: "",
    Rock: "",
    Electronica: "",
    Metal: "",
    Rap: "",
    Pop: "",
    id: ""
};

let actualDB = {};

//

let arraySong = [];

let refSong = db.ref("songs");

refSong.once("value", function (data) {
    data.forEach(function (snap) {
        arraySong.push(snap.val());
    });
});

//rutas
app.get('/', (req, res) => {
    res.render('landing', {
        title: ''
    });
});

app.get('/home', (req, res) => {

    if (actualProfile.name != "") {
        res.render('home', {
            profile: actualProfile
        });
    } else {
        res.redirect('/select');
    }
});

app.get('/recomended', (req, res) => {

    if(actualProfile.id >= 73){
        res.redirect('/home');
        return;
    }

    var ref = db.ref("db");
    //
    ref.once("value", function (snapshot) {
        let arrayPerson = [];

        snapshot.forEach(function (data) {

            //s general
            let s = similitudUnicaTotal(actualDB, data.val());

            let user = {
                name: data.val().name,
                img: data.val().img,
                id: data.val().id,
                afi: s
            };

            arrayPerson.push(user);
        });

        //ordenar por afinidad
        arrayPerson.sort(compareAfinity);

        let i = 0;
        let iMax = 8;

        let arraySort = [];

        for (let index = 0; index < iMax; index++) {
            const element = arrayPerson[index];
            arraySort.push(element);
        }

        if (actualProfile.name != "") {
            res.render('recomended', {
                profile: actualProfile,
                people: arraySort
            });
        } else {
            res.redirect('/select');
        }
        //
    }, function (errorObject) {
        res.redirect('/home');
        console.log("The read failed: " + errorObject.code);
    });
    //
});

app.get('/feed', (req, res) => {

    let filterTemp = req.query.filter;

    var ref = db.ref("users");
    //
    ref.once("value", function (snapshot) {
        let arrayPerson = [];

        snapshot.forEach(function (data) {

            //s general
            let s = similitud(actualProfile, data.val());

            let temp = {
                name: data.val().name,
                cc: data.val().cc,
                img: data.val().img,
                Regueton: data.val().Regueton,
                Rock: data.val().Rock,
                Electronica: data.val().Electronica,
                Metal: data.val().Metal,
                Rap: data.val().Rap,
                Pop: data.val().Pop,
                id: data.val().id,
                afi: s
            }
            arrayPerson.push(temp);
        });

        //ordenar por afinidad
        arrayPerson.sort(compareAfinity);

        let i = 0;
        let iMax = 8;

        let arraySort = [];

        for (let index = 0; index < iMax; index++) {
            const element = arrayPerson[index];
            arraySort.push(element);
        }

        //filtrar genero
        let arraySongTemp = [];

        if (filterTemp == "General") {
            arraySongTemp = arraySong;
        } else {
            arraySongTemp = arraySong.filter(song => song.genero == filterTemp);
        }

        if (actualProfile.name != "") {
            res.render('feed', {
                profile: actualProfile,
                people: arraySort,
                songs: arraySongTemp
            });
        } else {
            res.redirect('/select');
        }
        //
    }, function (errorObject) {
        res.redirect('/home');
        console.log("The read failed: " + errorObject.code);
    });
    //
});

app.get('/song', (req, res) => {
    let id = parseInt(req.query.id);

    let songTemp = arraySong.filter(song => song.id == id)[0];

    let arraySongsTemp = arraySong.filter(song => song.genero == songTemp.genero);

    var ref = db.ref("users");
    //
    ref.once("value", function (snapshot) {
        let arrayPerson = [];

        snapshot.forEach(function (data) {

            //afinidad general
            let s = similitudUnica(actualProfile, data.val(), songTemp.genero);

            let temp = {
                name: data.val().name,
                cc: data.val().cc,
                img: data.val().img,
                Regueton: data.val().Regueton,
                Rock: data.val().Rock,
                Electronica: data.val().Electronica,
                Metal: data.val().Metal,
                Rap: data.val().Rap,
                Pop: data.val().Pop,
                id: data.val().id,
                afi: s
            }
            arrayPerson.push(temp);
        });

        //ordenar por afinidad
        arrayPerson.sort(compareAfinity);

        let i = 0;
        let iMax = 8;

        let arraySort = [];

        for (let index = 0; index < iMax; index++) {
            const element = arrayPerson[index];
            arraySort.push(element);
        }

        if (actualProfile.name != "") {
            res.render('song', {
                profile: actualProfile,
                song: songTemp,
                songs: arraySongsTemp,
                people: arraySort
            });
        } else {
            res.redirect('/select');
        }
    });
});

app.get('/select', (req, res) => {

    var ref = db.ref("users");

    // Attach an asynchronous callback to read the data at our posts reference
    ref.once("value", function (snapshot) {
        res.render('select', {
            users: snapshot.val()
        });
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        res.redirect('/error');
    });
});

app.get('/register', (req, res) => {

    var ref = db.ref("generos");

    db.ref("users").once("value", function (usersSnap) {

        // Attach an asynchronous callback to read the data at our posts reference
        ref.on("value", function (snapshot) {
            res.render('register', {
                generos: snapshot.val(),
                tam: usersSnap.numChildren()
            });
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
});

app.post('/select', (req, res) => {

    actualProfile = {
        name: "",
        cc: "",
        img: "",
        Regueton: "",
        Rock: "",
        Electronica: "",
        Metal: "",
        Rap: "",
        Pop: "",
        id: ""
    };

    //selected
    let nombre = req.body.name;
    let cedula = req.body.cc;

    let urlImg = req.body.img;

    let Regueton = req.body.Regueton;
    let Rock = req.body.Rock;
    let Electronica = req.body.Electronica;
    let Metal = req.body.Metal;
    let Rap = req.body.Rap;
    let Pop = req.body.Pop;
    let id = req.body.id;

    actualProfile = {
        name: nombre,
        cc: cedula,
        img: urlImg,
        Regueton: Regueton,
        Rock: Rock,
        Electronica: Electronica,
        Metal: Metal,
        Rap: Rap,
        Pop: Pop,
        id: id
    };

    console.log("Seleccionado: " + actualProfile.name);

    let refDB = db.ref("db");

    refDB.once("value", function (data) {
        data.forEach(function (snap) {
            if (actualProfile.id == snap.val().id) {
                actualDB = snap.val();

                console.log("DB update");
            }
        });
    });

    res.redirect('/home');
});

app.post('/register', (req, res) => {

    let tam = req.body.tam;

    actualProfile = {
        name: "",
        cc: "",
        img: "",
        Regueton: "",
        Rock: "",
        Electronica: "",
        Metal: "",
        Rap: "",
        Pop: "",
        id: ""
    };

    //selected
    let nombre = req.body.name;
    let cedula = req.body.cc;

    let urlImg = "profile";

    let Regueton = req.body.Regueton;
    let Rock = req.body.Rock;
    let Electronica = req.body.Electronica;
    let Metal = req.body.Metal;
    let Rap = req.body.Rap;
    let Pop = req.body.Pop;

    let id = req.body.tam;

    let tempProfile = {
        name: nombre,
        cc: cedula,
        img: urlImg,
        Regueton: Regueton,
        Rock: Rock,
        Electronica: Electronica,
        Metal: Metal,
        Rap: Rap,
        Pop: Pop,
        id: id
    };

    db.ref("users").child(tam).set(tempProfile, function (error) {
        if (error) {
            alert("No se pudo registrar" + tempProfile.name + " : " + error);
            res.redirect('/registro');
        } else {
            console.log("Registrado: " + tempProfile.name);
        }
    });

    actualProfile = {
        name: nombre,
        cc: cedula,
        img: urlImg,
        Regueton: Regueton,
        Rock: Rock,
        Electronica: Electronica,
        Metal: Metal,
        Rap: Rap,
        Pop: Pop,
        id: id
    };

    let refDB = db.ref("db");

    refDB.once("value", function (data) {
        data.forEach(function (snap) {
            if (actualProfile.id == snap.val().id) {
                actualDB = snap.val();
                console.log("DB update");
            }
        });
    });
                
    res.redirect('/home');
});

app.post('/logOut', (req, res) => {

    actualProfile = {
        name: "",
        cc: "",
        img: "",
        Regueton: "",
        Rock: "",
        Electronica: "",
        Metal: "",
        Rap: "",
        Pop: "",
        id: ""
    };

    res.redirect('/');
});

app.get('/*', (req, res) => {
    res.render('error', {
        title: 'Pagina no encontrada'
    });
});

app.listen(3000, function () {
    console.log("Servidor iniciado")
});
//rutas

function compareAfinity(a, b) {
    return b.afi - a.afi;
}

function similitud(actual, other) {
    let s;

    let valGeneros = Object.keys(actual);

    var n = valGeneros.indexOf("name");
    valGeneros.splice(n, 1);
    var c = valGeneros.indexOf("cc");
    valGeneros.splice(c, 1);
    var i = valGeneros.indexOf("id");
    valGeneros.splice(i, 1);
    var img = valGeneros.indexOf("img");
    valGeneros.splice(img, 1);

    let suma = 0;

    for (let index = 0; index < valGeneros.length; index++) {
        let indice = valGeneros[index];

        let val1 = actual[indice];
        let val2 = other[indice];

        var dif = val1 - val2;

        suma += (dif * dif);
    }

    s = Math.sqrt(suma);

    var sNew = 1 / (1 + s);

    if (actual.id == other.id) {
        sNew = -1;
    }

    return sNew;
}

function similitudUnica(actual, other, index) {
    let s;

    let valGeneros = Object.keys(actual);

    var n = valGeneros.indexOf("name");
    valGeneros.splice(n, 1);
    var c = valGeneros.indexOf("cc");
    valGeneros.splice(c, 1);
    var i = valGeneros.indexOf("id");
    valGeneros.splice(i, 1);
    var img = valGeneros.indexOf("img");
    valGeneros.splice(img, 1);

    let suma = 0;

    let val1 = actual[index];
    let val2 = other[index];

    var dif = val1 - val2;

    suma += (dif * dif);

    s = Math.sqrt(suma);

    var sNew = 1 / (1 + s);

    if (actual.id == other.id) {
        sNew = -1;
    }

    return sNew;
}

function similitudUnicaTotal(actual, other) {
    let s;

    let valGeneros = Object.keys(other);

    var n = valGeneros.indexOf("name");
    valGeneros.splice(n, 1);
    var c = valGeneros.indexOf("cc");
    valGeneros.splice(c, 1);
    var i = valGeneros.indexOf("id");
    valGeneros.splice(i, 1);
    var img = valGeneros.indexOf("img");
    valGeneros.splice(img, 1);

    let suma = 0;

    for (let index = 0; index < valGeneros.length; index++) {
        let indice = valGeneros[index];

        let val1 = actual[indice];
        let val2 = other[indice];

        var dif = val1 - val2;

        suma += (dif * dif);
    }

    s = Math.sqrt(suma);

    var sNew = 1 / (1 + s);

    if (actual.id == other.id) {
        sNew = -1;
    }

    return sNew;
}