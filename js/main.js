/*
 *		Original code: Pedro Gutiérrez: [info@xitrus.es]
 *      Original Documentation: Noemi Navarro
 *      Modifications: Rubén Gómez [https://github.com/yuki]
 */



function $(id) { return (document.getElementById(id)); }

function _t(id) { return (document.getElementById(id).textContent); }

function _c(id) { return parseInt(document.getElementById(id).textContent, 2); }


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
 *	Instructions: 4 bits
 *	Note: negatives not allowed
 */
var ACTUAL = {};

var INSTRUCTIONS = [],
    SPECIALS = ['0110', '0111', '1000', '1001', '1010'];

// Función inicial (conseguir orden + función aritmética/lógica)
INSTRUCTIONS['init'] = [];
INSTRUCTIONS['init'][1] =
    function () { showWire('CPro-RDir'); changeContent('CPro', 'RDir'); };
INSTRUCTIONS['init'][2] =
    function () { showWire('CProInc'); changeSpecialContent('CPro', countIncrement()); };
INSTRUCTIONS['init'][3] =
    function () { showWire('RDir-TD' + _c('RDir')); };
INSTRUCTIONS['init'][4] =
    function () { showWire('TD-RDat' + _c('RDir')); changeContent('TD' + _c('RDir'), 'RDat'); };
INSTRUCTIONS['init'][5] =
    function () { showWire('RDat-RIns'); changeContent('RDat', 'RIns'); };
INSTRUCTIONS['init'][6] =
    function () { showWire('RIns-Deco'); changeDecoder(_t('RIns').substr(0, 4)); };
INSTRUCTIONS['init'][7] =
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
INSTRUCTIONS['init'][8] =
    function () { showWire('RDir-TD' + _c('RDir')); };
INSTRUCTIONS['init'][9] =
    function () { showWire('TD-RDat' + _c('RDir')); changeContent('TD' + _c('RDir'), 'RDat'); };
INSTRUCTIONS['init'][10] =
    function () { showWire('RDat-REnt'); changeContent('RDat', 'REnt'); };
INSTRUCTIONS['init'][11] =
    function () { showWire('ALU-Acum'); changeSpecialContent('Acum', runALU(ACTUAL.ALU)); };
INSTRUCTIONS['init'][12] =
    function () { init(); };

// From the acumulator to memory
INSTRUCTIONS['0110'] = [];
INSTRUCTIONS['0110'][1] =
    function () { showWire('RIns-RDir'); changeSpecialContent('RDir', _t('RIns').substr(4, 4)); };
INSTRUCTIONS['0110'][2] =
    function () { showWire('RDir-TD' + _c('RDir')); };
INSTRUCTIONS['0110'][3] =
    function () { showWire('RDir-TD' + _c('RDir')); showWire('Acum-RDat'); changeContent('Acum', 'RDat'); };
INSTRUCTIONS['0110'][4] =
    function () { showWire('RDat-TD' + _c('RDir')); showWire('RDir-TD' + _c('RDir')); TM[_c('RDir')] = _t('RDat'); setMemoryTable(); };
INSTRUCTIONS['0110'][5] =
    function () { init(); };

// Instruction to finish the program
INSTRUCTIONS['0111'] = [];
INSTRUCTIONS['0111'][1] =
    function () { changeSpecialContent('CPro', '1111'); nextDoc(); ACTUAL.inst = 'finished'; };

// Instruction NOT
INSTRUCTIONS['1000'] = [];
INSTRUCTIONS['1000'][1] = 
    function () { showWire('Acum-RDat'); changeContent('Acum', 'RDat');};
INSTRUCTIONS['1000'][2] = 
    function () { showWire('RDat-REnt'); changeContent('RDat', 'REnt'); };
INSTRUCTIONS['1000'][3] = 
    function () {  showWire('ALU-Acum'); changeSpecialContent('Acum', runALU(ACTUAL.ALU)); };
INSTRUCTIONS['1000'][4] = 
    function () { init(); };

// Instruction INC
INSTRUCTIONS['1001'] = [];
INSTRUCTIONS['1001'][1] = 
    function () { showWire('Acum-RDat'); changeContent('Acum', 'RDat');};
INSTRUCTIONS['1001'][2] = 
    function () { showWire('RDat-REnt'); changeContent('RDat', 'REnt'); };
INSTRUCTIONS['1001'][3] = 
    function () {  showWire('ALU-Acum'); changeSpecialContent('Acum', runALU(ACTUAL.ALU)); };
INSTRUCTIONS['1001'][4] = 
    function () { init(); };

// Instruction DEC
INSTRUCTIONS['1010'] = [];
INSTRUCTIONS['1010'][1] = 
    function () { showWire('Acum-RDat'); changeContent('Acum', 'RDat');};
INSTRUCTIONS['1010'][2] = 
    function () { showWire('RDat-REnt'); changeContent('RDat', 'REnt'); };
