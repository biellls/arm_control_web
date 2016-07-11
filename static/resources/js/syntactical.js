var DEBUG_SYNTACTICAL = false;
var token;
var lookahead;

var errors;

//Possible first symbols for expression
var FirstSTMT = ['KW_IF', 'KW_WHILE', 'RW_END', 'KW_DEF', 'RW_SERVO', 'KW_GOTO',
                 'KW_GOSUB', 'KW_RETURN', 'S_EQUALS', 'ID', 'LABEL', 'KW_MOV',
                 'KW_MVS', 'ID_REF', 'KW_DLY', 'KW_HOPEN', 'KW_HCLOSE', 'KW_HLT',
                 'KW_JOVRD', 'KW_OVRD', 'KW_SPD', 'KW_SELECT', 'KW_FOR'];
var FirstEXP = ['KW_NOT', 'S_MINUS', 'REAL', 'INTEGER', 'STRING', 'ID', 'ID_REF',
                'S_OPENPAR', 'RW_SIN', 'RW_COS', 'RW_TAN', 'RW_RAD'];
var labels;

function analyze_text(text) {
    resetLexer();
    errors = [];
    lexer.setInput(text);
    token = lexer.lex();
    lookahead = lexer.lex();
    labels = text.match(/^[ \t]*\*[a-zA-Z][a-zA-Z0-9]*/mg)
    if (labels !== null && labels !== undefined) {
        labels = labels.map(function (x) {return x.trim().toLowerCase();});
    }
    A_PROGRAM();
    return errors;
}

////
// Helper functions
////
function isInFirst(tk, first) {
    return first.indexOf(tk['token']) > -1;
}

function next_token() {
    token = lookahead;
    lookahead = lexer.lex();

    //Report and skip unexpected characters
    while (token !== undefined && token['token'] === 'UNRECOGNIZED') {
        error_msg("Unrecognized token", token);
        token = lookahead;
        lookahead = lexer.lex();
    }

    //Skip multiple line jumps
    while (token !== undefined && lookahead !== undefined &&
           token['token'] === 'EOL' && lookahead['token'] === 'EOL') {
        token = lookahead;
        lookahead = lexer.lex();
    }

    if (DEBUG_SYNTACTICAL) {
        if (token !== undefined)
            console.log("Token: [" + token['token'] + ", " + token['value'] + "]");
        if (lookahead !== undefined)
            console.log("Lookahead: [" + lookahead['token'] + ", " + lookahead['value'] + "]");
    }
}

// Tks can be a single token or an array of tokens
//We have successfully recovered from the error if we find a token
//contained in tks
function attempt_error_recovery(tks) {
    if (typeof tks === 'string' || tks instanceof String) {
        tks = [tks];
    }
    while (token !== undefined && tks.indexOf(token['token']) === -1) {
        next_token();
    }
    if (token === undefined) {
        console.log('Error recovery failed');
        return false;
    }
    return true;
}

function error_msg(message, error_token) {
    var r = error_token === undefined ? row : error_token['row'];
    var v = error_token === undefined ? 'END OF FILE' : error_token['value'];
    if (v === '\n') {
        if (r !== 'EOF')
            r -= 1;
        v = "end of line";
    }
    var error_message = "ERROR in line " + r + ". " + message +
        " and instead found " + v;
    console.log(error_message);
    //errors.push(error_message);
    var error_message2 = "ERROR: "
    if (error_token === undefined) {
        error_message2 += message;
    } else {
        error_message2 += message;
        if (error_token['token'] !== 'UNRECOGNIZED')
            error_message2 += " and instead found " + v;
        else
            error_message2 += " " + v;
    }
    var error = {
        row: r - 1,   // zero based
        //column: error_token['col'], 
        text: error_message2,
        type: "error"
    };
    errors.push(error);
}

function raw_error_msg(message, line) {
    var error_message = "ERROR in line " + line + ". " + message;
    console.log(error_message);
    var error = {
        row: line - 1,   // zero based
        //column: error_token['col'], 
        text: message,
        type: "error"
    };
    errors.push(error);
}

function warning_msg(message, line) {
    var warning_message = "WARNING in line " + line + ". " + message;
    console.log(warning_message);
    var warning = {
        row: line - 1,   // zero based
        //column: error_token['col'], 
        text: message,
        type: "warning"
    };
    errors.push(warning);
}

