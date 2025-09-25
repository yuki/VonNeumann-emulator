/*
 *		Pedro Gutiérrez
 *		[info@xitrus.es]
 */



function $(id) { return (document.getElementById(id)); }

function _t(id) { return (document.getElementById(id).textContent); }

function _c(id) { return parseInt(document.getElementById(id).textContent, 2); }

// Tabla de memoria
var TM,
    TMT = [];
TMT[0] = {
    tag: '5 + 11 = 16',
    table: [
        ['00000100'],
        ['00000101'],
        ['01100111'],
        ['01110000'],
        ['00000101'],
        ['00001011'],
        ['00000000'],
        ['00000000']
    ]
};
TMT[1] = {
    tag: '(1 + 1) ^ 5 = 32',
    table: [
        ['00000101'],
        ['00000101'],
        ['00110110'],
        ['01100111'],
        ['01110000'],
        ['00000001'],
        ['00000101'],
        ['00000000']
    ]
};
TMT[2] = {
    tag: '01001011 OR 01010101 = 01011111',
    table: [
        ['00000100'],
        ['01010101'],
        ['01100111'],
        ['01110000'],
        ['01001011'],
        ['01010101'],
        ['00000000'],
        ['00000000']
    ]
};
TMT[3] = {
    tag: '01001011 AND 01010101 = 01000001',
    table: [
        ['00000100'],
        ['01000101'],
        ['01100111'],
        ['01110000'],
        ['01001011'],
        ['01010101'],
        ['00000000'],
        ['00000000']
    ]
};
TMT[4] = {
    tag: '255 + 1 = OVERFLOW',
    table: [
        ['00000100'],
        ['00000101'],
        ['01100111'],
        ['01110000'],
        ['11111111'],
        ['00000001'],
        ['00000000'],
        ['00000000']
    ]
};
TMT[5] = {
    tag: '((2 ^ 2) + 2) ^ 2 = 36',
    table: [
        ['00000110'],
        ['00110110'],
        ['00000110'],
        ['00110110'],
        ['01100111'],
        ['01110000'],
        ['00000010'],
        ['00000000']
    ]
};
TMT[6] = {
    tag: '(8 - 3) ^ 3 = 125',
    table: [
        ['00000101'],
        ['00010110'],
        ['00110110'],
        ['01100111'],
        ['01110000'],
        ['00001000'],
        ['00000011'],
        ['00000000']
    ]
};

// Lineas de la representación visibles (inicialmente todas)
var WIRES = [
    "CPro-RDir", "CProInc", "RDir-TD0", "RDir-TD1", "RDir-TD2",
    "RDir-TD3", "RDir-TD4", "RDir-TD5", "RDir-TD6", "RDir-TD7",
    "RDat-TD0", "RDat-TD1", "RDat-TD2", "RDat-TD3", "RDat-TD4",
    "RDat-TD5", "RDat-TD6", "RDat-TD7", "TD-RDat0", "TD-RDat1",
    "TD-RDat2", "TD-RDat3", "TD-RDat4", "TD-RDat5", "TD-RDat6",
    "TD-RDat7", "ALU-Acum", "Acum-RDat", "RDat-RIns", "RDat-REnt",
    "RIns-RDir", "RIns-Deco",
];
var RECORDS = ["RIns", "CPro", "Deco", "REnt", "Acum", "RDir", "RDat"];

/*
 *	Instrucciones
 *
 *	0000  =>  Suma
 *	0001  =>  Resta
 *	0010  =>  Multiplicación
 *  0011  =>  Exponente
 *	0100  =>  Operación AND
 *	0101  =>  Operación OR
 *	0110  =>  Resultado a memoria
 *	0111  =>  Parar la ejecución
 *
 *	Nota: no admite negativo
 */
var ACTUAL = {};

var INSTRUCTIONS = [],
    SPECIALS = ['0110', '0111'];