INSTRUCTIONS['1010'][3] = 
    function () {  showWire('ALU-Acum'); changeSpecialContent('Acum', runALU(ACTUAL.ALU)); };
INSTRUCTIONS['1010'][4] = 
    function () { init(); };

// ALU's instructions
// Note: the input must be decimal (before the function call to _c)
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
ALU['1000'] =
    function (a, b) { return 255-a; };
ALU['1001'] =
    function (a, b) { return a+1; };
ALU['1010'] =
    function (a, b) { return a-1; };

// Decodificator's sign
var DECODER = new Map([
    ['0000','+'],
    ['0001','-'],
    ['0010','*'],
    ['0011','^'],
    ['0100','&'],
    ['0101','|'],
    ['0110','M'],
    ['0111','…'],
    ['1000','!'],
    ['1001','I'],
    ['1010','D'],
    ['1011','L'],
    ['1100','R'],
    ['1101','X'],
    ['1110','T'],
]);

// Comnentario de la instrucción
var INFOINST = new Map([
    ['0000','Suma           '],
    ['0001','Resta          '],
    ['0010','Producto       '],
    ['0011','Exponente      '],
    ['0100','Operador AND   '],
    ['0101','Operador OR    '],
    ['0110','Mover a memoria'],
    ['0111','Finalizar      '],
    ['1000','Operador NOT   '],
    ['1001','Incrementar +1 '],
    ['1010','Decrementar -1 '],
    ['1011','ROL            '],
    ['1100','ROR            '],
    ['1101','Operador XOR   '],
    ['1110','RST acumulador '],
]);

// Comments for each step of the instructions
var DOC = [];
DOC['init'] = [];
DOC['init'][1]  = "La *Unidad de control* envía una micro-orden para transferir el contenido del *Contador de programa* al *Registro de direcciones*."
DOC['init'][2]  = "El *Contador de programa* aumenta en uno, por lo que su contenido será la dirección de la próxima instrucción a ejecutar. ";
DOC['init'][3]  = "Se selecciona la posición de memoria que indica el *Registro de direcciones* y se realiza una lectura en la memoria.";
DOC['init'][4]  = "Se deposita en el *Registro de datos* la instrucción a ejecutar.";
DOC['init'][5]  = "Se realiza el traslado de la información contenida en el *Registro de datos* al *Registro de instrucciones*, donde se almacenará.";
DOC['init'][6]  = "El *Decodificador* procede a la interpretación de la instrucción que serán los 4 primeros bits, es decir, interpreta el código de operación.";
DOC['init'][7]  = "El *Registro de instrucciones* envía los 4 últimos bits al *Registro de direcciones*.";
DOC['init'][8]  = "El *Registro de direcciones* busca en la memoria la celda correspondiente y procede a la lectura del dato.";
DOC['init'][9]  = "La información es enviada al *Registro de datos*.";
DOC['init'][10] = "El *Registro de datos* envía la información al *Registro de entrada*.";
DOC['init'][11] = "El *Circuito operacional* realiza la operación con el *Registro acumulador* y el *Registro de entrada* y lo almacena de nuevo en el *Registro acumulador*.";
DOC['0110'] = [];
DOC['0110'][1] = "El *Registro de instrucciones* envía los 4 últimos bits al *Registro de direcciones*.";
DOC['0110'][2] = "El *Registro de direcciones* busca en la memoria la celda en la que será almacenada el resultado.";
DOC['0110'][3] = "El *Registro acumulador* envía la información al *Registro de datos*.";
DOC['0110'][4] = "El *Registro de datos* procede a la escritura de la información en la celda seleccionada por el *Registro de Direcciones*.";
DOC['0111'] = [];
DOC['0111'][1] = "El *Decodificador* intepreta que se finaliza el programa y se para la ejecución.";

// Comments for the special instructions
DOC['1000'] = DOC['1001'] = DOC['1010'] = [];
DOC['1000'][1] = DOC['1001'][1] = DOC['1010'][1] = "El *Registro acumulador* envía la información al *Registro de datos*.";
DOC['1000'][2] = DOC['1001'][2] = DOC['1010'][2] = "El *Registro de datos* envía la información al *Registro de entrada*.";
DOC['1000'][3] = DOC['1001'][3] = DOC['1010'][3] = "El *Circuito operacional* realiza la operación con SÓLO el *Registro de entrada* y lo almacena de nuevo en el *Registro acumulador*.";

// Créditos
var ABOUT =
    '<span><a target="_blank" href="http://xitrus.es">Pedro Gutiérrez</a></span>: diseño y desarrollo del simulador <br>' +
    '<span>Noemi Navarro</span>: documentación de la ejecución <br>' +
    '<span><a target="_blank" href="https://github.com/yuki/">Rubén Gómez</a></a></span>: ampliación del set de instrucciones <br>'

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
    DECODER.forEach (function(value, key) {
        r += '|  ' + key + '  |  ' + value + '  |  ' + INFOINST.get(key) +  '  |\n';
    })
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
    $('Deco').textContent = DECODER.get(type);
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