function is_statement(tk) {
    return isInFirst(tk, FirstSTMT);
}

function is_expression(tk) {
    return isInFirst(tk, FirstEXP);
}

function is_compare_expression(tk) {
    return tk !== 'KW_NOT' && is_expression(tk);
}

function is_power_expression(tk) {
    return tk !== 'S_MINUS' && is_compare_expression(tk);
}

////
// Recursive descent parser
////
function A_PROGRAM() {
    A_STMTS();
    if (token !== undefined) {
        raw_error_msg("Expected program end", token['row']);
    }
}

function A_STMTS() {
    while (token !== undefined && is_statement(token)) {
        A_STMT();
        if (token !== undefined && token['token'] !== 'EOL') {
            error_msg("Expected line jump after statement", token);
            attempt_error_recovery('EOL');
        }
        next_token();
    }
}

function A_STMT() {
    var tk = token['token'];
    if (tk === 'KW_IF') {
        A_IF();
    } else if (tk === 'KW_WHILE') {
        A_WHILE();
    } else if (tk === 'KW_SELECT') {
        A_SELECT();
    } else if (tk === 'KW_FOR') {
        A_FOR();
    } else if (tk === 'KW_DEF') {
        A_DEF();
    } else if (tk === 'RW_SERVO') {
        A_SERVO();
    } else if (tk === 'KW_GOTO') {
        A_GOTO();
    } else if (tk === 'KW_GOSUB') {
        A_GOSUB();
    } else if (tk === 'KW_RETURN') {
        next_token();
    } else if (tk === 'LABEL') {
        next_token();
    } else if (tk === 'ID' || tk === 'ID_REF') {
        A_ASSIG();
    } else if (tk === 'KW_MOV') {
        A_MOV();
    } else if (tk === 'KW_MVS') {
        A_MVS();
    } else if (tk === 'KW_DLY') {
        A_DLY();
    } else if (tk === 'KW_HLT') {
        next_token();
    } else if (tk === 'KW_HOPEN') {
        A_HOPEN();
    } else if (tk === 'KW_HCLOSE') {
        A_HCLOSE();
    } else if (tk === 'KW_JOVRD') {
        A_JOVRD();
    } else if (tk === 'KW_OVRD') {
        A_OVRD();
    } else if (tk === 'KW_SPD') {
        A_SPD();
    } else if (tk === 'RW_END') {
        next_token();
    } else {
        return false;
    }
    return true;
}

function A_IF() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    //var tk = token['token'];
    //if (tk !== 'RW_TRUE' && tk != 'RW_FALSE') {
    //    error_msg("IF expression expected boolean", token);
    //    // TODO return if error recovery fails
    //    attempt_error_recovery(['KW_THEN', 'EOL']);
    //} else {
    //    next_token();
    //}
    A_EXP();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    var tk = token['token'];
    if (tk !== 'KW_THEN') {
        error_msg("Expected THEN after if condition", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    // Try to parse a statement
    if (!is_statement(token)) {
        error_msg("Expected statement", token);
        attempt_error_recovery("EOL");
        return;
    }
    A_STMT();
}

function A_WHILE() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    A_EXP();
    if (token !== undefined && token['token'] !== 'EOL') {
        error_msg("Expected line jump after while header", token);
        attempt_error_recovery('EOL');
    }
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    next_token();
    while (token !== undefined && !is_statement(token) &&
           token['token'] != "EOL" && token['token'] != 'KW_WEND') {
        error_msg("Expected statement", token);
        if (attempt_error_recovery("EOL")) {
            next_token();
        }
    }
    if (token !== undefined && is_statement(token)) {
        A_STMTS();
    }
    if (token === undefined || token['token'] !== 'KW_WEND') {
        error_msg("Expected WEND while loop", token);
        attempt_error_recovery('WEND');
        return;
    }
    next_token();
}