// Función inicial (conseguir orden + funciçon aritmética/lógica)
INSTRUCTIONS['init'] = [];
INSTRUCTIONS['init'][01] =
    function () { showWire('CPro-RDir'); changeContent('CPro', 'RDir'); };
INSTRUCTIONS['init'][02] =
    function () { showWire('CProInc'); changeSpecialContent('CPro', countIncrement()); };
INSTRUCTIONS['init'][03] =
    function () { showWire('RDir-TD' + _c('RDir')); };
INSTRUCTIONS['init'][04] =
    function () { showWire('TD-RDat' + _c('RDir')); changeContent('TD' + _c('RDir'), 'RDat'); };
INSTRUCTIONS['init'][05] =
    function () { showWire('RDat-RIns'); changeContent('RDat', 'RIns'); };
INSTRUCTIONS['init'][06] =
    function () { showWire('RIns-Deco'); changeDecoder(_t('RIns').substr(0, 4)); };
INSTRUCTIONS['init'][07] =
    function () {
        if (SPECIALS.indexOf(ACTUAL.ALU) != -1) {
            ACTUAL.step = 0;
            ACTUAL.inst = ACTUAL.ALU;
            nextStep();
        } else {
            showWire('RIns-RDir');
            changeSpecialContent('RDir', _t('RIns').substr(4, 4));
        }
    };
INSTRUCTIONS['init'][08] =
    function () { showWire('RDir-TD' + _c('RDir')); };
INSTRUCTIONS['init'][09] =
    function () { showWire('TD-RDat' + _c('RDir')); changeContent('TD' + _c('RDir'), 'RDat'); };
INSTRUCTIONS['init'][10] =
    function () { showWire('RDat-REnt'); changeContent('RDat', 'REnt'); };
INSTRUCTIONS['init'][11] =
    function () { showWire('ALU-Acum'); changeSpecialContent('Acum', runALU(ACTUAL.ALU)); };
INSTRUCTIONS['init'][12] =
    function () { init(); };

// Pasos de pasar acumulador a memoria
INSTRUCTIONS['0110'] = [];
INSTRUCTIONS['0110'][01] =
    function () { showWire('RIns-RDir'); changeSpecialContent('RDir', _t('RIns').substr(4, 4)); };
INSTRUCTIONS['0110'][02] =
    function () { showWire('RDir-TD' + _c('RDir')); };
INSTRUCTIONS['0110'][03] =
    function () { showWire('RDir-TD' + _c('RDir')); showWire('Acum-RDat'); changeContent('Acum', 'RDat'); };
INSTRUCTIONS['0110'][04] =
    function () { showWire('RDat-TD' + _c('RDir')); showWire('RDir-TD' + _c('RDir')); TM[_c('RDir')] = _t('RDat'); setMemoryTable(); };
INSTRUCTIONS['0110'][05] =
    function () { init(); };

// Pasos de parar la ejecución
INSTRUCTIONS['0111'] = [];
INSTRUCTIONS['0111'][01] =
    function () { changeSpecialContent('CPro', '1111'); nextDoc(); ACTUAL.inst = 'finished'; };

// Instrucciones de la ALU
// Nota: la entrada tiene que ser decimal

var ALU = [];
ALU['0000'] =
    function (a, b) { return a + b; };
ALU['0001'] =
    function (a, b) { return a - b; };
ALU['0010'] =
    function (a, b) { return a * b; };
ALU['0011'] =
    function (a, b) { return Math.pow(a, b); };
ALU['0100'] =
    function (a, b) { return a & b; };
ALU['0101'] =
    function (a, b) { return a | b; };

// Signo decodificador
var DECODER = [];
DECODER['0000'] = '+';
DECODER['0001'] = '-';
DECODER['0010'] = '*';
DECODER['0011'] = '^';
DECODER['0100'] = '&';
DECODER['0101'] = '|';
DECODER['0110'] = 'M';
DECODER['0111'] = '…';

