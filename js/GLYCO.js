//****************************************************************************************
// GLYCOdraw    Copyright 2020 | Roland Josuran
//****************************************************************************************
var GLYCO = GLYCO || {
    sacSize: 28,
    fontSize: 14,
    idCount: 0,
    sacEnum: Object.freeze({
        redEnd: Object.freeze({ redEnd: 00}),
        Hex: Object.freeze({ Glc: 11, Man: 12, Gal: 13, Gul: 14, Alt: 15, All: 16, Tal: 17, Ido: 18 }),
        HexNAc: Object.freeze({ GlcNAc: 21, ManNAc: 22, GalNAc: 23, GulNAc: 24, AltNAc: 25, AllNAc: 26, TalNAc: 27, IdoNAc: 28 }),
        HexN: Object.freeze({ GlcN: 31, ManN: 32, GalN: 33, GulN: 34, AltN: 35, AllN: 36, TalN: 37, IdoN: 38 }),
        HexA: Object.freeze({ GlcA: 41, ManA: 42, GalA: 43, GulA: 44, AltA: 45, AllA: 46, TalA: 47, IdoA: 48 }),
        dHex: Object.freeze({ Qui: 51, Rha: 52, dGal: 53, dGul: 54, dAlt: 55, dAll: 56, dTal: 57, dIdo: 58, Fuc: 59 }),
        dHexNAc: Object.freeze({ QuiNAc: 61, RhaNAc: 62, dGalNAc: 63, dGulNAc: 64, dAltNAc: 65, dAllNAc: 66, dTalNAc: 67, dIdoNAc: 68, FucNAc: 69 }),
        ddHex: Object.freeze({Oli: 71, Tyv: 72, Abe: 74, Par: 75, Dig: 76, Col: 77 }),
        Pent: Object.freeze({ Ara: 82, Lyx: 83, Xyl: 84, Rib: 85 }),
        Sia: Object.freeze({ Kdn: 92, Neu5Ac: 96, Neu5Gc: 97, Neu: 98, Sia: 99 })
    }),
    typeEnum: Object.freeze({
        redEnd: 0,
        Hex: 1,
        HexNAc: 2,
        HexN: 3,
        HexA: 4,
        dHex: 5,
        dHexNAc: 6,
        ddHex: 7,
        Pent: 8,
        Sia: 9
    }),
    sym: Object.freeze(
        [
            ["redEnd"],
            ["Hex", "Glc", "Man", "Gal", "Gul", "Alt", "All", "Tal", "Ido", ""],
            ["HexNAc", "GlcNAc", "ManNAc", "GalNAc", "GulNAc", "AltNAc", "AllNAc", "TalNAc", "IdoNAc", ""],
            ["HexN", "GlcN", "ManN", "GalN", "GulN", "AltN", "AllN", "TalN", "IdoN", ""],
            ["HexA", "GlcA", "ManA", "GalA", "GulA", "AltA", "AllA", "TalA", "IdoA", ""],
            ["dHex","Qui", "Rha", "", "dGul", "dAlt", "", "dTal", "", "Fuc"],
            ["dHexNAc", "QuiNAc", "RhaNAc", "", "", "dAltNAc", "", "dTalNAc", "", "FucNAc"],
            ["ddHex", "Oli", "Tyv", "", "Abe", "Par", "Dig", "Col", "", ""],
            ["Pent", "", "Ara", "Lyx", "Xyl", "Rib", "", "", "", ""],
            ["Sia", "", "Kdn", "", "", "", "Neu5Ac", "Neu5Gc", "Neu", "Sia"],
            [
                "#FFFFFF",  // white https://www.ncbi.nlm.nih.gov/glycans/snfg.html
                "#0072BC",  // blue
                "#00A651",  // green
                "#FFD400",  // yellow
                "#F47920",  // orange
                "#F69EA1",  // altrose
                "#A54399",  // purple
                "#8FCCE9",  // light blue
                "#A17A4D",  // brown
                "#ED1C24"   // red
            ]
        ]),
    getType: function (sacEnum) {
        return this.sym[~~((sacEnum / 10) % 10)][0];
    },
    getSym: function (sacEnum) {
        return this.sym[~~((sacEnum / 10) % 10)][~~(sacEnum % 10)];
    },
    getColor: function (sacEnum) {
        return this.sym[10][~~(sacEnum % 10)];
    }
};

///**
// * Monosaccharide type enum
// **/
//GLYCO.prototype.sacEnum = Object.freeze({
//    Hex: Object.freeze({ Glc: 11, Man: 12, Gal: 13, Gul: 14, Alt: 15, All: 16, Tal: 17, Ido: 18 }),
//    HexNAc: Object.freeze({ GlcNAc: 21, ManNAc: 22, GalNAc: 23, GulNAc: 24, AltNAc: 25, AllNAc: 26, TalNAc: 27, IdoNAc: 28 }),
//    HexN: Object.freeze({ GlcN: 31, ManN: 32, GalN: 33, GulN: 34, AltN: 35, AllN: 36, TalN: 37, IdoN: 38 }),
//    HexA: Object.freeze({ GlcA: 41, ManA: 42, GalA: 43, GulA: 44, AltA: 45, AllA: 46, TalA: 47, IdoA: 48 }),
//    dHex: Object.freeze({ Qui: 51, Rha: 52, dGal: 53, dGul: 54, dAlt: 55, dAll: 56, dTal: 57, dIdo: 58, Fuc: 59 }),
//    dHexNAc: Object.freeze({ QuiNAc: 61, RhaNAc: 62, dGalNAc: 63, dGulNAc: 64, dAltNAc: 65, dAllNAc: 66, dTalNAc: 67, dIdoNAc: 68, FucNAc: 69 }),
//    ddHex: 70,
//    Pent: Object.freeze({ Ara: 82, Lyx: 83, Xyl: 84, Rib: 85 }),
//    Sia: Object.freeze({ Kdn: 92, Neu5Ac: 96, Neu5Gc: 97, Neu: 98, Sia: 99 })
//});

///**
// * Monosaccharide symbol array
// * */
//GLYCO.prototype.sym = []; 