function A_SELECT() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    A_EXP();
    if (token !== undefined && token['token'] !== 'EOL') {
        error_msg("Expected line jump after select header", token);
        attempt_error_recovery('EOL');
    }
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    next_token();
    while (token !== undefined && (token['token'] === 'KW_CASE' ||
                                   token['token'] === 'KW_DEFAULT')) {
        var previous = token['token'];
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        }
        if (previous == 'KW_CASE') {
            A_EXP();
        }
        if (token !== undefined && token['token'] !== 'EOL') {
            error_msg("Expected line jump after case condition", token);
            attempt_error_recovery('EOL');
        }
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        }
        if (!is_statement(token)) {
            error_msg("Expected statement", token);
            attempt_error_recovery("EOL");
            return;
        }
        A_STMT();
        if (token !== undefined && token['token'] !== 'EOL') {
            error_msg("Expected line jump after case condition", token);
            attempt_error_recovery('EOL');
        }
        next_token();
        if (token !== undefined && token === 'KW_BREAK')
            next_token();
    }
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'RW_END') {
        error_msg("Expected END CASE", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'KW_SELECT') {
        error_msg("Expected END SELECT", token);
        attempt_error_recovery('EOL');
        next_token();
        return;
    }
    next_token();
    if (token['token'] !== 'EOL') {
        error_msg("Expected line jump after END SELECT", token);
        attempt_error_recovery('EOL');
    }
    next_token();
}

function A_FOR() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'ID') {
        error_msg("Expected ID", token);
        attempt_error_recovery(['S_EQUALS', 'EOL']);
        if (token !== undefined && token['token'] == 'EOL')
            return;
    } else {
        next_token();
    }
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'S_EQUALS') {
        error_msg("Expected comma ','", token);
        attempt_error_recovery(['KW_TO', 'EOL']);
        if (token !== undefined && token['token'] == 'EOL')
            return;
    } else {
        next_token();
    }
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'KW_TO')
        A_EXP();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'KW_TO') {
        error_msg("Expected TO", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    A_EXP();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] === 'KW_STEP') {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        }
        A_EXP();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        }
    }
    if (token['token'] !== 'EOL') {
        error_msg("Expected NEXT", token);
        attempt_error_recovery('EOL');
    }
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (!is_statement(token)) {
        error_msg("Expected statement", token);
        attempt_error_recovery("EOL");
        return;
    }
    A_STMTS();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'KW_NEXT') {
        error_msg("Expected NEXT", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'EOL') {
        A_ID_LIST();
    }
}

function A_DEF() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    tk = token['token'];
    if (tk !== 'KW_DOUBLE' && tk !== 'KW_CHAR' && tk !== 'KW_FLOAT' &&
       tk !== 'KW_INTE' && tk !== 'KW_POS') {
        error_msg("DEF expected [DOUBLE, CHAR, FLOAT, INTE, POS]", token);
        attempt_error_recovery(['ID', 'EOL']);
        if (token !== undefined && token['token'] === 'EOL') {
            next_token();
            return;
        }
    } else {
        next_token();
    }
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    } else if (token['token'] !== 'ID') {
        error_msg("Expected an ID", token);
        attempt_error_recovery('EOL');
        return;
    }
    A_ID_LIST();
}

function A_ID_LIST() {
    next_token();
    while (token !== undefined && token['token'] == 'S_COMMA') {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (token['token'] !== 'ID') {
            error_msg("Expected an ID", token);
            attempt_error_recovery(['ID', 'EOL']);
            if (token !== undefined && token['token'] === 'EOL') {
                next_token();
                return;
            }
        }
        next_token();
    }
}

function A_SERVO() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    } else if (token['token'] !== 'RW_ON' && token['token'] !== 'RW_OFF') {
        error_msg("Expected ON/OFF", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
}

function A_GOTO() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    } else if (token['token'] !== 'LABEL') {
        error_msg("Expected LABEL starting with *", token);
        attempt_error_recovery('EOL');
        return;
    } else {
        check_label(token['value']);
    }
    next_token();
}

function A_GOSUB() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    } else if (token['token'] !== 'LABEL') {
        error_msg("Expected LABEL starting with *", token);
        attempt_error_recovery('EOL');
        return;
    } else {
        check_label(token['value']);
    }
    next_token();
}

function check_label(label) {
    if (!label_exists(label)) {
        warning_msg('Label ' + label + ' is not defined', token['row']);
    }
    if (label.length > 9) {
        raw_error_msg('Label ' + label + ' exceeds max length 8', token['row']);
    }
}