// Comnentario de la instrucción
var INFOINST = []
INFOINST['0000'] = 'Suma           ';
INFOINST['0001'] = 'Resta          ';
INFOINST['0010'] = 'Producto       ';
INFOINST['0011'] = 'Exponente      ';
INFOINST['0100'] = 'Operador AND   ';
INFOINST['0101'] = 'Operador OR    ';
INFOINST['0110'] = 'Mover a memoria';
INFOINST['0111'] = 'Finalizar      ';

// Comentarios de la ejecución
var DOC = [];
DOC['init'] = [];
DOC['init'][01] = "La *Unidad de control* envía una micro-orden para transferir el contenido del *Contador de programa* al *Registro de direcciones*.";
DOC['init'][02] = "El *Contador de programa* aumenta en uno, por lo que su contenido será la dirección de la próxima instrucción a ejecutar. ";
DOC['init'][03] = "Se selecciona la posición de memoria que indica el *Registro de direcciones* y se realiza una lectura en la memoria.";
DOC['init'][04] = "Se deposita en el *Registro de datos* la instrucción a ejecutar.";
DOC['init'][05] = "Se realiza el traslado de la información contenida en el *Registro de datos* al *Registro de instrucciones*, donde se almacenará.";
DOC['init'][06] = "El *Decodificador* procede a la interpretación de la instrucción que serán los 4 primeros bits, es decir, interpreta el código de operación.";
DOC['init'][07] = "El *Registro de instrucciones* envía los 4 últimos bits al *Registro de direcciones*.";
DOC['init'][08] = "El *Registro de direcciones* busca en la memoria la celda correspondiente y procede a la lectura del dato.";
DOC['init'][09] = "La información es enviada al *Registro de datos*.";
DOC['init'][10] = "El *Registro de datos* envía la información al *Registro de entrada*.";
DOC['init'][11] = "El *Circuito operacional* realiza la operación con el *Registro acumulador* y el *Registro de entrada* y lo almacena de nuevo en el *Registro acumulador*.";
DOC['0110'] = [];
DOC['0110'][01] = "El *Registro de instrucciones* envía los 4 últimos bits al *Registro de direcciones*.";
DOC['0110'][02] = "El *Registro de direcciones* busca en la memoria la celda en la que será almacenada el resultado.";
DOC['0110'][03] = "El *Registro acumulador* envía la información al *Registro de datos*.";
DOC['0110'][04] = "El *Registro de datos* procede a la escritura de la información en la celda seleccionada por el *Registro de Direcciones*.";
DOC['0111'] = [];
DOC['0111'][01] = "El *Decodificador* intepreta que se finaliza el programa y se para la ejecución.";

// Créditos
var ABOUT =
    '<span><a target="_blank" href="http://xitrus.es">Pedro Gutiérrez</a></span>: ' +
    'diseño y desarrollo del simulador' + '<br>' +
    '<span>Noemi Navarro</span>: ' +
    'documentación de la ejecución'

///////////////////////////////////////////////////////////////////////////////////////////////////

//addEventListener('load',programSelector,false);


function programSelector() {
    var o = $('full_code'),
        r = '';
    // Info. instrucciones
    r += "    Información de instrucciones\n";
    r += "+--------+-----+-------------------+\n";
    r += "|  Inst  |  D  |  Comentario       |\n";
    r += "+--------+-----+-------------------+\n";
    for (var i in DECODER)
        r += '|  ' + i + '  |  ' + DECODER[i] + '  |  ' + INFOINST[i] + '  |\n';
    r += "+--------+-----+-------------------+\n\n";
    // Programas precargados
    r += "       Programas precargados:\n";
    r += "------------------------------------\n";
    for (var i = 0; i < TMT.length; i++)
        r += '&nbsp;<label for="TMT' + i + '">' +
            '<input id="TMT' + i + '" ' + (i == 0 ? 'checked' : '') + ' type="radio" name="TMT" value="' + i + '">' +
            '<span class="c2">-</span><span class="c3">+</span>&nbsp;' +
            TMT[i].tag.replace(/([0-9]+|OVERFLOW)/g, '<span class="c1">$1</span>') + '</label><br>';
    r += "------------------------------------\n";
    r += "              <span class='c2 pointer' id='run'>Ejecutar</span>\n";
    o.innerHTML = r;
    $('run').addEventListener('click', runProgram, false);
};

