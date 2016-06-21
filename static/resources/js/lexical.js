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
    lexer.addRule(new RegExp(keyword), function(lexeme) {
        return make_token('KW_'+ keyword, lexeme);
    });
}

function add_reserved_word_rule(rw) {
    lexer.addRule(new RegExp(rw), function(lexeme) {
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

// Add keywords
add_keyword_rule('WHILE');
add_keyword_rule('WEND');
add_keyword_rule('IF');
add_keyword_rule('THEN');

// Add reserved words and statements
add_reserved_word_rule('TRUE');
add_reserved_word_rule('FALSE');
add_reserved_word_rule('END');

// Numbers
lexer.addRule(/[0-9]+(?:\.[0-9]+)?\b/, function (lexeme) {
    return make_token('NUMBER', lexeme);
});

lexer.addRule(/[a-f\d]+/i, function (lexeme) {
    return make_token('HEX', lexeme);
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