function label_exists(label) {
    return labels !== null && labels !== undefined && labels.indexOf(label.toLowerCase()) !== -1;
}

function A_ASSIG() {
    var id_value = token['value'];
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    } else if (token['token'] === 'EOL') {
        raw_error_msg("Label needs to start with *", token['row'] - 1);
        attempt_error_recovery('EOL');
        return;
    } else if (token['token'] !== 'S_EQUALS') {
        var lm = levenshtein_match(id_value);
        if (lm !== null) {
            raw_error_msg("Invalid statement. Did you mean " + lm + " instead of " +
                          id_value + "?", token['row']);
        } else {
            error_msg("Expected assignment with =", token);
        }
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    } else if (!is_expression(token)) {
        error_msg("Expected expression", token);
        attempt_error_recovery('EOL');
        return;
    }
    A_EXP();
}

function A_EXP() {
    A_AND_EXP();
    if (token != undefined && token['token'] == 'KW_OR') {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (!is_expression(token)) {
            error_msg("Expected expression", token);
            attempt_error_recovery('EOL');
            return;
        }
        A_EXP();
    }
}

function A_AND_EXP() {
    A_NOT_EXP();
    if (token != undefined && token['token'] == 'KW_AND') {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (!is_expression(token)) {
            error_msg("Expected expression", token);
            attempt_error_recovery('EOL');
            return;
        }
        A_AND_EXP();
    }
}

function A_NOT_EXP() {
    if (token['token'] == 'KW_NOT') {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (!is_compare_expression(token)) {
            error_msg("Expected expression", token);
            attempt_error_recovery('EOL');
            return;
        }
    }
    A_COMPARE_EXP();
}

function A_COMPARE_EXP() {
    A_ADD_EXP();
    if (token !== undefined && is_compare_symbol(token['token'])) {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (!is_compare_expression(token)) {
            error_msg("Expected expression", token);
            attempt_error_recovery('EOL');
            return;
        }
        A_COMPARE_EXP();
    }
}

function is_compare_symbol(tk) {
    return ['S_EQUALS', 'S_LE', 'S_GE', 'S_LT', 'S_GT'].indexOf(tk) > -1;
}

function A_ADD_EXP() {
    A_MULT_EXP();
    if (token !== undefined && (token['token'] == 'S_PLUS' || token['token'] == 'S_MINUS')) {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (!is_compare_expression(token)) {
            error_msg("Expected expression", token);
            attempt_error_recovery('EOL');
            return;
        }
        A_ADD_EXP();
    }
}

function A_MULT_EXP() {
    A_NEG_EXP();
    if (token !== undefined && token['token'] === 'LABEL') {
        raw_error_msg("Add space after * to avoid confusion with label", token['row']);
        attempt_error_recovery('EOL');
        return;
    } else if (token !== undefined && (token['token'] === 'S_ASTERISK' || token['token'] === 'S_SLASH' || token['token'] === 'KW_MOD')) {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (!is_compare_expression(token)) {
            error_msg("Expected expression", token);
            attempt_error_recovery('EOL');
            return;
        }
        A_MULT_EXP();
    }
}

function A_NEG_EXP() {
    if (token['token'] === 'S_MINUS') {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (!is_power_expression(token)) {
            error_msg("Expected expression", token);
            attempt_error_recovery('EOL');
            return;
        }
    }
    A_POWER_EXP();
}

function A_POWER_EXP() {
    A_VAL();
    if (token !== undefined && token['token'] == 'S_HAT') {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (!is_power_expression(token)) {
            error_msg("Expected expression", token);
            attempt_error_recovery('EOL');
            return;
        }
        A_POWER_EXP();
    }
}

function is_trig_op(token) {
    return token['token'] === 'RW_SIN' || token['token'] === 'RW_COS' ||
        token['token'] === 'RW_TAN' || token['token'] === 'RW_RAD';
}

