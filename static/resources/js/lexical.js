var row = 1;
var col = 1;

function resetLexer() {
    row = 1;
    col = 1;
}

function make_token(token, value) {
    col += value.length;
    return {
        'token': token,
        'value': value,
        'row': row,
        'col': col
    }
}

function add_keyword_rule(keyword) {
    lexer.addRule(new RegExp(keyword, 'i'), function(lexeme) {
        return make_token('KW_'+ keyword, lexeme);
    });
}

function add_reserved_word_rule(rw) {
    lexer.addRule(new RegExp(rw, 'i'), function(lexeme) {
        return make_token('RW_'+ rw, lexeme);
    });
}

var lexer = new Lexer(function (char) {
    //throw new Error("Unexpected character at row " + row + ", col " + col + ": " + char);
});

// Handle line jump
lexer.addRule(/\n/, function () {
    row++;
    col = 1;
    return make_token("EOL", '\n');
});
// Skip spaces
lexer.addRule(/[ \f\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/, function (lexeme) {
    col += lexeme.length;
});

// Skip comments
lexer.addRule(/'[^\n]*/, function() {
    //row++;
    //col = 1;
    //return make_token("EOL", '\n');
});

// Add keywords
add_keyword_rule('WHILE');
add_keyword_rule('WEND');
add_keyword_rule('IF');
add_keyword_rule('THEN');
add_keyword_rule('DEF');
add_keyword_rule('DOUBLE');
add_keyword_rule('CHAR');
add_keyword_rule('FLOAT');
add_keyword_rule('INTE');
add_keyword_rule('POS');
add_keyword_rule('GOTO');
add_keyword_rule('GOSUB');
add_keyword_rule('RETURN');
add_keyword_rule('NOT');
add_keyword_rule('OR');
add_keyword_rule('AND');
add_keyword_rule('MOV');
add_keyword_rule('MVS');
add_keyword_rule('MOD');
add_keyword_rule('DLY');
add_keyword_rule('HLT');
add_keyword_rule('HOPEN');
add_keyword_rule('HCLOSE');
add_keyword_rule('JOVRD');
add_keyword_rule('OVRD');
add_keyword_rule('SPD');
add_keyword_rule('SELECT');
add_keyword_rule('CASE');
add_keyword_rule('BREAK');
add_keyword_rule('DEFAULT');
add_keyword_rule('FOR');
add_keyword_rule('TO');
add_keyword_rule('STEP');
add_keyword_rule('NEXT');

// Add reserved words and statements
add_reserved_word_rule('TRUE');
add_reserved_word_rule('FALSE');
add_reserved_word_rule('END');
add_reserved_word_rule('SERVO');
add_reserved_word_rule('ON');
add_reserved_word_rule('OFF');
add_reserved_word_rule('SIN');
add_reserved_word_rule('COS');
add_reserved_word_rule('TAN');
add_reserved_word_rule('RAD');

// Labels
lexer.addRule(/\*[a-zA-Z][a-zA-Z0-9-_]*/, function (lexeme) {
    return make_token('LABEL', lexeme);
});

//Add symbols
lexer.addRule(/,/, function (lexeme) {
    return make_token('S_COMMA', lexeme);
});
lexer.addRule(/=/, function (lexeme) {
    return make_token('S_EQUALS', lexeme);
});
lexer.addRule(/\+/, function (lexeme) {
    return make_token('S_PLUS', lexeme);
});
lexer.addRule(/-/, function (lexeme) {
    return make_token('S_MINUS', lexeme);
});
lexer.addRule(/\//, function (lexeme) {
    return make_token('S_SLASH', lexeme);
});
lexer.addRule(/\*/, function (lexeme) {
    return make_token('S_ASTERISK', lexeme);
});
lexer.addRule(/\^/, function (lexeme) {
    return make_token('S_HAT', lexeme);
});
lexer.addRule(/\(/, function (lexeme) {
    return make_token('S_OPENPAR', lexeme);
});
lexer.addRule(/\)/, function (lexeme) {
    return make_token('S_CLOSEPAR', lexeme);
});
lexer.addRule(/<=/, function (lexeme) {
    return make_token('S_LE', lexeme);
});
lexer.addRule(/>=/, function (lexeme) {
    return make_token('S_GE', lexeme);
});
lexer.addRule(/</, function (lexeme) {
    return make_token('S_LT', lexeme);
});
lexer.addRule(/>/, function (lexeme) {
    return make_token('S_GT', lexeme);
});

// Numbers
//lexer.addRule(/[0-9]+(?:\.[0-9]+)?\b/, function (lexeme) {
//Real
lexer.addRule(/[0-9]+\.[0-9]+/, function (lexeme) {
    return make_token('REAL', lexeme);
});
//Integer
lexer.addRule(/[0-9]+/, function (lexeme) {
    return make_token('INTEGER', lexeme);
});

// Id pos reference
lexer.addRule(/[a-zA-Z]+\.[xyzXYZabcABC]/, function (lexeme) {
    return make_token('ID_REF', lexeme);
});

// Identifiers
lexer.addRule(/[a-zA-Z]+/, function (lexeme) {
    return make_token('ID', lexeme);
});

// Error: Unexpected character
lexer.addRule(/./, function (lexeme) {
    //this.reject = true;
    col++;
    return make_token('UNRECOGNIZED', lexeme);
});


// var tokens = lexer.lex();
