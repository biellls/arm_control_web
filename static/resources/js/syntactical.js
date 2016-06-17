var DEBUG_SYNTACTICAL = false;
var token;
var lookahead;

var errors;

function analyze_text(text) {
    resetLexer();
    errors = [];
    lexer.setInput(text);
    token = lexer.lex();
    lookahead = lexer.lex();
    A_PROGRAM();
    return errors.join('\n');
}

////
// Helper functions
////
function next_token() {
    token = lookahead;
    lookahead = lexer.lex();

    if (DEBUG_SYNTACTICAL) {
        if (token !== undefined)
            console.log("Token: [" + token['token'] + ", " + token['value'] + "]");
        if (lookahead !== undefined)
            console.log("Lookahead: [" + lookahead['token'] + ", " + lookahead['value'] + "]");
    }
}

function attempt_error_recovery(tk) {
    while (token !== undefined && token['token'] != tk) {
        next_token();
    }
    if (token === undefined) {
        console.log('Error recovery failed');
        return false;
    }
    return true;
}

function error_msg(message, error_token) {
    var error_message = "ERROR in line " + error_token['row'] + ". " + message +
        " and instead found " + error_token['value'];
    console.log(error_message);
    errors.push(error_message);
}

////
// Recursive descent parser
////
function A_PROGRAM() {
    A_STMTS();
}

function A_STMTS() {
    while (token !== undefined) {
        A_STMT();
        if (token !== undefined && token['token'] !== 'EOL') {
            error_msg("Expected line jump after statement", token);
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
    } else if (tk === 'RW_END') {
        next_token();
    } else {
        error_msg("Expected statement", token);
        attempt_error_recovery("EOL");
    }
}

function A_IF() {
    next_token();
    var tk = token['token'];
    if (tk !== 'RW_TRUE' && tk != 'RW_FALSE') {
        error_msg("IF expression expected boolean", token);
        // TODO return if error recovery fails
        attempt_error_recovery('KW_THEN');
    } else {
        next_token();
    }
    var tk = token['token'];
    if (tk !== 'KW_THEN') {
        error_msg("Expected THEN after if condition", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
    A_STMT();
}

function A_WHILE() {
    next_token();
    tk = token['token'];
    if (tk !== 'RW_TRUE' && tk != 'RW_FALSE') {
        error_msg("WHILE expression expected boolean", token);
        attempt_error_recovery('EOL');
    } else {
        next_token();
    }
    A_STMTS();
    var tk = token['token'];
    if (tk !== 'KW_THEN') {
        error_msg("Expected THEN after if condition", token);
        attempt_error_recovery('EOL');
        return;
    }
    next_token();
    A_STMT();
}