function A_VAL() {
    if (is_trig_op(token) || token['token'] == 'S_OPENPAR') {
        if (is_trig_op(token)) {
            next_token();
            if (token === undefined) {
                error_msg("Unexpected end of program", token);
                return;
            } else if (token['token'] !== 'S_OPENPAR') {
                error_msg("Expectec open parenthesis (", token);
                attempt_error_recovery('EOL');
                return;
            }
        }
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        } else if (!is_expression(token)) {
            error_msg("Expected expression", token);
            attempt_error_recovery('EOL');
            return;
        }
        A_EXP();
        if (token === undefined) {
            error_msg("Unexpected end of program (unclosed parenthesis)", token);
            return;
        } else if (token['token'] !== 'S_CLOSEPAR') {
            error_msg("Expected closing parenthesis )", token);
            attempt_error_recovery('EOL');
            return;
        }
        next_token();
    } else if (token['token'] === 'ID' || token['token'] === 'ID_REF') {
        next_token();
    } else {
        //Assert is CONST
        if (token['token'] !== 'INTEGER' && token['token'] !== 'STRING' &&
            token['token'] !== 'REAL') {
            error_msg("Expected constant value", token);
            attempt_error_recovery('EOL');
            return;
        }
        A_CONST();
    }
}

function A_CONST() {
    next_token();
}

function A_MOV() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    } else if (token['token'] !== 'ID') {
        error_msg("Expected ID", token);
        attempt_error_recovery('EOL');
        return;
    }
    check_point(token['value']);
    next_token();
    if (token !== undefined && token['token'] === 'S_COMMA') {
        next_token();
        if (token === undefined) {
            error_msg("Unexpected end of program", token);
            return;
        }
        if (token['token'] === 'S_PLUS' || token['token'] === 'S_MINUS') {
            next_token();
            if (token === undefined) {
                error_msg("Unexpected end of program", token);
                return;
            }
        }
        if (token['token'] !== 'INTEGER') {
            error_msg("Expected integer", token);
            attempt_error_recovery('EOL');
            return;
        }
        next_token();
    }
}

// Checks wether point is defined in Points tab
function check_point(point) {
    var points = get_points();
    if (points.indexOf(point.toLowerCase()) < 0) {
        warning_msg("Point " + point + " is not defined", token['row']);
    }
}

function get_points() {
    var point_inputs = $('.points');
    var points = [];
    for (var i in point_inputs) {
        var x = point_inputs[i].value;
        if (x !== undefined && x !== '')
            points.push(x.split(' ')[2].split('=')[0].toLowerCase());
    }
    return points;
}

function A_MVS() {
    A_MOV();
}

function A_DLY() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'INTEGER') {
        error_msg("Expected integer", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
}

function A_HOPEN() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'INTEGER') {
        error_msg("Expected integer", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
}

function A_HCLOSE() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'INTEGER') {
        error_msg("Expected integer", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
}

function A_JOVRD() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (token['token'] !== 'INTEGER') {
        error_msg("Expected integer", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
}

function A_OVRD() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (!is_expression(token)) {
        error_msg("Expected expression", token);
        attempt_error_recovery('EOL');
        return;
    }
    A_EXP();
}

function A_SPD() {
    next_token();
    if (token === undefined) {
        error_msg("Unexpected end of program", token);
        return;
    }
    if (!is_expression(token)) {
        error_msg("Expected expression", token);
        attempt_error_recovery('EOL');
        return;
    }
    A_EXP();
}

// Compute the edit distance between the two given strings
function levenshtein(a, b) {
    a = a.toUpperCase();
    b = b.toUpperCase();
    if (a.length === 0) return b.length; 
    if (b.length === 0) return a.length; 

    var matrix = [];

    // increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i-1) == a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1.5, // substitution
                                        Math.min(matrix[i][j-1] + 1, // insertion
                                                 matrix[i-1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
};

// Attempt correction with levenshtein
function levenshtein_match(tk) {
    var MAX_DIST, match = null, match_dist = 1000;
    if (tk.length > 3)
        MAX_DIST = 2.5;
    else
        MAX_DIST = 1.5;

    for (var i in FirstSTMT) {
        var candidate = FirstSTMT[i];
        if (candidate.startsWith('RW_') || candidate.startsWith('KW_'))
            candidate = candidate.substring(3);
        else
            continue;
        var d = levenshtein(tk, candidate);
        if (d <= MAX_DIST && d < match_dist) {
            match = candidate;
            match_dist = d;
        }
    }
    return match;
}