function runProgram() {
    var tmtNumber =
        function () {
            for (var i = 0; i < TMT.length; i++)
                if ($('TMT' + i).checked) return $('TMT' + i).value;
        };
    TM = TMT[tmtNumber()].table;
    init(true);
    $('full').style.display = 'none';
    $('info_b_r').addEventListener('click',
        function () { $('full').style.display = ''; }, false);
    $('info_b_a').addEventListener('click', about, false);
    $('info_b_c').addEventListener('click', hideDoc, false);
    $('info_b_n').addEventListener('click', buttonNextStep, false);
    addEventListener('keypress', keyPress, false);
    resetRecords();
};

function init(next) {
    ACTUAL = {
        inst: 'init',
        step: 0,
        ALU: '1111'
    };
    hideWires();
    setMemoryTable();
    if (!next) nextStep();
};

function hideWires() {
    while (WIRES.length != 0)
        $(WIRES.pop()).style.display = 'none';
};

function resetRecords() {
    RECORDS.map(
        function (r) {
            $(r).textContent = $(r).textContent.replace(/[1]/g, '0');
        })
}

function setMemoryTable() {
    for (var i = 0; i < TM.length; i++)
        $('TD' + i).textContent = TM[i]
};

function showWire(name) {
    WIRES.push(name);
    $(name).style.display = 'block';
};

function changeContent(from, to) {
    $(to).textContent = $(from).textContent;
};

function changeSpecialContent(to, content) {
    $(to).textContent = content;
};

function changeDecoder(type) {
    ACTUAL.ALU = type;
    $('Deco').textContent = DECODER[type];
};

function countIncrement() {
    var c = $('CPro').textContent;
    c = parseInt(c, 2);
    c++;
    return checkLength(c, 4);
};

function checkLength(n, len) {
    var n = n.toString(2),
        r = n;
    if (n < 0) return 'OVERFLOW';
    while (r.length < len)
        r = '0' + r;
    return r.length == len ? r : 'OVERFLOW';
};

function runALU(type) {
    var r = (ALU[type])(
        _c('Acum'),
        _c('REnt')
    );
    return checkLength(r, 8);
};

function nextStep() {
    if (ACTUAL.inst == 'finished') return false;
    hideWires();
    ACTUAL.step++;
    (INSTRUCTIONS[ACTUAL.inst][ACTUAL.step])();
    nextDoc();
};

function hideDoc() {
    this.blur();
    $('info').className = $('info').className == 'closed' ? '' : 'closed';
    this.innerHTML = $('info').className == 'closed' ? 'Abrir' : 'Cerrar';
};

function nextDoc() {
    if (ACTUAL.inst == 'finished') return false;
    if ($('info').className == 'fclosed') $('info').className = '';
    $('info_cont').innerHTML = DOC[ACTUAL.inst][ACTUAL.step].replace(/\*([^\*]+)\*/g, '<span>$1</span>');
};

function keyPress(e) {
    var nextKeys = [13, 32];
    if (nextKeys.indexOf(e.charCode) != -1) nextStep();
};

function buttonNextStep() {
    this.blur();
    nextStep();
};

function about() {
    this.blur();
    $('info').className = '';
    $('info_b_c').innerHTML = $('info').className == 'closed' ? 'Abrir' : 'Cerrar';
    $('info_cont').innerHTML = ABOUT;
};